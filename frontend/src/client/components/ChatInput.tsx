import { FormEvent, ChangeEvent } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Create a synthetic event or call handleSubmit directly if possible,
            // but since handleSubmit expects a FormEvent, we trigger the form submit.
            // A programmatic form.requestSubmit() is cleaner but we can just call handleSubmit.
            // However, useChat's handleSubmit expects a FormEvent.
            // We can trick it or find the form and requestSubmit.
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="Ask Stellar MCP"
        disabled={isLoading}
        className="flex-1 min-h-[48px] md:min-h-[64px] max-h-[200px] py-3 md:py-4 px-4 md:px-6 pr-14 md:pr-16 rounded-3xl border border-input bg-background text-foreground text-base md:text-lg shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none overflow-y-auto"
        rows={1}
        style={{ height: 'auto', minHeight: '3rem' }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="absolute right-2 bottom-2 md:bottom-3 h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
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
            className="h-4 w-4 md:h-5 md:w-5 ml-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
        <span className="sr-only">Send</span>
      </button>
    </form>
  );
}
