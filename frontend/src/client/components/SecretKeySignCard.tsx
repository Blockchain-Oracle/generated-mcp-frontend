import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecretKeySignCardProps {
  toolName: string;
  params?: Record<string, any>;
  xdr: string;
  simulationResult?: any;
  onSignRequest: (secretKey: string) => void;
  isSigningInProgress?: boolean;
}

/**
 * Component for signing transactions with a secret key.
 *
 * This component displays transaction details and collects the secret key from the user.
 * When user clicks "Sign & Submit", it calls the onSignRequest callback with the secret key.
 * The parent component is responsible for:
 * 1. Storing the XDR in state (pendingXdr)
 * 2. Sending the chat message with the secret key
 * 3. Passing pendingXdr to the backend which intercepts the sign_and_submit call
 *
 * This approach prevents XDR corruption because the XDR never passes through the AI.
 */
export function SecretKeySignCard({
  toolName,
  params = {},
  xdr,
  simulationResult,
  onSignRequest,
  isSigningInProgress = false,
}: SecretKeySignCardProps) {
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copiedXdr, setCopiedXdr] = useState(false);

  const truncatedXdr = xdr.length > 60
    ? `${xdr.slice(0, 30)}...${xdr.slice(-30)}`
    : xdr;

  const handleCopyXdr = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(xdr);
    setCopiedXdr(true);
    setTimeout(() => setCopiedXdr(false), 2000);
  };

  const handleSign = () => {
    if (!secretKey) {
      setError('Please enter your secret key');
      return;
    }

    if (!secretKey.startsWith('S') || secretKey.length !== 56) {
      setError('Invalid secret key. Must start with S and be 56 characters.');
      return;
    }

    setError(null);

    // Call the parent's sign request handler
    // The parent will send a message to AI with the secret key
    // The backend will intercept and use the stored XDR
    onSignRequest(secretKey);

    // Clear the secret key for security
    setSecretKey('');
  };

  return (
    <div className="my-4 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">Transaction Ready</h3>
          <p className="text-sm text-muted-foreground mt-1">{toolName}</p>
        </div>
        <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
          Pending Signature
        </span>
      </div>

      {/* Parameters */}
      {Object.keys(params).length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Parameters:</p>
          <div className="bg-muted/50 rounded-md p-3">
            {Object.entries(params).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono text-foreground truncate max-w-[60%]">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XDR Dropdown */}
      <div className="mb-4">
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between p-2.5 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Transaction XDR</span>
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

      {/* Secret Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Secret Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="S..."
            disabled={isSigningInProgress}
            className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            {showKey ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Your secret key will not be stored and is only used to sign this transaction.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Simulation Result Preview */}
      {simulationResult && (
        <div className="mb-4 p-3 bg-muted/30 rounded-md border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">Simulation Result:</p>
          <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
            {typeof simulationResult === 'object' ? JSON.stringify(simulationResult, null, 2) : String(simulationResult)}
          </pre>
        </div>
      )}

      {/* Sign Button */}
      <button
        onClick={handleSign}
        disabled={isSigningInProgress || !secretKey}
        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSigningInProgress ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing & Submitting...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Sign & Submit Transaction
          </>
        )}
      </button>
    </div>
  );
}
