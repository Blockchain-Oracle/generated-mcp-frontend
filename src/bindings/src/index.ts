import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBX7HKQ6WIOYAHS6SLL7Y3MRPTYOSGJTDL6XXYYOTEWEN3PRGK3DSVZG",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "PendingAdmin", values: void} | {tag: "AllowlistWasm", values: void} | {tag: "BlocklistWasm", values: void} | {tag: "CappedWasm", values: void} | {tag: "PausableWasm", values: void} | {tag: "VaultWasm", values: void} | {tag: "DeployedTokens", values: void} | {tag: "TokenCount", values: void} | {tag: "Paused", values: void};

export type TokenType = {tag: "Allowlist", values: void} | {tag: "Blocklist", values: void} | {tag: "Capped", values: void} | {tag: "Pausable", values: void} | {tag: "Vault", values: void};


export interface TokenConfig {
  admin: string;
  asset: Option<string>;
  cap: Option<i128>;
  decimals: u32;
  decimals_offset: Option<u32>;
  initial_supply: i128;
  manager: string;
  name: string;
  salt: Buffer;
  symbol: string;
  token_type: TokenType;
}


export interface TokenInfo {
  address: string;
  admin: string;
  name: Option<string>;
  timestamp: u64;
  token_type: TokenType;
}









export const TokenFactoryError = {
  1: {message:"NotAdmin"},
  2: {message:"WasmNotSet"},
  3: {message:"InvalidTokenType"},
  4: {message:"InvalidConfig"},
  5: {message:"InvalidName"},
  6: {message:"InvalidSymbol"},
  7: {message:"InvalidDecimals"},
  8: {message:"NegativeSupply"},
  9: {message:"MissingCap"},
  10: {message:"CapTooLow"},
  11: {message:"UnexpectedCap"},
  12: {message:"AdminNotSet"},
  13: {message:"CounterOverflow"},
  14: {message:"InvalidCharacters"},
  15: {message:"SupplyTooLarge"},
  16: {message:"NoPendingAdmin"},
  17: {message:"NotPendingAdmin"},
  18: {message:"ContractPaused"}
}

export interface Client {
  /**
   * Construct and simulate a set_allowlist_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set WASM hash for Allowlist token type
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   * * `wasm_hash` - WASM hash of the Allowlist token contract
   */
  set_allowlist_wasm: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_blocklist_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set WASM hash for Blocklist token type
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   * * `wasm_hash` - WASM hash of the Blocklist token contract
   */
  set_blocklist_wasm: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_capped_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set WASM hash for Capped token type
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   * * `wasm_hash` - WASM hash of the Capped token contract
   */
  set_capped_wasm: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_pausable_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set WASM hash for Pausable token type
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   * * `wasm_hash` - WASM hash of the Pausable token contract
   */
  set_pausable_wasm: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_vault_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set WASM hash for Vault token type
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   * * `wasm_hash` - WASM hash of the Vault token contract
   */
  set_vault_wasm: ({admin, wasm_hash}: {admin: string, wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deploy_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deploy a token contract with specified configuration
   * 
   * # Arguments
   * * `deployer` - Address calling this function
   * * `config` - Token configuration including type, admin, supply, etc.
   * 
   * # Returns
   * Address of the deployed token contract
   */
  deploy_token: ({deployer, config}: {deployer: string, config: TokenConfig}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_deployed_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all deployed tokens
   * 
   * # Returns
   * Vector of TokenInfo containing all deployed tokens
   */
  get_deployed_tokens: (options?: MethodOptions) => Promise<AssembledTransaction<Array<TokenInfo>>>

  /**
   * Construct and simulate a get_tokens_by_type transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get tokens by type
   * 
   * # Arguments
   * * `token_type` - Type of tokens to filter by
   * 
   * # Returns
   * Vector of TokenInfo for the specified type
   */
  get_tokens_by_type: ({token_type}: {token_type: TokenType}, options?: MethodOptions) => Promise<AssembledTransaction<Array<TokenInfo>>>

  /**
   * Construct and simulate a get_tokens_by_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get tokens by admin
   * 
   * # Arguments
   * * `admin` - Admin address to filter by
   * 
   * # Returns
   * Vector of TokenInfo for tokens managed by the admin
   */
  get_tokens_by_admin: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<TokenInfo>>>

  /**
   * Construct and simulate a get_token_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of deployed tokens
   * 
   * # Returns
   * Total count of deployed tokens
   */
  get_token_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get admin address
   * 
   * # Returns
   * Address of the admin
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_pending_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get pending admin address (if any)
   * 
   * # Returns
   * Option containing pending admin address
   */
  get_pending_admin: (options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pause contract (emergency stop)
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   */
  pause: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Unpause contract
   * 
   * # Arguments
   * * `admin` - Admin address (for authorization)
   */
  unpause: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Upgrade the factory contract to a new WASM hash
   * 
   * # Arguments
   * * `new_wasm_hash` - New WASM hash to upgrade to
   */
  upgrade: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a initiate_admin_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initiate admin transfer (step 1 of 2-step process)
   * 
   * # Arguments
   * * `current_admin` - Current admin address (must match stored admin)
   * * `new_admin` - New admin address
   */
  initiate_admin_transfer: ({current_admin, new_admin}: {current_admin: string, new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a accept_admin_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Accept admin transfer (step 2 of 2-step process)
   * 
   * # Arguments
   * * `new_admin` - New admin address accepting the role
   */
  accept_admin_transfer: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel_admin_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel pending admin transfer
   * 
   * # Arguments
   * * `current_admin` - Current admin address
   */
  cancel_admin_transfer: ({current_admin}: {current_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin}: {admin: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMUGVuZGluZ0FkbWluAAAAAAAAAAAAAAANQWxsb3dsaXN0V2FzbQAAAAAAAAAAAAAAAAAADUJsb2NrbGlzdFdhc20AAAAAAAAAAAAAAAAAAApDYXBwZWRXYXNtAAAAAAAAAAAAAAAAAAxQYXVzYWJsZVdhc20AAAAAAAAAAAAAAAlWYXVsdFdhc20AAAAAAAAAAAAAAAAAAA5EZXBsb3llZFRva2VucwAAAAAAAAAAAAAAAAAKVG9rZW5Db3VudAAAAAAAAAAAAAAAAAAGUGF1c2VkAAA=",
        "AAAAAgAAAAAAAAAAAAAACVRva2VuVHlwZQAAAAAAAAUAAAAAAAAAAAAAAAlBbGxvd2xpc3QAAAAAAAAAAAAAAAAAAAlCbG9ja2xpc3QAAAAAAAAAAAAAAAAAAAZDYXBwZWQAAAAAAAAAAAAAAAAACFBhdXNhYmxlAAAAAAAAAAAAAAAFVmF1bHQAAAA=",
        "AAAAAQAAAAAAAAAAAAAAC1Rva2VuQ29uZmlnAAAAAAsAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAFYXNzZXQAAAAAAAPoAAAAEwAAAAAAAAADY2FwAAAAA+gAAAALAAAAAAAAAAhkZWNpbWFscwAAAAQAAAAAAAAAD2RlY2ltYWxzX29mZnNldAAAAAPoAAAABAAAAAAAAAAOaW5pdGlhbF9zdXBwbHkAAAAAAAsAAAAAAAAAB21hbmFnZXIAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAGc3ltYm9sAAAAAAAQAAAAAAAAAAp0b2tlbl90eXBlAAAAAAfQAAAACVRva2VuVHlwZQAAAA==",
        "AAAAAQAAAAAAAAAAAAAACVRva2VuSW5mbwAAAAAAAAUAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAARuYW1lAAAD6AAAABAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAACnRva2VuX3R5cGUAAAAAB9AAAAAJVG9rZW5UeXBlAAAA",
        "AAAABQAAAAAAAAAAAAAAElRva2VuRGVwbG95ZWRFdmVudAAAAAAAAQAAABR0b2tlbl9kZXBsb3llZF9ldmVudAAAAAYAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAAAAAAAAAAAKdG9rZW5fdHlwZQAAAAAH0AAAAAlUb2tlblR5cGUAAAAAAAAAAAAAAAAAAAhkZXBsb3llcgAAABMAAAAAAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAAAAAABnN5bWJvbAAAAAAAEAAAAAAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAEFdhc21VcGRhdGVkRXZlbnQAAAABAAAAEndhc21fdXBkYXRlZF9ldmVudAAAAAAAAgAAAAAAAAAPdG9rZW5fdHlwZV9uYW1lAAAAABAAAAAAAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAE0NvbnRyYWN0UGF1c2VkRXZlbnQAAAAAAQAAABVjb250cmFjdF9wYXVzZWRfZXZlbnQAAAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAAFUNvbnRyYWN0VW5wYXVzZWRFdmVudAAAAAAAAAEAAAAXY29udHJhY3RfdW5wYXVzZWRfZXZlbnQAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAFUNvbnRyYWN0VXBncmFkZWRFdmVudAAAAAAAAAEAAAAXY29udHJhY3RfdXBncmFkZWRfZXZlbnQAAAAAAQAAAAAAAAANbmV3X3dhc21faGFzaAAAAAAAA+4AAAAgAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAG0FkbWluVHJhbnNmZXJJbml0aWF0ZWRFdmVudAAAAAABAAAAHmFkbWluX3RyYW5zZmVyX2luaXRpYXRlZF9ldmVudAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAFUFkbWluVHJhbnNmZXJyZWRFdmVudAAAAAAAAAEAAAAXYWRtaW5fdHJhbnNmZXJyZWRfZXZlbnQAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAG0FkbWluVHJhbnNmZXJDYW5jZWxsZWRFdmVudAAAAAABAAAAHmFkbWluX3RyYW5zZmVyX2NhbmNlbGxlZF9ldmVudAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAI=",
        "AAAABAAAAAAAAAAAAAAAEVRva2VuRmFjdG9yeUVycm9yAAAAAAAAEgAAAAAAAAAITm90QWRtaW4AAAABAAAAAAAAAApXYXNtTm90U2V0AAAAAAACAAAAAAAAABBJbnZhbGlkVG9rZW5UeXBlAAAAAwAAAAAAAAANSW52YWxpZENvbmZpZwAAAAAAAAQAAAAAAAAAC0ludmFsaWROYW1lAAAAAAUAAAAAAAAADUludmFsaWRTeW1ib2wAAAAAAAAGAAAAAAAAAA9JbnZhbGlkRGVjaW1hbHMAAAAABwAAAAAAAAAOTmVnYXRpdmVTdXBwbHkAAAAAAAgAAAAAAAAACk1pc3NpbmdDYXAAAAAAAAkAAAAAAAAACUNhcFRvb0xvdwAAAAAAAAoAAAAAAAAADVVuZXhwZWN0ZWRDYXAAAAAAAAALAAAAAAAAAAtBZG1pbk5vdFNldAAAAAAMAAAAAAAAAA9Db3VudGVyT3ZlcmZsb3cAAAAADQAAAAAAAAARSW52YWxpZENoYXJhY3RlcnMAAAAAAAAOAAAAAAAAAA5TdXBwbHlUb29MYXJnZQAAAAAADwAAAAAAAAAOTm9QZW5kaW5nQWRtaW4AAAAAABAAAAAAAAAAD05vdFBlbmRpbmdBZG1pbgAAAAARAAAAAAAAAA5Db250cmFjdFBhdXNlZAAAAAAAEg==",
        "AAAAAAAAAGtJbml0aWFsaXplIFRva2VuRmFjdG9yeSB3aXRoIGFkbWluIGFkZHJlc3MKCiMgQXJndW1lbnRzCiogYGFkbWluYCAtIEFkZHJlc3MgdGhhdCB3aWxsIGhhdmUgYWRtaW4gcHJpdmlsZWdlcwAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAJtTZXQgV0FTTSBoYXNoIGZvciBBbGxvd2xpc3QgdG9rZW4gdHlwZQoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gQWRtaW4gYWRkcmVzcyAoZm9yIGF1dGhvcml6YXRpb24pCiogYHdhc21faGFzaGAgLSBXQVNNIGhhc2ggb2YgdGhlIEFsbG93bGlzdCB0b2tlbiBjb250cmFjdAAAAAASc2V0X2FsbG93bGlzdF93YXNtAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAJtTZXQgV0FTTSBoYXNoIGZvciBCbG9ja2xpc3QgdG9rZW4gdHlwZQoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gQWRtaW4gYWRkcmVzcyAoZm9yIGF1dGhvcml6YXRpb24pCiogYHdhc21faGFzaGAgLSBXQVNNIGhhc2ggb2YgdGhlIEJsb2NrbGlzdCB0b2tlbiBjb250cmFjdAAAAAASc2V0X2Jsb2NrbGlzdF93YXNtAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAJVTZXQgV0FTTSBoYXNoIGZvciBDYXBwZWQgdG9rZW4gdHlwZQoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gQWRtaW4gYWRkcmVzcyAoZm9yIGF1dGhvcml6YXRpb24pCiogYHdhc21faGFzaGAgLSBXQVNNIGhhc2ggb2YgdGhlIENhcHBlZCB0b2tlbiBjb250cmFjdAAAAAAAAA9zZXRfY2FwcGVkX3dhc20AAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=",
        "AAAAAAAAAJlTZXQgV0FTTSBoYXNoIGZvciBQYXVzYWJsZSB0b2tlbiB0eXBlCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzIChmb3IgYXV0aG9yaXphdGlvbikKKiBgd2FzbV9oYXNoYCAtIFdBU00gaGFzaCBvZiB0aGUgUGF1c2FibGUgdG9rZW4gY29udHJhY3QAAAAAAAARc2V0X3BhdXNhYmxlX3dhc20AAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAJNTZXQgV0FTTSBoYXNoIGZvciBWYXVsdCB0b2tlbiB0eXBlCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzIChmb3IgYXV0aG9yaXphdGlvbikKKiBgd2FzbV9oYXNoYCAtIFdBU00gaGFzaCBvZiB0aGUgVmF1bHQgdG9rZW4gY29udHJhY3QAAAAADnNldF92YXVsdF93YXNtAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAOVEZXBsb3kgYSB0b2tlbiBjb250cmFjdCB3aXRoIHNwZWNpZmllZCBjb25maWd1cmF0aW9uCgojIEFyZ3VtZW50cwoqIGBkZXBsb3llcmAgLSBBZGRyZXNzIGNhbGxpbmcgdGhpcyBmdW5jdGlvbgoqIGBjb25maWdgIC0gVG9rZW4gY29uZmlndXJhdGlvbiBpbmNsdWRpbmcgdHlwZSwgYWRtaW4sIHN1cHBseSwgZXRjLgoKIyBSZXR1cm5zCkFkZHJlc3Mgb2YgdGhlIGRlcGxveWVkIHRva2VuIGNvbnRyYWN0AAAAAAAADGRlcGxveV90b2tlbgAAAAIAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAGY29uZmlnAAAAAAfQAAAAC1Rva2VuQ29uZmlnAAAAAAEAAAAT",
        "AAAAAAAAAFVHZXQgYWxsIGRlcGxveWVkIHRva2VucwoKIyBSZXR1cm5zClZlY3RvciBvZiBUb2tlbkluZm8gY29udGFpbmluZyBhbGwgZGVwbG95ZWQgdG9rZW5zAAAAAAAAE2dldF9kZXBsb3llZF90b2tlbnMAAAAAAAAAAAEAAAPqAAAH0AAAAAlUb2tlbkluZm8AAAA=",
        "AAAAAAAAAIJHZXQgdG9rZW5zIGJ5IHR5cGUKCiMgQXJndW1lbnRzCiogYHRva2VuX3R5cGVgIC0gVHlwZSBvZiB0b2tlbnMgdG8gZmlsdGVyIGJ5CgojIFJldHVybnMKVmVjdG9yIG9mIFRva2VuSW5mbyBmb3IgdGhlIHNwZWNpZmllZCB0eXBlAAAAAAASZ2V0X3Rva2Vuc19ieV90eXBlAAAAAAABAAAAAAAAAAp0b2tlbl90eXBlAAAAAAfQAAAACVRva2VuVHlwZQAAAAAAAAEAAAPqAAAH0AAAAAlUb2tlbkluZm8AAAA=",
        "AAAAAAAAAIZHZXQgdG9rZW5zIGJ5IGFkbWluCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzIHRvIGZpbHRlciBieQoKIyBSZXR1cm5zClZlY3RvciBvZiBUb2tlbkluZm8gZm9yIHRva2VucyBtYW5hZ2VkIGJ5IHRoZSBhZG1pbgAAAAAAE2dldF90b2tlbnNfYnlfYWRtaW4AAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+oAAAfQAAAACVRva2VuSW5mbwAAAA==",
        "AAAAAAAAAE1HZXQgdG90YWwgbnVtYmVyIG9mIGRlcGxveWVkIHRva2VucwoKIyBSZXR1cm5zClRvdGFsIGNvdW50IG9mIGRlcGxveWVkIHRva2VucwAAAAAAAA9nZXRfdG9rZW5fY291bnQAAAAAAAAAAAEAAAAE",
        "AAAAAAAAADFHZXQgYWRtaW4gYWRkcmVzcwoKIyBSZXR1cm5zCkFkZHJlc3Mgb2YgdGhlIGFkbWluAAAAAAAACWdldF9hZG1pbgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAFVHZXQgcGVuZGluZyBhZG1pbiBhZGRyZXNzIChpZiBhbnkpCgojIFJldHVybnMKT3B0aW9uIGNvbnRhaW5pbmcgcGVuZGluZyBhZG1pbiBhZGRyZXNzAAAAAAAAEWdldF9wZW5kaW5nX2FkbWluAAAAAAAAAAAAAAEAAAPoAAAAEw==",
        "AAAAAAAAAFpQYXVzZSBjb250cmFjdCAoZW1lcmdlbmN5IHN0b3ApCgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzIChmb3IgYXV0aG9yaXphdGlvbikAAAAAAAVwYXVzZQAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAEtVbnBhdXNlIGNvbnRyYWN0CgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzIChmb3IgYXV0aG9yaXphdGlvbikAAAAAB3VucGF1c2UAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAGxVcGdyYWRlIHRoZSBmYWN0b3J5IGNvbnRyYWN0IHRvIGEgbmV3IFdBU00gaGFzaAoKIyBBcmd1bWVudHMKKiBgbmV3X3dhc21faGFzaGAgLSBOZXcgV0FTTSBoYXNoIHRvIHVwZ3JhZGUgdG8AAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAKVJbml0aWF0ZSBhZG1pbiB0cmFuc2ZlciAoc3RlcCAxIG9mIDItc3RlcCBwcm9jZXNzKQoKIyBBcmd1bWVudHMKKiBgY3VycmVudF9hZG1pbmAgLSBDdXJyZW50IGFkbWluIGFkZHJlc3MgKG11c3QgbWF0Y2ggc3RvcmVkIGFkbWluKQoqIGBuZXdfYWRtaW5gIC0gTmV3IGFkbWluIGFkZHJlc3MAAAAAAAAXaW5pdGlhdGVfYWRtaW5fdHJhbnNmZXIAAAAAAgAAAAAAAAANY3VycmVudF9hZG1pbgAAAAAAABMAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAAA",
        "AAAAAAAAAHJBY2NlcHQgYWRtaW4gdHJhbnNmZXIgKHN0ZXAgMiBvZiAyLXN0ZXAgcHJvY2VzcykKCiMgQXJndW1lbnRzCiogYG5ld19hZG1pbmAgLSBOZXcgYWRtaW4gYWRkcmVzcyBhY2NlcHRpbmcgdGhlIHJvbGUAAAAAABVhY2NlcHRfYWRtaW5fdHJhbnNmZXIAAAAAAAABAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAFRDYW5jZWwgcGVuZGluZyBhZG1pbiB0cmFuc2ZlcgoKIyBBcmd1bWVudHMKKiBgY3VycmVudF9hZG1pbmAgLSBDdXJyZW50IGFkbWluIGFkZHJlc3MAAAAVY2FuY2VsX2FkbWluX3RyYW5zZmVyAAAAAAAAAQAAAAAAAAANY3VycmVudF9hZG1pbgAAAAAAABMAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    set_allowlist_wasm: this.txFromJSON<null>,
        set_blocklist_wasm: this.txFromJSON<null>,
        set_capped_wasm: this.txFromJSON<null>,
        set_pausable_wasm: this.txFromJSON<null>,
        set_vault_wasm: this.txFromJSON<null>,
        deploy_token: this.txFromJSON<string>,
        get_deployed_tokens: this.txFromJSON<Array<TokenInfo>>,
        get_tokens_by_type: this.txFromJSON<Array<TokenInfo>>,
        get_tokens_by_admin: this.txFromJSON<Array<TokenInfo>>,
        get_token_count: this.txFromJSON<u32>,
        get_admin: this.txFromJSON<string>,
        get_pending_admin: this.txFromJSON<Option<string>>,
        pause: this.txFromJSON<null>,
        unpause: this.txFromJSON<null>,
        upgrade: this.txFromJSON<null>,
        initiate_admin_transfer: this.txFromJSON<null>,
        accept_admin_transfer: this.txFromJSON<null>,
        cancel_admin_transfer: this.txFromJSON<null>
  }
}