// Generated tool handlers using official Stellar bindings
import { rpc } from '@stellar/stellar-sdk';
import { Client } from '../bindings/dist/index.js';
import type * as ContractTypes from '../bindings/dist/index.js';

export interface ContractConfig {
  contractId: string;
  rpcUrl: string;
  networkPassphrase: string;
}

// Helper to create contract client
function createClient(config: ContractConfig): Client {
  return new Client(config);
}

// Helper to convert types for Stellar SDK:
// - null → undefined (for Option<T>)
// - hex strings → Buffer (for Bytes/BytesN fields like 'salt', '*_hash', etc.)
// - numeric strings → bigint (for i128/u128 fields like '*_supply', 'cap', 'amount', etc.)
function convertNullToUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return undefined as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertNullToUndefined) as any;
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convert null to undefined
    if (value === null) {
      result[key] = undefined;
    }
    // Convert hex strings to Buffer for known Bytes fields
    else if (typeof value === 'string' && 
            (key === 'salt' || key.endsWith('_hash') || key.endsWith('_wasm')) &&
            /^[0-9a-fA-F]+$/.test(value)) {
      result[key] = Buffer.from(value, 'hex');
    }
    // Convert numeric strings to bigint for known i128/u128 fields
    else if (typeof value === 'string' && 
            (key.includes('supply') || key === 'cap' || key === 'amount' || key === 'balance' || 
             key === 'value' || key.includes('_amount') || key.includes('_balance')) &&
            /^-?[0-9]+$/.test(value)) {
      result[key] = BigInt(value);
    }
    // Recursively convert nested objects
    else if (typeof value === 'object') {
      result[key] = convertNullToUndefined(value);
    }
    else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Set WASM hash for Allowlist token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Allowlist token contract
 */
export async function setAllowlistWasm(
  params: { admin: string, wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call set_allowlist_wasm using official bindings
  const assembled = await client.set_allowlist_wasm({
    admin: params.admin,
    wasm_hash: Buffer.from(params.wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Set WASM hash for Blocklist token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Blocklist token contract
 */
export async function setBlocklistWasm(
  params: { admin: string, wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call set_blocklist_wasm using official bindings
  const assembled = await client.set_blocklist_wasm({
    admin: params.admin,
    wasm_hash: Buffer.from(params.wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Set WASM hash for Capped token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Capped token contract
 */
export async function setCappedWasm(
  params: { admin: string, wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call set_capped_wasm using official bindings
  const assembled = await client.set_capped_wasm({
    admin: params.admin,
    wasm_hash: Buffer.from(params.wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Set WASM hash for Pausable token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Pausable token contract
 */
export async function setPausableWasm(
  params: { admin: string, wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call set_pausable_wasm using official bindings
  const assembled = await client.set_pausable_wasm({
    admin: params.admin,
    wasm_hash: Buffer.from(params.wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Set WASM hash for Vault token type

# Arguments
* `admin` - Admin address (for authorization)
* `wasm_hash` - WASM hash of the Vault token contract
 */
export async function setVaultWasm(
  params: { admin: string, wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call set_vault_wasm using official bindings
  const assembled = await client.set_vault_wasm({
    admin: params.admin,
    wasm_hash: Buffer.from(params.wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Deploy a token contract with specified configuration

# Arguments
* `deployer` - Address calling this function
* `config` - Token configuration including type, admin, supply, etc.

# Returns
Address of the deployed token contract
 */
export async function deployToken(
  params: { deployer: string, config: ContractTypes.TokenConfig },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call deploy_token using official bindings
  const assembled = await client.deploy_token({
    deployer: params.deployer,
    config: convertNullToUndefined(params.config)
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get all deployed tokens

# Returns
Vector of TokenInfo containing all deployed tokens
 */
export async function getDeployedTokens(
  params: {},
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_deployed_tokens using official bindings
  const assembled = await client.get_deployed_tokens({});

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get tokens by type

# Arguments
* `token_type` - Type of tokens to filter by

# Returns
Vector of TokenInfo for the specified type
 */
export async function getTokensByType(
  params: { token_type: ContractTypes.TokenType },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_tokens_by_type using official bindings
  const assembled = await client.get_tokens_by_type({
    token_type: convertNullToUndefined(params.token_type)
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get tokens by admin

# Arguments
* `admin` - Admin address to filter by

# Returns
Vector of TokenInfo for tokens managed by the admin
 */
export async function getTokensByAdmin(
  params: { admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_tokens_by_admin using official bindings
  const assembled = await client.get_tokens_by_admin(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get total number of deployed tokens

# Returns
Total count of deployed tokens
 */
export async function getTokenCount(
  params: {},
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_token_count using official bindings
  const assembled = await client.get_token_count({});

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get admin address

# Returns
Address of the admin
 */
export async function getAdmin(
  params: {},
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_admin using official bindings
  const assembled = await client.get_admin({});

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Get pending admin address (if any)

# Returns
Option containing pending admin address
 */
export async function getPendingAdmin(
  params: {},
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call get_pending_admin using official bindings
  const assembled = await client.get_pending_admin({});

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Pause contract (emergency stop)

# Arguments
* `admin` - Admin address (for authorization)
 */
export async function pause(
  params: { admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call pause using official bindings
  const assembled = await client.pause(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Unpause contract

# Arguments
* `admin` - Admin address (for authorization)
 */
export async function unpause(
  params: { admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call unpause using official bindings
  const assembled = await client.unpause(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Upgrade the factory contract to a new WASM hash

# Arguments
* `new_wasm_hash` - New WASM hash to upgrade to
 */
export async function upgrade(
  params: { new_wasm_hash: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call upgrade using official bindings
  const assembled = await client.upgrade({
    new_wasm_hash: Buffer.from(params.new_wasm_hash, 'hex')
  });

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Initiate admin transfer (step 1 of 2-step process)

# Arguments
* `current_admin` - Current admin address (must match stored admin)
* `new_admin` - New admin address
 */
export async function initiateAdminTransfer(
  params: { current_admin: string, new_admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call initiate_admin_transfer using official bindings
  const assembled = await client.initiate_admin_transfer(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Accept admin transfer (step 2 of 2-step process)

# Arguments
* `new_admin` - New admin address accepting the role
 */
export async function acceptAdminTransfer(
  params: { new_admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call accept_admin_transfer using official bindings
  const assembled = await client.accept_admin_transfer(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

/**
 * Cancel pending admin transfer

# Arguments
* `current_admin` - Current admin address
 */
export async function cancelAdminTransfer(
  params: { current_admin: string },
  config: ContractConfig
): Promise<{ xdr: string; simulationResult?: any }> {
  const client = createClient(config);

  // Call cancel_admin_transfer using official bindings
  const assembled = await client.cancel_admin_transfer(params);

  // assembled.result contains the simulated result
  return {
    xdr: assembled.built!.toXDR(),
    simulationResult: assembled.result,
  };
}

