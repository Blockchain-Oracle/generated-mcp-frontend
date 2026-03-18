// Transaction submission using Stellar SDK
import {
  TransactionBuilder,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk';

const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';

export interface SubmitResult {
  hash: string;
  status: string;
  parsedResult?: unknown;
  resultMetaXdr?: string;
}

/**
 * Submit a signed transaction to the Stellar network
 *
 * NOTE: This function expects the transaction to already be signed!
 * Use this after signing with signAuthEntries + sign in the MCP tool.
 *
 * @param signedXdr - Signed transaction XDR
 * @returns Submission result with hash and parsed response
 */
export async function submitTransaction(
  signedXdr: string
): Promise<SubmitResult> {
  const server = new rpc.Server(RPC_URL, { allowHttp: true });

  // Parse the signed transaction
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  // Submit to network
  const response = await server.sendTransaction(tx);

  if (response.status !== 'PENDING') {
    const errorMessage =
      (response as any).errorResult?.toXDR?.('base64') ||
      (response as any).errorResultXdr ||
      JSON.stringify(response);
    throw new Error(`Transaction failed: ${response.status} - ${errorMessage}`);
  }

  // Poll for result using SDK's pollTransaction
  const txResult = await server.pollTransaction(response.hash, {
    sleepStrategy: () => 500,
    attempts: 60, // 30 seconds total
  });

  // Parse result if available
  let parsedResult;
  let resultMetaXdrString: string | undefined;

  // Type guard: only SUCCESS and FAILED have resultMetaXdr
  if (txResult.status === 'SUCCESS' || txResult.status === 'FAILED') {
    // Now TypeScript knows txResult has resultMetaXdr
    resultMetaXdrString = txResult.resultMetaXdr.toXDR('base64');

    if (txResult.status === 'SUCCESS') {
      try {
        // Try to get return value - handle different meta versions
        const meta = txResult.resultMetaXdr;
        const metaSwitch = meta.switch();

        if (metaSwitch.value === 3) {
          const sorobanMeta = meta.v3().sorobanMeta();
          if (sorobanMeta) {
            parsedResult = scValToNative(sorobanMeta.returnValue());
          }
        }
      } catch {
        // Result parsing failed, but transaction succeeded
        parsedResult = 'Transaction succeeded (result parsing unavailable)';
      }
    }
  }

  return {
    hash: response.hash,
    status: txResult.status,
    parsedResult,
    resultMetaXdr: resultMetaXdrString,
  };
}
