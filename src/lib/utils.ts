// Signing utilities
import {
  Keypair,
  rpc,
  authorizeEntry,
  TransactionBuilder,
  Operation,
} from '@stellar/stellar-sdk';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

/**
 * Result of preparing a transaction for wallet signing
 */
export interface PrepareTransactionResult {
  walletReadyXdr: string;
  simulationResult: {
    minResourceFee: string;
    cost: {
      cpuInsns: string;
      memBytes: string;
    };
    latestLedger: number;
  };
}

/**
 * Prepare a transaction for wallet signing by re-simulating with the wallet's address
 *
 * This is needed because the original XDR was built with a dummy/null source account.
 * For wallet signing, we need to:
 * 1. Parse the original transaction to get the contract call details
 * 2. Rebuild the transaction with the wallet's public key as source
 * 3. Re-simulate to get fresh auth entries, footprint and resources
 * 4. The simulation will return auth entries that the wallet needs to sign
 *
 * NOTE: This approach works because `assembleTransaction` pulls the auth entries
 * from the simulation response. The simulation generates auth entries based on
 * what `require_auth` calls are made during the simulated execution. Since the
 * function args contain the deployer address (not the source account), the auth
 * entries will be for that deployer address - which should match the wallet.
 *
 * IMPORTANT: The deployer address in the function args MUST match the wallet address.
 * If they don't match, the simulation will generate auth entries for the wrong address
 * and the wallet won't be able to sign them.
 *
 * @param xdr - Original transaction XDR (built without publicKey)
 * @param walletAddress - The wallet's public key (G...) to prepare transaction for
 * @returns Wallet-ready XDR and simulation result
 */
export async function prepareTransactionForWallet(
  originalXdr: string,
  walletAddress: string
): Promise<PrepareTransactionResult> {
  const server = new rpc.Server(RPC_URL, { allowHttp: true });

  // Step 1: Parse original transaction
  const originalTx = TransactionBuilder.fromXDR(originalXdr, NETWORK_PASSPHRASE);
  const operation = originalTx.operations[0] as Operation.InvokeHostFunction;

  // Step 2: Get fresh account for the wallet (this gives us a fresh sequence number)
  const sourceAccount = await server.getAccount(walletAddress);

  // Step 3: Rebuild transaction with wallet as source, but WITHOUT auth entries
  // Let the simulation generate fresh auth entries
  const rebuiltTx = new TransactionBuilder(sourceAccount, {
    fee: originalTx.fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeHostFunction({
        func: operation.func,
        auth: [], // Empty auth - let simulation fill it in
      })
    )
    .setTimeout(30)
    .build();

  // Step 4: Simulate to get fresh auth entries and footprint/resources
  const simResponse = await server.simulateTransaction(rebuiltTx);
  if (rpc.Api.isSimulationError(simResponse)) {
    throw new Error(`Simulation failed: ${simResponse.error}`);
  }

  // Step 5: Assemble with simulation data
  // This pulls auth entries from simResponse.result.auth
  const finalTx = rpc.assembleTransaction(rebuiltTx, simResponse).build();

  // Extract simulation result info
  const successResponse = simResponse as rpc.Api.SimulateTransactionSuccessResponse;

  // Extract cost information, being defensive since types don't specify cost/mem usage directly
  let cpuInsns = '0';
  let memBytes = '0';
  if (successResponse.result && typeof (successResponse.result as any).cost === "object") {
    cpuInsns = (successResponse.result as any).cost?.cpuInsns ?? '0';
    memBytes = (successResponse.result as any).cost?.memBytes ?? '0';
  }

  return {
    walletReadyXdr: finalTx.toXDR(),
    simulationResult: {
      minResourceFee: successResponse.minResourceFee || '0',
      cost: {
        cpuInsns,
        memBytes,
      },
      latestLedger: successResponse.latestLedger,
    },
  };
}

/**
 * Sign auth entries and optionally the transaction envelope
 *
 * This function applies the "rebuild with fresh sequence" pattern:
 * 1. Parse XDR directly (no Client dependency)
 * 2. Sign auth entries using SDK's authorizeEntry()
 * 3. Fetch fresh account (fresh sequence number)
 * 4. Rebuild transaction with fresh sequence
 * 5. Re-simulate for fresh footprint/resources
 * 6. Sign envelope and return
 *
 * @param xdr - Unsigned transaction XDR
 * @param secretKey - Secret key for signing
 * @param signEnvelope - If true, also signs the transaction envelope (default: true)
 * @returns Signed XDR (with auth entries, and optionally envelope signature)
 */
export async function signTransaction(
  xdr: string,
  secretKey: string,
  signEnvelope: boolean = true
): Promise<string> {
  const keypair = Keypair.fromSecret(secretKey);
  const server = new rpc.Server(RPC_URL, { allowHttp: true });

  // Step 1: Parse original transaction
  const originalTx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
  const operation = originalTx.operations[0] as Operation.InvokeHostFunction;

  // Step 2: Get current ledger for auth expiration
  const ledgerSeq = (await server.getLatestLedger()).sequence;
  const validUntilLedger = ledgerSeq + 100;

  // Step 3: Sign auth entries that need signing by this keypair
  const signedAuth: typeof operation.auth = [];
  if (operation.auth) {
    for (const entry of operation.auth) {
      const creds = entry.credentials();
      // Check if this is an address credential that matches our keypair
      if (creds.switch().name === 'sorobanCredentialsAddress') {
        try {
          const address = creds.address().address();
          const accountId = address.accountId();
          if (accountId) {
            const pubKeyHex = accountId.ed25519()?.toString('hex');
            const keypairHex = keypair.rawPublicKey().toString('hex');
            if (pubKeyHex === keypairHex) {
              // Sign this auth entry (authorizeEntry is async!)
              const signed = await authorizeEntry(
                entry,
                keypair,
                validUntilLedger,
                NETWORK_PASSPHRASE
              );
              signedAuth.push(signed);
              continue;
            }
          }
        } catch {
          // If we can't parse the address, just keep the entry as-is
        }
      }
      // Keep entry unchanged if we don't need to sign it
      signedAuth.push(entry);
    }
  }

  // Step 4: Fetch fresh account (current sequence number)
  const sourceAccount = await server.getAccount(keypair.publicKey());

  // Step 5: Rebuild transaction with fresh sequence, preserving signed auth
  const rebuiltTx = new TransactionBuilder(sourceAccount, {
    fee: originalTx.fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeHostFunction({
        func: operation.func,
        auth: signedAuth,
      })
    )
    .setTimeout(30)
    .build();

  // Step 6: Simulate to get fresh footprint/resources
  const simResponse = await server.simulateTransaction(rebuiltTx);
  if (rpc.Api.isSimulationError(simResponse)) {
    throw new Error(`Simulation failed: ${simResponse.error}`);
  }

  // Step 7: Assemble with simulation data
  const finalTx = rpc.assembleTransaction(rebuiltTx, simResponse).build();

  // Step 8: Optionally sign envelope
  if (signEnvelope) {
    finalTx.sign(keypair);
  }

  return finalTx.toXDR();
}
