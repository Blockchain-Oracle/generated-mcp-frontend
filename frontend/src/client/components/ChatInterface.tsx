import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SuggestedActions } from './SuggestedActions';

interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  config: {
    provider: string;
    openai: boolean;
    anthropic: boolean;
    mcpServer: boolean;
    mcpServerUrl: string;
  };
  errors?: string[];
}

interface ChatInterfaceProps {
  authMode: 'secret' | 'wallet';
  walletAddress: string | null;
}

export function ChatInterface({ authMode, walletAddress }: ChatInterfaceProps) {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);

  // XDR state management for sign flow
  // Store XDR in frontend state to prevent AI from corrupting it when reconstructing
  const [pendingXdr, setPendingXdr] = useState<string | null>(null);
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);

  // Check server health/config on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/chat';
        const healthUrl = apiUrl.replace('/api/chat', '/health');

        const response = await fetch(healthUrl);
        if (response.ok) {
          const health: HealthStatus = await response.json();
          if (health.errors && health.errors.length > 0) {
            setConfigErrors(health.errors);
          }
        }
      } catch (error) {
        console.error('[ChatInterface] Health check failed:', error);
        setConfigErrors(['Unable to connect to API server. Is the backend running?']);
      }
    };

    checkHealth();
  }, []);

  // Fetch available tools from the MCP server via backend
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);
        setToolsError(null);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/chat';
        const toolsUrl = apiUrl.replace('/chat', '/tools');

        console.log('[ChatInterface] Fetching tools from:', toolsUrl);

        const response = await fetch(toolsUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch tools: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[ChatInterface] Tools response:', data);

        if (data.tools && Array.isArray(data.tools)) {
          setAvailableTools(data.tools);
        }
      } catch (error) {
        console.error('[ChatInterface] Error fetching tools:', error);
        setToolsError(error instanceof Error ? error.message : 'Failed to fetch tools');
      } finally {
        setToolsLoading(false);
      }
    };

    fetchTools();
  }, []);

  console.log('[ChatInterface] availableTools:', availableTools);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/chat',
    body: {
      tools: availableTools,
      authMode,
      walletAddress,
      // Pass pending XDR to backend for interception at execute level
      // This prevents AI from corrupting long XDR strings when reconstructing from memory
      pendingXdr,
    },
    onError: (error) => {
      console.error('[ChatInterface] Chat error:', error);
      setIsSigningInProgress(false);
      // Parse error message - could be JSON or plain text
      try {
        const parsed = JSON.parse(error.message);
        setChatError(parsed.error || error.message);
      } catch {
        setChatError(error.message || 'An error occurred while processing your message');
      }
    },
    onFinish: () => {
      // Clear error and signing state on successful completion
      setChatError(null);
      setIsSigningInProgress(false);
      // Clear pending XDR after successful sign operation
      setPendingXdr(null);
    },
  });

  // Handle sign request from SecretKeySignCard
  // This stores the XDR in state and sends the secret key to AI for signing
  const handleSignRequest = (xdr: string, secretKey: string) => {
    console.log('[ChatInterface] Sign request received');
    console.log('[ChatInterface] XDR length:', xdr.length);

    // Store XDR in state for future reference
    setPendingXdr(xdr);
    setIsSigningInProgress(true);

    // Send message to AI to trigger sign_and_submit
    // IMPORTANT: Pass pendingXdr directly in the body options to avoid stale closure
    // React state update is async, so we can't rely on pendingXdr state being updated
    append(
      {
        role: 'user',
        content: `SYSTEM: User authorized transaction signing. Call the sign-and-submit tool with secretKey: ${secretKey}`,
      },
      {
        body: {
          tools: availableTools,
          authMode,
          walletAddress,
          pendingXdr: xdr, // Pass XDR directly, not from state
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto bg-card text-card-foreground sm:rounded-xl border-x-0 sm:border border-border shadow-sm overflow-hidden">
      {/* Config Error Banner */}
      {configErrors.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500 shrink-0 mt-0.5"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Configuration Issue</p>
              <ul className="mt-1 text-sm text-amber-600 dark:text-amber-300">
                {configErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-amber-600/80 dark:text-amber-400/80">
                Check your .env file and ensure all required environment variables are set.
              </p>
            </div>
            <button
              onClick={() => setConfigErrors([])}
              className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Error Display */}
      {chatError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="mt-1 text-sm text-destructive/80">{chatError}</p>
            </div>
            <button
              onClick={() => setChatError(null)}
              className="text-destructive hover:text-destructive/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 text-muted-foreground opacity-80">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Contract Interface</h3>
            <p className="text-sm max-w-sm">
              Interact with your smart contract using natural language. Generated by Stellar MCP.
            </p>
            <div className="mt-8 w-full max-w-2xl">
              {toolsLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading tools from MCP server...</span>
                </div>
              ) : toolsError ? (
                <div className="text-destructive text-sm text-center">
                  Error loading tools: {toolsError}
                </div>
              ) : (
                <SuggestedActions
                  tools={availableTools}
                  onActionClick={(prompt) => {
                    handleInputChange({ target: { value: prompt } } as any);
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            walletAddress={walletAddress}
            isLoading={isLoading}
            authMode={authMode}
            onSignRequest={handleSignRequest}
            isSigningInProgress={isSigningInProgress}
          />
        )}
      </div>

      <div className="p-4 md:p-8 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
