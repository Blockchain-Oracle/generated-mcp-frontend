import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { WalletConnector } from './components/WalletConnector';
import { AuthModeSelector } from './components/AuthModeSelector';
import { ModeToggle } from './components/ModeToggle';

export default function App() {
  const [authMode, setAuthMode] = useState<'wallet' | 'secret'>('wallet');
  const [hasEnteredSecretMode, setHasEnteredSecretMode] = useState(false);

  // Initialize from localStorage if available
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress');
    }
    return null;
  });

  // Persist to localStorage
  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else {
      localStorage.removeItem('walletAddress');
    }
  }, [walletAddress]);

  // Handle auth mode change - when switching to secret mode, go directly to dashboard
  const handleModeChange = (mode: 'wallet' | 'secret') => {
    setAuthMode(mode);
    if (mode === 'secret') {
      setHasEnteredSecretMode(true);
    }
  };

  // Wallet persistence is handled by localStorage above
  // No need to check StellarWalletsKit on mount since connection state
  // is managed by WalletConnector component

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-none">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">soroban-contract</span>
            <span>MCP</span>
          </div>

          <div className="flex items-center gap-4">
            {walletAddress && ( // Always show disconnect if wallet is connected
              <WalletConnector
                walletAddress={walletAddress}
                onConnect={setWalletAddress} // This won't be called if walletAddress exists, but is kept for type consistency
                onDisconnect={() => setWalletAddress(null)}
              />
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto p-4 md:p-6 overflow-hidden flex flex-col">
        {(authMode === 'wallet' && walletAddress) || (authMode === 'secret' && hasEnteredSecretMode) ? (
          <ChatInterface
            authMode={authMode}
            walletAddress={walletAddress}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                AI-Powered Smart Contract Interface
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Interact with Stellar smart contracts using natural language. Powered by Stellar MCP Generator.
              </p>
            </div>
            <div className="space-y-4 w-full max-w-md pt-4">
              <AuthModeSelector
                mode={authMode}
                onModeChange={handleModeChange}
              />
              {authMode === 'wallet' && !walletAddress && (
                <WalletConnector
                  walletAddress={walletAddress}
                  onConnect={setWalletAddress}
                  onDisconnect={() => setWalletAddress(null)}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
