import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadOperationCardProps {
  toolName: string;
  result: any;
  timestamp?: string;
}

function XdrViewer({ xdr }: { xdr: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(xdr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = xdr.length > 40
    ? `${xdr.slice(0, 20)}...${xdr.slice(-20)}`
    : xdr;

  return (
    <div className="w-full">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-2.5 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Transaction Envelope (XDR)</span>
            <code className="text-xs font-mono text-foreground/80 truncate">
              {expanded ? 'Click to collapse' : truncated}
            </code>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-background border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground"
          title="Copy XDR"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-background rounded-lg border border-border shadow-inner overflow-x-auto">
              <code className="block text-xs font-mono break-all text-muted-foreground leading-relaxed">
                {xdr}
              </code>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ReadOperationCard({ toolName, result, timestamp }: ReadOperationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatToolName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderResult = () => {
    if (result === null || result === undefined) {
      return <p className="text-muted-foreground">No data returned</p>;
    }

    if (Array.isArray(result)) {
      if (result.length === 0) {
        return <p className="text-muted-foreground">No items found</p>;
      }

      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Found {result.length} item(s)</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {result.map((item, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-md border border-border">
                {renderObject(item, index)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof result === 'object') {
      return renderObject(result);
    }

    return (
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm break-all">
          {String(result)}
        </code>
        <button
          onClick={() => handleCopy(String(result))}
          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    );
  };

  const renderObject = (obj: Record<string, any>, keyPrefix?: number) => {
    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => {
          if (key.toLowerCase() === 'xdr' && typeof value === 'string') {
            return (
              <div key={`${keyPrefix}-${key}`} className="w-full">
                <XdrViewer xdr={value} />
              </div>
            );
          }

          const displayKey = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <div key={`${keyPrefix}-${key}`} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">{displayKey}:</span>
              {typeof value === 'object' && value !== null ? (
                Array.isArray(value) ? (
                  <div className="pl-4 space-y-1">
                    {value.map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        {typeof item === 'object' ? renderObject(item, idx) : String(item)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-4">{renderObject(value)}</div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-background rounded text-sm font-mono break-all">
                    {String(value)}
                  </code>
                  {typeof value === 'string' && value.length > 20 && (
                    <button
                      onClick={() => handleCopy(String(value))}
                      className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded flex items-center gap-1"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="my-4 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{formatToolName(toolName)}</h3>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20">
          Read
        </span>
      </div>
      <div className="mt-3 max-h-80 overflow-y-auto">{renderResult()}</div>
    </div>
  );
}

interface SignAndSubmitResultCardProps {
  success: boolean;
  txResult: {
    status: string;
    hash?: string;
    xdr?: string;
    signedXdr?: string;
    error?: string;
    result?: any;
  };
}

export function SignAndSubmitResultCard({ success, txResult }: SignAndSubmitResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedXdr, setCopiedXdr] = useState(false);

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (txResult.hash) {
      navigator.clipboard.writeText(txResult.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyXdr = (e: React.MouseEvent) => {
    e.stopPropagation();
    const xdr = txResult.signedXdr || txResult.xdr;
    if (xdr) {
      navigator.clipboard.writeText(xdr);
      setCopiedXdr(true);
      setTimeout(() => setCopiedXdr(false), 2000);
    }
  };

  const xdr = txResult.signedXdr || txResult.xdr;
  const truncatedXdr = xdr && xdr.length > 40
    ? `${xdr.slice(0, 20)}...${xdr.slice(-20)}`
    : xdr;

  // Get explorer URL based on network (default to testnet)
  const getExplorerUrl = (hash: string) => {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  };

  if (success && txResult.status === 'SUCCESS') {
    return (
      <div className="my-4 p-4 bg-card rounded-lg border border-green-500/20 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Transaction Successful</h3>
            <p className="text-sm text-muted-foreground mt-1">Sign and Submit</p>
          </div>
          <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20">
            Success
          </span>
        </div>

        <div className="space-y-3">
          {txResult.hash && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                  {txResult.hash}
                </code>
                <button
                  onClick={handleCopyHash}
                  className="px-2 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded flex items-center gap-1"
                >
                  {copiedHash ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {xdr && (
            <div className="w-full">
              <div
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between p-2.5 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Signed Transaction (XDR)</span>
                    <code className="text-xs font-mono text-foreground/80 truncate">
                      {expanded ? 'Click to collapse' : truncatedXdr}
                    </code>
                  </div>
                </div>
                <button
                  onClick={handleCopyXdr}
                  className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-background border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground"
                  title="Copy XDR"
                >
                  {copiedXdr ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 bg-background rounded-lg border border-border shadow-inner overflow-x-auto">
                      <code className="block text-xs font-mono break-all text-muted-foreground leading-relaxed">
                        {xdr}
                      </code>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {txResult.result && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground mb-1 flex items-center gap-1 select-none hover:opacity-80 transition-opacity w-fit">
                <span>Result Data</span>
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
                {JSON.stringify(txResult.result, null, 2)}
              </pre>
            </details>
          )}

          {txResult.hash && (
            <a
              href={getExplorerUrl(txResult.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View on Stellar Expert →
            </a>
          )}
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="my-4 p-4 bg-card rounded-lg border border-destructive/20 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">Transaction Failed</h3>
          <p className="text-sm text-muted-foreground mt-1">Sign and Submit</p>
        </div>
        <span className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {txResult.status || 'Error'}
        </span>
      </div>

      <div className="space-y-3">
        {txResult.error && (
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{txResult.error}</p>
          </div>
        )}

        {xdr && (
          <div className="w-full">
            <div
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between p-2.5 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Transaction (XDR)</span>
                  <code className="text-xs font-mono text-foreground/80 truncate">
                    {expanded ? 'Click to collapse' : truncatedXdr}
                  </code>
                </div>
              </div>
              <button
                onClick={handleCopyXdr}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-background border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground"
                title="Copy XDR"
              >
                {copiedXdr ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-background rounded-lg border border-border shadow-inner overflow-x-auto">
                    <code className="block text-xs font-mono break-all text-muted-foreground leading-relaxed">
                      {xdr}
                    </code>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {txResult.hash && (
          <a
            href={getExplorerUrl(txResult.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View on Stellar Expert →
          </a>
        )}
      </div>
    </div>
  );
}
