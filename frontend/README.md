# soroban-contract Frontend

AI-powered React frontend for interacting with the soroban-contract Stellar smart contract via MCP.

## Features

- **🤖 AI Chat Interface**: Natural language interaction with your smart contract
- **🔐 Dual Authentication**: Toggle between Secret Key and Wallet modes
- **💬 Conversational UI**: Ask the AI to execute contract functions
- **⚡ Real-time Streaming**: Live AI responses with tool execution visibility
- **🌐 Multi-Provider Support**: OpenAI or Anthropic (Claude)

## Architecture

```
User (Browser)
    ↓ Natural Language
Frontend (React + AI SDK)
    ↓ AI Chat API
Express Backend
    ↓ OpenAI/Anthropic
AI Model
    ↓ MCP Tool Calls
MCP Server (Soroban Contract)
    ↓
Stellar Network
```

### How It Works

1. **User types**: "Transfer 100 tokens to GABC..."
2. **AI understands** and calls appropriate MCP tools
3. **MCP server** builds unsigned transaction
4. **AI returns** transaction preview
5. **User signs** with wallet or secret key
6. **Transaction submitted** to Stellar

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your AI API key:

```bash
# Choose your AI provider
AI_PROVIDER=openai  # or 'anthropic'

# Add your API key
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys

### 3. Start the Servers

You need to run **3 servers** in separate terminals:

#### Terminal 1: MCP Server (HTTP mode)
```bash
cd ..  # Parent directory
USE_HTTP=true PORT=3000 pnpm start
```

#### Terminal 2: API Backend (Express + AI)
```bash
pnpm dev:server
```

#### Terminal 3: Frontend (React)
```bash
pnpm dev:client
```

**Or run all at once:**
```bash
# In the frontend directory
pnpm dev  # Runs both client and server concurrently

# In the parent directory (MCP server)
cd .. && USE_HTTP=true PORT=3000 pnpm start
```

### 4. Open Browser

Navigate to **http://localhost:5173**

## Usage

### Chat Examples

**Query data:**
```
"What's the current balance?"
"Show me the contract state"
```

**Execute transactions:**
```
"Transfer 100 USDC to GABC123..."
"Mint 50 tokens"
```

**Multi-step operations:**
```
"Check the allowance for GABC... and if it's less than 100, increase it"
```

## Authentication Modes

### 🔑 Secret Key Mode
- No upfront key required - provide secret key on-demand when signing
- When you want to sign a transaction, include your secret key in your message
- AI calls `sign-and-submit` MCP tool with the XDR and your secret key
- Server signs and submits transactions
- **Use for:** Testing, automation

### 👛 Wallet Mode
- Connect Freighter or compatible wallet
- AI calls `prepare-transaction` MCP tool
- You sign in your wallet browser extension
- **Use for:** Production, security

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | AI provider (`openai` or `anthropic`) | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `API_PORT` | Express backend port | `3001` |
| `VITE_MCP_SERVER_URL` | MCP server endpoint | `http://localhost:3000` |
| `VITE_API_URL` | Chat API endpoint | `http://localhost:3001/api/chat` |

## Project Structure

```
frontend/
├── src/
│   ├── client/              # React frontend
│   │   ├── components/      # UI components
│   │   │   ├── ChatInterface.tsx      # Main chat UI
│   │   │   ├── MessageList.tsx        # Chat messages
│   │   │   ├── ChatInput.tsx          # Input field
│   │   │   ├── AuthModeSelector.tsx   # Auth mode toggle
│   │   │   ├── WalletConnector.tsx    # Wallet connection
│   │   │   ├── ContractTools.tsx      # Manual tools (legacy)
│   │   │   └── ToolExecutor.tsx       # Tool execution (legacy)
│   │   ├── lib/
│   │   │   └── mcp-client.ts          # MCP client hook
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind styles
│   └── server/              # Express API backend
│       ├── index.ts         # Server entry point
│       └── routes/
│           └── chat.ts      # AI chat endpoint
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example
```

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React 19** | UI framework | ^19.2.1 |
| **TypeScript** | Type safety | ^5.9.3 |
| **Vite 7** | Build tool | ^7.2.6 |
| **Tailwind CSS 4** | Styling | ^4.1.17 |
| **Vercel AI SDK** | AI integration | ^4.0.38 |
| **Express** | API backend | ^4.21.2 |
| **use-mcp** | MCP client | ^0.0.21 |
| **Stellar Wallets Kit** | Wallet integration | ^1.9.5 |

## Development Scripts

```bash
# Development
pnpm dev              # Run both client and server
pnpm dev:client       # Run React app only
pnpm dev:server       # Run Express backend only

# Production
pnpm build            # Build React app
pnpm build:server     # Build Express server
pnpm preview          # Preview production build

# Utilities
pnpm typecheck        # Check TypeScript errors
```

## Troubleshooting

### AI API Key Not Working
- Check `.env` file exists and has correct key
- Restart the server after adding key: `pnpm dev:server`
- Verify key at provider console (OpenAI/Anthropic)

### MCP Server Connection Failed
- Ensure MCP server is running: `USE_HTTP=true PORT=3000 pnpm start`
- Check `VITE_MCP_SERVER_URL` in `.env`
- Verify port 3000 is not in use

### Wallet Not Connecting
- Install Freighter extension
- Ensure wallet is unlocked
- Try refreshing the page

### Chat Not Responding
- Check browser console for errors
- Verify API backend is running on port 3001
- Check AI API key is valid

## Security Notes

⚠️ **Never commit `.env` file to git**
⚠️ **Secret keys should only be used for testing**
⚠️ **Use wallet mode in production**
⚠️ **Keep API keys secure**

## Generated by

[stellar-mcp-generator](https://github.com/stellar/stellar-mcp-generator)
