import { motion } from 'framer-motion';

interface AuthModeSelectorProps {
  mode: 'secret' | 'wallet';
  onModeChange: (mode: 'secret' | 'wallet') => void;
}

export function AuthModeSelector({ mode, onModeChange }: AuthModeSelectorProps) {
  return (
    <div className="w-full max-w-sm mx-auto mb-6">
      <div className="relative flex p-1 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
        <div className="relative flex w-full">
          {/* Active Background Pill */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 rounded-lg bg-background shadow-sm border border-border"
            initial={false}
            animate={{
              x: mode === 'wallet' ? 0 : '100%',
              width: '50%'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />

          {/* Wallet Button */}
          <button
            onClick={() => onModeChange('wallet')}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg ${
              mode === 'wallet' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-8Z" />
              </svg>
              <span>Wallet</span>
            </div>
          </button>

          {/* Secret Key Button */}
          <button
            onClick={() => onModeChange('secret')}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg ${
              mode === 'secret' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
              <span>Secret Key</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
