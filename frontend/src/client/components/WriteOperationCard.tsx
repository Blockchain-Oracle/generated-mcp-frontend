import { useState } from 'react';

interface WriteOperationCardProps {
  toolName: string;
  params: Record<string, any>;
  transaction: {
    xdr?: string;
    contractAddress?: string;
    method?: string;
    network?: string;
    [key: string]: any;
  };
  onSign?: (xdr: string) => Promise<{ hash: string; result?: any }>;
  walletAddress?: string | null;
}

export function WriteOperationCard({
  toolName,
  params,
  transaction,
  onSign,
  walletAddress,
}: WriteOperationCardProps) {
  const [signing, setSigning] = useState(false);
  const [result, setResult] = useState<{ hash: string; result?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatToolName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatParamKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSign = async () => {
    if (!onSign || !transaction.xdr) {
      setError('No signing function or XDR provided');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      const txResult = await onSign(transaction.xdr);
      setResult(txResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign transaction');
    } finally {
      setSigning(false);
    }
  };

  // Show success state
  if (result) {
    return (
      <div className="my-4 p-4 bg-card rounded-lg border border-green-500/20 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Transaction Successful</h3>
            <p className="text-sm text-muted-foreground mt-1">{formatToolName(toolName)}</p>
          </div>
          <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20">
            Success
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Transaction Hash:</p>
            <code className="block px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
              {result.hash}
            </code>
          </div>

          {result.result && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground mb-1 flex items-center gap-1 select-none hover:opacity-80 transition-opacity w-fit">
                <span>Result</span>
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <pre className="px-3 py-2 bg-muted rounded-md font-mono text-xs overflow-x-auto mt-1">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </details>
          )}

          <a
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View on Stellar Expert →
          </a>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="my-4 p-4 bg-card rounded-lg border border-destructive/20 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Transaction Failed</h3>
            <p className="text-sm text-muted-foreground mt-1">{formatToolName(toolName)}</p>
          </div>
          <span className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            Error
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>

          <button
            onClick={handleSign}
            disabled={signing}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show pending/ready to sign state
  return (
    <div className="my-4 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{formatToolName(toolName)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Ready to sign</p>
        </div>
        <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md border border-orange-500/20">
          Write
        </span>
      </div>

      <div className="space-y-4">
        {/* Transaction Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Transaction Details</h4>
          <div className="p-3 bg-muted/50 rounded-md border border-border space-y-2">
            {transaction.contractAddress && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Contract:</span>
                <code className="block mt-1 text-xs font-mono break-all">
                  {transaction.contractAddress}
                </code>
              </div>
            )}
            {transaction.method && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Method:</span>
                <code className="block mt-1 text-xs font-mono">{transaction.method}</code>
              </div>
            )}
            {transaction.network && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Network:</span>
                <code className="block mt-1 text-xs font-mono">{transaction.network}</code>
              </div>
            )}
          </div>
        </div>

        {/* Parameters */}
        {Object.keys(params).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Parameters</h4>
            <div className="p-3 bg-muted/50 rounded-md border border-border space-y-2">
              {Object.entries(params).map(([key, value]) => (
                <div key={key}>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatParamKey(key)}:
                  </span>
                  <code className="block mt-1 px-2 py-1 bg-background rounded text-xs font-mono break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Button */}
        <div className="pt-2 border-t border-border">
          {walletAddress ? (
            <button
              onClick={handleSign}
              disabled={signing || !onSign}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {signing ? 'Signing...' : 'Sign & Submit Transaction'}
            </button>
          ) : (
            <div className="p-3 bg-muted/50 border border-border rounded-md">
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to sign this transaction
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
