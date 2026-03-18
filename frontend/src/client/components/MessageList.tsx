import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from 'ai';
import { ReadOperationCard, SignAndSubmitResultCard } from './ReadOperationCard';
import { WriteOperationCard } from './WriteOperationCard';
import { SecretKeySignCard } from './SecretKeySignCard';
import { executeTransaction } from './TransactionExecutor';

interface MessageListProps {
  messages: Message[];
  walletAddress?: string | null;
  isLoading?: boolean;
  authMode?: 'secret' | 'wallet';
  onSignRequest?: (xdr: string, secretKey: string) => void;
  isSigningInProgress?: boolean;
}

export function MessageList({ messages, walletAddress, isLoading, authMode: _authMode = 'wallet', onSignRequest, isSigningInProgress = false }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {message.role === 'user' ? (
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
                className="h-4 w-4"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ) : (
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
                className="h-4 w-4"
              >
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                <path d="M12 22a2 2 0 0 1 2-2v-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2v2a2 2 0 0 1 2 2z" />
                <path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
                <path d="M22 12a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2 2 2 0 0 1 2 2h2a2 2 0 0 1 2-2z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            )}
          </div>

          <div
            className={`relative max-w-[90%] md:max-w-[85%] rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-sm shadow-sm ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <div className="leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <p className="mb-2 last:mb-0 break-words overflow-hidden">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1 break-words">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1 break-words">{children}</ol>,
                  li: ({children}) => <li>{children}</li>,
                  code: ({node, inline, className, children, ...props}: any) => {
                    return inline ? (
                      <code className="bg-background/20 px-1 py-0.5 rounded font-mono text-xs break-all" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-background/20 p-2 rounded-lg font-mono text-xs overflow-x-auto my-2 whitespace-pre-wrap break-all" {...props}>
                        {children}
                      </code>
                    );
                  },
                  strong: ({children}) => <span className="font-bold">{children}</span>,
                  a: ({children, href}) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Display tool calls with generic components */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.toolInvocations.map((tool, idx) => {
                  // Only render if we have a result and tool call completed
                  if (tool.state !== 'result') return null;

                  const result = (tool as any).result;
                  const toolNameLower = tool.toolName.toLowerCase();

                  // Check if this is a sign-and-submit result
                  // Returns: { success: true, result: { status, hash, ... } } or { error, message }
                  if (toolNameLower === 'sign_and_submit' || toolNameLower === 'sign-and-submit') {
                    return (
                      <SignAndSubmitResultCard
                        key={idx}
                        success={result.success ?? false}
                        txResult={result.result || { status: 'FAILED', error: result.message || result.error }}
                      />
                    );
                  }

                  // Check if this is a prepare-transaction result (WriteOperationCard) - WALLET MODE
                  // Returns: { walletReadyXdr, preview: { toolName, params, simulationResult, network } }
                  if (toolNameLower === 'prepare_transaction' || toolNameLower === 'prepare-transaction') {
                    const transaction = {
                      xdr: result.walletReadyXdr,
                      network: result.preview?.network || 'testnet',
                      method: result.preview?.toolName,
                    };
                    return (
                      <WriteOperationCard
                        key={idx}
                        toolName={result.preview?.toolName || tool.toolName}
                        params={result.preview?.params || {}}
                        transaction={transaction}
                        walletAddress={walletAddress}
                        onSign={async (xdr) => {
                          if (!walletAddress) {
                            throw new Error('Wallet not connected');
                          }
                          return executeTransaction({
                            xdr,
                            walletAddress,
                          });
                        }}
                      />
                    );
                  }

                  // Check if this is a prepare-sign-and-submit result (SecretKeySignCard) - SECRET KEY MODE
                  // Returns: { readyForSigning: true, xdr, preview: { toolName, params, simulationResult, network } }
                  if (toolNameLower === 'prepare_sign_and_submit' || toolNameLower === 'prepare-sign-and-submit') {
                    return (
                      <SecretKeySignCard
                        key={idx}
                        toolName={result.preview?.toolName || tool.toolName}
                        params={result.preview?.params}
                        xdr={result.xdr}
                        simulationResult={result.preview?.simulationResult}
                        onSignRequest={(secretKey) => {
                          if (onSignRequest) {
                            onSignRequest(result.xdr, secretKey);
                          }
                        }}
                        isSigningInProgress={isSigningInProgress}
                      />
                    );
                  }

                  // Otherwise it's a read operation
                  return (
                    <ReadOperationCard
                      key={idx}
                      toolName={tool.toolName}
                      result={result.data !== undefined ? result.data : result}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex gap-3 flex-row">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm bg-muted text-muted-foreground border-border">
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
              className="h-4 w-4"
            >
              <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <path d="M12 22a2 2 0 0 1 2-2v-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2v2a2 2 0 0 1 2 2z" />
              <path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
              <path d="M22 12a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2 2 2 0 0 1 2 2h2a2 2 0 0 1 2-2z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div className="relative max-w-[90%] md:max-w-[85%] rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-sm shadow-sm bg-muted text-foreground">
            <div className="flex space-x-1 h-5 items-center">
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
