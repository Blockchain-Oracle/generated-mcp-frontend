# TestContract MCP Server

Auto-generated MCP server for the test-contract contract on Stellar testnet.

## Contract Information

- **Contract ID**: `CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG`
- **Network**: testnet
- **RPC URL**: https://soroban-testnet.stellar.org

## Requirements

- **Node.js 20+** recommended
- For Node.js 18.x users experiencing SSL certificate errors, add `NODE_TLS_REJECT_UNAUTHORIZED=0` to environment variables (development only)

## Available Tools

<details>
<summary><code>set-allowlist-wasm</code></summary>

Set WASM hash for Allowlist token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Allowlist token contract

**Parameters:**

- `admin` (string): No description
- `wasm_hash` (string): No description

</details>

<details>
<summary><code>set-blocklist-wasm</code></summary>

Set WASM hash for Blocklist token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Blocklist token contract

**Parameters:**

- `admin` (string): No description
- `wasm_hash` (string): No description

</details>

<details>
<summary><code>set-capped-wasm</code></summary>

Set WASM hash for Capped token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Capped token contract

**Parameters:**

- `admin` (string): No description
- `wasm_hash` (string): No description

</details>

<details>
<summary><code>set-pausable-wasm</code></summary>

Set WASM hash for Pausable token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Pausable token contract

**Parameters:**

- `admin` (string): No description
- `wasm_hash` (string): No description

</details>

<details>
<summary><code>set-vault-wasm</code></summary>

Set WASM hash for Vault token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Vault token contract

**Parameters:**

- `admin` (string): No description
- `wasm_hash` (string): No description

</details>

<details>
<summary><code>deploy-token</code></summary>

Deploy a token contract with specified configuration

# Arguments
* `deployer` - Address calling this function
* `config` - Token configuration including type, admin, supply, etc.

# Returns
Address of the deployed token contract

**Parameters:**

- `deployer` (string): No description
- `config` (TokenConfig): No description

**Returns:** `string`

</details>

<details>
<summary><code>get-deployed-tokens</code></summary>

Get all deployed tokens

# Returns
Vector of TokenInfo containing all deployed tokens

**Returns:** `TokenInfo[]`

</details>

<details>
<summary><code>get-tokens-by-type</code></summary>

Get tokens by type

# Arguments
* `token_type` - Type of tokens to filter by

# Returns
Vector of TokenInfo for the specified type

**Parameters:**

- `token_type` (TokenType): No description

**Returns:** `TokenInfo[]`

</details>

<details>
<summary><code>get-tokens-by-admin</code></summary>

Get tokens by admin

# Arguments
* `admin` - Admin address to filter by

# Returns
Vector of TokenInfo for tokens managed by the admin

**Parameters:**

- `admin` (string): No description

**Returns:** `TokenInfo[]`

</details>

<details>
<summary><code>get-token-count</code></summary>

Get total number of deployed tokens

# Returns
Total count of deployed tokens

**Returns:** `number`

</details>

<details>
<summary><code>get-admin</code></summary>

Get admin address

# Returns
Address of the admin

**Returns:** `string`

</details>

<details>
<summary><code>get-pending-admin</code></summary>

Get pending admin address (if any)

# Returns
Option containing pending admin address

**Returns:** `string | null`

</details>

<details>
<summary><code>pause</code></summary>

Pause contract (emergency stop)

# Arguments
* `admin` - Admin address (for authorization)

**Parameters:**

- `admin` (string): No description

</details>

<details>
<summary><code>unpause</code></summary>

Unpause contract

# Arguments
* `admin` - Admin address (for authorization)

**Parameters:**

- `admin` (string): No description

</details>

<details>
<summary><code>upgrade</code></summary>

Upgrade the factory contract to a new WASM hash

# Arguments
* `new_wasm_hash` - New WASM hash to upgrade to

**Parameters:**

- `new_wasm_hash` (string): No description

</details>

<details>
<summary><code>initiate-admin-transfer</code></summary>

Initiate admin transfer (step 1 of 2-step process)

# Arguments
* `current_admin` - Current admin address (must match stored admin)
* `new_admin` - New admin address

**Parameters:**

- `current_admin` (string): No description
- `new_admin` (string): No description

</details>

<details>
<summary><code>accept-admin-transfer</code></summary>

Accept admin transfer (step 2 of 2-step process)

# Arguments
* `new_admin` - New admin address accepting the role

**Parameters:**

- `new_admin` (string): No description

</details>

<details>
<summary><code>cancel-admin-transfer</code></summary>

Cancel pending admin transfer

# Arguments
* `current_admin` - Current admin address

**Parameters:**

- `current_admin` (string): No description

</details>

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Core Contract Configuration

```bash
CONTRACT_ID=CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG
RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### PasskeyKit Configuration (Optional)

For passkey-based transaction signing:

```bash
WALLET_WASM_HASH=your_wallet_wasm_hash_here
WALLET_CONTRACT_ID=your_wallet_contract_id_here
WALLET_SIGNER_SECRET=your_wallet_signer_secret_here
```

## Deploying a PasskeyKit Wallet

To enable passkey-based signing, deploy a PasskeyKit wallet contract:

### 1. Build or obtain the wallet WASM

```bash
# Option 1: Build from passkey-kit source
cd /path/to/passkey-kit/contracts
make build
cp out/smart_wallet.optimized.wasm ./wallet.wasm

# Option 2: Use pre-built WASM
# Download from passkey-kit releases
```

### 2. Upload WASM to network

```bash
stellar contract upload \
  --wasm wallet.wasm \
  --source your-keypair-alias \
  --network testnet

# Save the WASM hash from output
```

### 3. Deploy wallet using the script

```bash
# Set your deployer secret
export DEPLOYER_SECRET=SXXXXXXXXXXXXXXX

# Deploy with the WASM hash from step 2
pnpm deploy-passkey <WASM_HASH>
```

The script will output the wallet contract ID and signer credentials. Add these to your `.env` file.

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Build
pnpm run build

# Start server
pnpm start
```

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

### Basic Configuration (Standard Keypair Signing)

```json
{
  "mcpServers": {
    "test-contract": {
      "command": "node",
      "args": ["/absolute/path/to/this/project/dist/index.js"],
      "env": {
        "CONTRACT_ID": "CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG",
        "RPC_URL": "https://soroban-testnet.stellar.org",
        "NETWORK_PASSPHRASE": "Test SDF Network ; September 2015"
      }
    }
  }
}
```

### With PasskeyKit Support

If you want to use passkey-based signing, add `WALLET_WASM_HASH`:

```json
{
  "mcpServers": {
    "test-contract": {
      "command": "node",
      "args": ["/absolute/path/to/this/project/dist/index.js"],
      "env": {
        "CONTRACT_ID": "CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG",
        "RPC_URL": "https://soroban-testnet.stellar.org",
        "NETWORK_PASSPHRASE": "Test SDF Network ; September 2015",
        "WALLET_WASM_HASH": "your_wallet_wasm_hash_here"
      }
    }
  }
}
```

**Important Notes:**
- Replace `/absolute/path/to/this/project/` with the actual absolute path to this directory
- For passkey support: Replace `your_wallet_wasm_hash_here` with your deployed wallet WASM hash (get this from `pnpm deploy-passkey`)
- Build the project first with `pnpm run build` before starting Claude Desktop
- Restart Claude Desktop after making configuration changes
- If using Node.js 18.x and encountering SSL errors, add `"NODE_TLS_REJECT_UNAUTHORIZED": "0"` to the `env` object (development only)

## Transaction Signing

This MCP server supports two transaction signing methods:

### 1. Standard Keypair Signing

Use your Stellar secret key directly:
- Signs authorization entries
- Signs transaction envelope
- Submits to network

### 2. PasskeyKit Smart Wallet Signing

Use a deployed PasskeyKit wallet for enhanced security:
- Signs authorization entries with keypair
- Signs envelope with smart wallet contract
- Supports passkey-based authentication

To use passkey signing, provide the `walletContractId` parameter to the `sign-and-submit` tool.

## Generated by

[stellar-mcp-generator](https://github.com/stellar/stellar-mcp-generator)

This MCP server was auto-generated from the Stellar smart contract and includes production-ready transaction signing with support for both standard keypairs and PasskeyKit smart wallets.
