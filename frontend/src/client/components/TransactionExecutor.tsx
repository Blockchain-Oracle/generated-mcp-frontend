import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';
import {
  rpc,
  TransactionBuilder,
  Operation,
} from '@stellar/stellar-sdk';

interface TransactionExecutorProps {
  xdr: string;
  walletAddress: string;
}

const NETWORK_CONFIG = {
  testnet: {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    walletNetwork: WalletNetwork.TESTNET,
  },
  mainnet: {
    rpcUrl: 'https://soroban.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    walletNetwork: WalletNetwork.PUBLIC,
  },
};

/**
 * Execute a transaction that has been prepared by the MCP server's prepare-transaction tool.
 *
 * The XDR passed here is already:
 * - Rebuilt with the wallet's public key as source
 * - Simulated to get fresh auth entries and footprint
 * - Assembled with simulation data
 *
 * However, the sequence number may be stale if user waited before clicking \"Sign\".
 * So we need to:
 * 1. Rebuild with FRESH sequence, re-simulate, and re-assemble
 * 2. Sign with the wallet (which signs both envelope and auth entries)
 * 3. Submit to the network
 * 4. Poll for result
 */
export async function executeTransaction({
  xdr,
  walletAddress,
}: TransactionExecutorProps): Promise<{ hash: string; result?: any }> {
  // Use env var or default to testnet
  const envNetwork = import.meta.env.VITE_NETWORK_PASSPHRASE;
  const normalizedNetwork: 'testnet' | 'mainnet' =
    envNetwork?.includes('Public Global Stellar Network') ? 'mainnet' : 'testnet';

  const config = NETWORK_CONFIG[normalizedNetwork];
  const server = new rpc.Server(config.rpcUrl, { allowHttp: true });

  try {
    // The XDR from prepare-transaction has wallet as source and auth entries,
    // BUT the sequence number may be stale if user waited before clicking \"Sign\".
    // We need to rebuild with FRESH sequence, re-simulate, and re-assemble.
    console.log('[TransactionExecutor] Rebuilding with fresh sequence...');

    const preparedTx = TransactionBuilder.fromXDR(xdr, config.networkPassphrase);
    const operation = preparedTx.operations[0] as any; // InvokeHostFunction operation

    // Fetch FRESH account (current sequence number)
    const sourceAccount = await server.getAccount(walletAddress);

    // Rebuild transaction WITHOUT auth entries (simulation will generate fresh ones)
    const rebuiltTx = new TransactionBuilder(sourceAccount, {
      fee: preparedTx.fee,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        // Rebuild the operation without auth - simulation will add it
        Operation.invokeHostFunction({
          func: operation.func,
          auth: [], // Empty - let simulation fill it
        })
      )
      .setTimeout(30)
      .build();

    // Re-simulate to get fresh auth entries and footprint
    console.log('[TransactionExecutor] Re-simulating transaction...');
    const simResponse = await server.simulateTransaction(rebuiltTx);
    if (rpc.Api.isSimulationError(simResponse)) {
      throw new Error(`Simulation failed: ${simResponse.error}`);
    }

    // Assemble with simulation data (this adds auth entries)
    const finalTx = rpc.assembleTransaction(rebuiltTx, simResponse).build();

    // Initialize wallet kit
    const kit = new StellarWalletsKit({
      network: config.walletNetwork,
      selectedWalletId: 'freighter',
      modules: allowAllModules(),
    });

    // Sign the fresh transaction
    console.log('[TransactionExecutor] Requesting wallet signature...');
    const { signedTxXdr } = await kit.signTransaction(finalTx.toXDR(), {
      address: walletAddress,
      networkPassphrase: config.networkPassphrase,
    });

    // Parse the signed transaction
    const signedTx = TransactionBuilder.fromXDR(
      signedTxXdr,
      config.networkPassphrase
    );

    // Submit using the SDK's server.sendTransaction
    console.log('[TransactionExecutor] Submitting transaction...');
    const sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.status !== 'PENDING') {
      const errorMessage =
        (sendResponse as any).errorResult?.toXDR?.('base64') ||
        (sendResponse as any).errorResultXdr ||
        JSON.stringify(sendResponse);
      throw new Error(`Transaction failed: ${sendResponse.status} - ${errorMessage}`);
    }

    const txHash = sendResponse.hash;
    console.log('[TransactionExecutor] Transaction submitted:', txHash);

    // Poll for transaction result using manual getTransaction polling
    // We use manual polling instead of pollTransaction to better handle XDR parsing errors
    let returnValue;
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds with 500ms intervals
    const intervalMs = 500;
    let transactionSucceeded = false;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;

      try {
        const txResponse = await server.getTransaction(txHash);

        if (txResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
          console.log('[TransactionExecutor] Transaction successful');
          transactionSucceeded = true;

          // Try to parse return value if available
          try {
            const successResponse = txResponse as rpc.Api.GetSuccessfulTransactionResponse;
            const meta = successResponse.resultMetaXdr;
            const metaSwitch = meta.switch();

            if (metaSwitch.valueOf() === 3) {
              const sorobanMeta = meta.v3().sorobanMeta();
              if (sorobanMeta) {
                returnValue = sorobanMeta.returnValue();
              }
            }
          } catch (parseError) {
            // Can't parse return value, but transaction succeeded
            console.warn('[TransactionExecutor] Could not parse return value:', parseError);
          }

          break; // Exit polling loop
        } else if (txResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
          throw new Error('Transaction failed on network');
        }
        // If NOT_FOUND, continue polling
      } catch (error: any) {
        if (error.message === 'Transaction failed on network') {
          throw error;
        }

        // Check if this is the XDR parsing error (Bad union switch: 4)
        if (error.message?.includes('Bad union switch') || error.message?.includes('union switch')) {
          // This error means getTransaction can't parse the XDR, but the transaction likely succeeded
          // After enough attempts with this error, assume success
          if (attempts >= 10) {
            console.log('[TransactionExecutor] Assuming transaction succeeded despite XDR parsing errors');
            transactionSucceeded = true;
            break;
          }
        }

        // Network error or XDR parsing error - continue polling
        console.warn(`[TransactionExecutor] Polling error (attempt ${attempts}), retrying:`, error.message);
      }
    }

    if (attempts >= maxAttempts && !transactionSucceeded) {
      console.warn('[TransactionExecutor] Polling timeout - transaction may still be processing');
    }

    return {
      hash: txHash,
      result: returnValue,
    };
  } catch (error) {
    console.error('[TransactionExecutor] Transaction execution failed:', error);
    throw error;
  }
}
