import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import * as tools from './tools/test-contract.js';
import * as schemas from './schemas/test-contract.js';
import { submitTransaction } from './lib/submit.js';
import { prepareTransactionForWallet, signTransaction } from './lib/utils.js';
import { signAndSendWithPasskey } from './lib/passkey.js';

// Configuration from environment
const CONTRACT_ID = process.env.CONTRACT_ID || 'CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG';
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

// Helper to serialize BigInt values (Soroban uses i128/u128 which become BigInt in JS)
const jsonStringify = (obj: unknown, space?: number): string => {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value, space);
};

// Factory function to create and configure an MCP server instance
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'soroban-contract-mcp',
    version: '1.0.0',
  });

  // Register all tools on this server instance
  registerTools(server);

  return server;
}

// Function to register all tools on a server instance
function registerTools(server: McpServer): void {

// Tool: set_allowlist_wasm
server.registerTool(
  'set-allowlist-wasm',
  {
    description: 'Set WASM hash for Allowlist token type\n\n# Arguments\n* `admin` - Admin address (for authorization)\n* `wasm_hash` - WASM hash of the Allowlist token contract',
    inputSchema: {
      admin: z.string().length(56).describe(''),
      wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.setAllowlistWasm(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: set_blocklist_wasm
server.registerTool(
  'set-blocklist-wasm',
  {
    description: 'Set WASM hash for Blocklist token type\n\n# Arguments\n* `admin` - Admin address (for authorization)\n* `wasm_hash` - WASM hash of the Blocklist token contract',
    inputSchema: {
      admin: z.string().length(56).describe(''),
      wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.setBlocklistWasm(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: set_capped_wasm
server.registerTool(
  'set-capped-wasm',
  {
    description: 'Set WASM hash for Capped token type\n\n# Arguments\n* `admin` - Admin address (for authorization)\n* `wasm_hash` - WASM hash of the Capped token contract',
    inputSchema: {
      admin: z.string().length(56).describe(''),
      wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.setCappedWasm(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: set_pausable_wasm
server.registerTool(
  'set-pausable-wasm',
  {
    description: 'Set WASM hash for Pausable token type\n\n# Arguments\n* `admin` - Admin address (for authorization)\n* `wasm_hash` - WASM hash of the Pausable token contract',
    inputSchema: {
      admin: z.string().length(56).describe(''),
      wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.setPausableWasm(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: set_vault_wasm
server.registerTool(
  'set-vault-wasm',
  {
    description: 'Set WASM hash for Vault token type\n\n# Arguments\n* `admin` - Admin address (for authorization)\n* `wasm_hash` - WASM hash of the Vault token contract',
    inputSchema: {
      admin: z.string().length(56).describe(''),
      wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.setVaultWasm(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: deploy_token
server.registerTool(
  'deploy-token',
  {
    description: 'Deploy a token contract with specified configuration\n\n# Arguments\n* `deployer` - Address calling this function\n* `config` - Token configuration including type, admin, supply, etc.\n\n# Returns\nAddress of the deployed token contract',
    inputSchema: {
      deployer: z.string().length(56).describe(''),
      config: schemas.TokenConfigSchema.describe(''),
    },
    outputSchema: { xdr: z.string(), simulationResult: z.string().length(56).optional() },
  },
  async (params) => {
    try {
      const result = await tools.deployToken(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_deployed_tokens
server.registerTool(
  'get-deployed-tokens',
  {
    description: 'Get all deployed tokens\n\n# Returns\nVector of TokenInfo containing all deployed tokens',
    inputSchema: {},
    outputSchema: { xdr: z.string(), simulationResult: z.array(schemas.TokenInfoSchema).optional() },
  },
  async (params) => {
    try {
      const result = await tools.getDeployedTokens(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_tokens_by_type
server.registerTool(
  'get-tokens-by-type',
  {
    description: 'Get tokens by type\n\n# Arguments\n* `token_type` - Type of tokens to filter by\n\n# Returns\nVector of TokenInfo for the specified type',
    inputSchema: {
      token_type: schemas.TokenTypeSchema.describe(''),
    },
    outputSchema: { xdr: z.string(), simulationResult: z.array(schemas.TokenInfoSchema).optional() },
  },
  async (params) => {
    try {
      const result = await tools.getTokensByType(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_tokens_by_admin
server.registerTool(
  'get-tokens-by-admin',
  {
    description: 'Get tokens by admin\n\n# Arguments\n* `admin` - Admin address to filter by\n\n# Returns\nVector of TokenInfo for tokens managed by the admin',
    inputSchema: {
      admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string(), simulationResult: z.array(schemas.TokenInfoSchema).optional() },
  },
  async (params) => {
    try {
      const result = await tools.getTokensByAdmin(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_token_count
server.registerTool(
  'get-token-count',
  {
    description: 'Get total number of deployed tokens\n\n# Returns\nTotal count of deployed tokens',
    inputSchema: {},
    outputSchema: { xdr: z.string(), simulationResult: z.number().optional() },
  },
  async (params) => {
    try {
      const result = await tools.getTokenCount(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_admin
server.registerTool(
  'get-admin',
  {
    description: 'Get admin address\n\n# Returns\nAddress of the admin',
    inputSchema: {},
    outputSchema: { xdr: z.string(), simulationResult: z.string().length(56).optional() },
  },
  async (params) => {
    try {
      const result = await tools.getAdmin(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: get_pending_admin
server.registerTool(
  'get-pending-admin',
  {
    description: 'Get pending admin address (if any)\n\n# Returns\nOption containing pending admin address',
    inputSchema: {},
    outputSchema: { xdr: z.string(), simulationResult: z.string().length(56).nullable().optional() },
  },
  async (params) => {
    try {
      const result = await tools.getPendingAdmin(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: pause
server.registerTool(
  'pause',
  {
    description: 'Pause contract (emergency stop)\n\n# Arguments\n* `admin` - Admin address (for authorization)',
    inputSchema: {
      admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.pause(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: unpause
server.registerTool(
  'unpause',
  {
    description: 'Unpause contract\n\n# Arguments\n* `admin` - Admin address (for authorization)',
    inputSchema: {
      admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.unpause(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: upgrade
server.registerTool(
  'upgrade',
  {
    description: 'Upgrade the factory contract to a new WASM hash\n\n# Arguments\n* `new_wasm_hash` - New WASM hash to upgrade to',
    inputSchema: {
      new_wasm_hash: z.string().length(64).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.upgrade(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: initiate_admin_transfer
server.registerTool(
  'initiate-admin-transfer',
  {
    description: 'Initiate admin transfer (step 1 of 2-step process)\n\n# Arguments\n* `current_admin` - Current admin address (must match stored admin)\n* `new_admin` - New admin address',
    inputSchema: {
      current_admin: z.string().length(56).describe(''),
      new_admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.initiateAdminTransfer(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: accept_admin_transfer
server.registerTool(
  'accept-admin-transfer',
  {
    description: 'Accept admin transfer (step 2 of 2-step process)\n\n# Arguments\n* `new_admin` - New admin address accepting the role',
    inputSchema: {
      new_admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.acceptAdminTransfer(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: cancel_admin_transfer
server.registerTool(
  'cancel-admin-transfer',
  {
    description: 'Cancel pending admin transfer\n\n# Arguments\n* `current_admin` - Current admin address',
    inputSchema: {
      current_admin: z.string().length(56).describe(''),
    },
    outputSchema: { xdr: z.string() },
  },
  async (params) => {
    try {
      const result = await tools.cancelAdminTransfer(params, {
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      return {
        content: [{
          type: 'text',
          text: jsonStringify(result, 2),
        }],
        structuredContent: JSON.parse(jsonStringify(result)),
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: jsonStringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        }],
      };
    }
  }
);

// Tool: sign-and-submit
server.registerTool(
  'sign-and-submit',
  {
    description: 'Sign a transaction XDR and submit to the network. Use walletContractId for passkey smart wallet signing (requires WALLET_SIGNER_SECRET env var), or secretKey for regular keypair signing. secretKey is always required as fee payer.',
    inputSchema: {
      xdr: z.string().describe('Transaction XDR to sign and submit'),
      secretKey: z.string().optional().describe('Secret key for signing. For passkey flow, this becomes the fee payer secret.'),
      walletContractId: z.string().optional().describe('Smart wallet contract ID for passkey signing (uses WALLET_SIGNER_SECRET from env, secretKey as fee payer)'),
    },
    outputSchema: { success: z.boolean(), result: z.unknown().optional() },
  },
  async ({ xdr, secretKey, walletContractId }) => {
    try {
      if (!secretKey) {
        throw new Error('Either secretKey (for regular signing) or walletContractId (for passkey signing) is required');
      }

      // Use passkey signing if walletContractId is provided
      if (walletContractId) {
        // Passkey signing uses WALLET_SIGNER_SECRET from env for auth, secretKey as fee payer
        const result = await signAndSendWithPasskey(xdr, walletContractId, secretKey);
        const payload = { success: true, result };
        return {
          content: [{
            type: 'text',
            text: jsonStringify(payload),
          }],
          structuredContent: payload,
        };
      }

      // Regular signing: signAuthEntries + sign envelope + submit
      const signedXdr = await signTransaction(xdr, secretKey);
      const result = await submitTransaction(signedXdr);
      const payload = { success: true, result };
      return {
        content: [{
          type: 'text',
          text: jsonStringify(payload),
        }],
        structuredContent: payload,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: jsonStringify({ error: 'Submission failed', message: errMsg }),
        }],
        structuredContent: { success: false, result: errMsg },
      };
    }
  }
);

// Tool: prepare-transaction
server.registerTool(
  'prepare-transaction',
  {
    description: 'Prepare transaction for wallet signing. Takes XDR with dummy sequence and returns wallet-ready XDR with fresh sequence. Use this when user wants to sign a transaction with their wallet.',
    inputSchema: {
      xdr: z.string().describe('Transaction XDR from contract function call'),
      walletAddress: z.string().describe('Wallet public key (G...) to prepare transaction for'),
      toolName: z.string().describe('Name of contract function being called'),
      params: z.record(z.any()).optional().describe('Parameters passed to function'),
      simulationResult: z.any().optional().describe('Simulation result from initial call'),
    },
    outputSchema: { walletReadyXdr: z.string(), preview: z.record(z.string(), z.unknown()) },
  },
  async ({ xdr, walletAddress, toolName, params, simulationResult }) => {
    try {
      const result = await prepareTransactionForWallet(xdr, walletAddress);
      const payload = {
        walletReadyXdr: result.walletReadyXdr,
        preview: {
          toolName,
          params,
          simulationResult,
          network: NETWORK_PASSPHRASE,
        },
      };
      return {
        content: [{
          type: 'text',
          text: jsonStringify(payload),
        }],
        structuredContent: payload,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: jsonStringify({ error: 'Transaction preparation failed', message: errMsg }),
        }],
        structuredContent: { walletReadyXdr: '', preview: { error: errMsg } },
      };
    }
  }
);

// Tool: prepare-sign-and-submit
// This tool is used in SECRET KEY mode to prepare a transaction for signing.
// It returns the XDR and metadata so the frontend can show the SecretKeySignCard.
// The actual signing happens when the user calls sign-and-submit with their secret key.
server.registerTool(
  'prepare-sign-and-submit',
  {
    description: 'Prepare a write transaction for secret key signing. Call this when the user wants to execute a write operation (deploy, transfer, etc.) in SECRET KEY mode. Returns the XDR for the frontend to show the signing UI. After user provides their secret key, call sign-and-submit to complete the transaction.',
    inputSchema: {
      xdr: z.string().describe('Transaction XDR from contract function call'),
      toolName: z.string().describe('Name of contract function being called (e.g., deploy-token, pause)'),
      params: z.record(z.any()).optional().describe('Parameters passed to the contract function'),
      simulationResult: z.any().optional().describe('Simulation result from the contract call'),
    },
    outputSchema: { readyForSigning: z.literal(true), xdr: z.string(), preview: z.record(z.string(), z.unknown()) },
  },
  async ({ xdr, toolName, params, simulationResult }) => {
    try {
      // Simply return the XDR and metadata for the frontend to display
      // No actual signing happens here - that's done by sign-and-submit
      const payload = {
        readyForSigning: true as const,
        xdr,
        preview: {
          toolName,
          params,
          simulationResult,
          network: NETWORK_PASSPHRASE,
        },
      };
      return {
        content: [{
          type: 'text',
          text: jsonStringify(payload),
        }],
        structuredContent: payload,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: jsonStringify({ error: 'Transaction preparation failed', message: errMsg }),
        }],
        structuredContent: { readyForSigning: true as const, xdr: '', preview: { error: errMsg } },
      };
    }
  }
);
} // End of registerTools function

// Start server with stdio or HTTP transport
async function main() {
  const useHttp = process.env.USE_HTTP === 'true';
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  if (useHttp) {
    // HTTP mode with StreamableHTTP transport - STATELESS mode
    // Each request creates a new server/transport pair
    const RATE_LIMIT = parseInt(process.env.RATE_LIMIT ?? '100', 10);
    const windowMs = 60_000;
    const ipWindows = new Map<string, { count: number; resetAt: number }>();

    function consumeRateLimit(ip: string): boolean {
      const now = Date.now();
      const entry = ipWindows.get(ip);
      if (!entry || now >= entry.resetAt) {
        ipWindows.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (entry.count >= RATE_LIMIT) return false;
      entry.count++;
      return true;
    }

    // Clean up stale rate-limit entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of ipWindows) {
        if (now >= entry.resetAt) ipWindows.delete(ip);
      }
    }, 5 * 60_000);

    const app = express();
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'mcp-session-id'],
      exposedHeaders: ['mcp-session-id'],
    }));
    app.use(express.json());

    // Health check — always accessible, not rate limited
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // Rate limiting middleware for MCP endpoints
    app.use('/mcp', (req, res, next) => {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
      if (!consumeRateLimit(ip)) {
        res.writeHead(429, {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RATE_LIMIT),
        });
        res.end(JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }));
        return;
      }
      next();
    });

    // POST endpoint - handles all MCP requests in stateless mode
    app.post('/mcp', async (req, res) => {
      console.error(`[MCP] POST request - stateless mode`);

      try {
        // Create a fresh transport and server for EVERY request (true stateless)
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // STATELESS - no sessions
        });

        const server = createMcpServer();
        await server.connect(transport);

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('[MCP] POST error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal server error' },
            id: null
          });
        }
      }
    });

    // GET endpoint - return 405 (stateless mode has no persistent SSE stream)
    // StreamableHTTPClientTransport handles 405 gracefully: skips GET stream,
    // operates in pure stateless POST mode.  A closing SSE stream confuses
    // clients into reconnection loops and causes 'SSE error: undefined'.
    app.get('/mcp', (_req, res) => {
      res.status(405).json({ error: 'Method Not Allowed: server runs in stateless HTTP mode' });
    });

    // DELETE endpoint
    app.delete('/mcp', async (_req, res) => {
      console.error(`[MCP] DELETE request - no-op in stateless mode`);
      res.status(200).json({
        jsonrpc: '2.0',
        result: {},
        id: null
      });
    });

    app.listen(port, () => {
      console.error('soroban-contract-mcp MCP server running on HTTP port', port);
      console.error('Mode: STATELESS (no sessions)');
      console.error('Rate limit: ' + RATE_LIMIT + ' req/min per IP');
      console.error('Health check: http://localhost:' + port + '/health');
      console.error('MCP endpoint: http://localhost:' + port + '/mcp');
    });
  } else {
    // Stdio mode (default for Claude Desktop)
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('soroban-contract-mcp MCP server running on stdio');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
