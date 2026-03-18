import { useState } from 'react';
import { useMcpClient } from '../lib/mcp-client';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

interface ToolExecutorProps {
  tool: any;
  authMode: 'secret' | 'wallet';
  secretKey: string;
  walletAddress: string | null;
  onClose: () => void;
}

export function ToolExecutor({
  tool,
  authMode,
  secretKey,
  walletAddress,
  onClose,
}: ToolExecutorProps) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { executeTool } = useMcpClient();

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Call MCP tool to get unsigned XDR
      const toolResult = await executeTool(tool.name, params);
      const { xdr, simulationResult } = toolResult;

      if (authMode === 'secret') {
        // Secret Key Mode: Use sign-and-submit MCP tool
        const submitResult = await executeTool('sign-and-submit', {
          xdr,
          secretKey,
        });
        setResult(submitResult);
      } else {
        // Wallet Mode: Use prepare-transaction + wallet SDK

        // Step 2: Call prepare-transaction to get wallet-ready XDR + preview
        const prepareResult = await executeTool('prepare-transaction', {
          xdr,
          walletAddress: walletAddress!,
          toolName: tool.name,
          params,
          simulationResult,
        });

        const { walletReadyXdr, preview } = prepareResult as { walletReadyXdr: string, preview: { network: WalletNetwork } };


        // Step 3: Wallet signs and submits
        const kit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: 'freighter',
          modules: allowAllModules(),
        });

        const signedXdr = await kit.signTransaction(walletReadyXdr, {
          address: walletAddress!,
          networkPassphrase: preview.network,
        });

        setResult({
          signedXdr,
          status: 'SUCCESS',
          preview,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{tool.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">{tool.description}</p>

        {/* Dynamic form based on tool schema */}
        <div className="space-y-4">
          {Object.entries(tool.inputSchema?.properties || {}).map(
            ([key, schema]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key}
                </label>
                <input
                  type={schema.type === 'number' ? 'number' : 'text'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={schema.description}
                  onChange={(e) =>
                    setParams({ ...params, [key]: e.target.value })
                  }
                />
              </div>
            )
          )}
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Executing...' : 'Execute'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
