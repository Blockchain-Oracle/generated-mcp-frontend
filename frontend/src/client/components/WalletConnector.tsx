import { useState } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules, ISupportedWallet } from '@creit.tech/stellar-wallets-kit';

interface WalletConnectorProps {
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export function WalletConnector({ walletAddress, onConnect, onDisconnect }: WalletConnectorProps) {
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    setConnecting(true);
    try {
      const kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: 'freighter',
        modules: allowAllModules(),
      });

      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          onConnect(address);
        }
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-muted-foreground hidden md:inline">
          {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </span>
        <button
          onClick={onDisconnect}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none"
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
