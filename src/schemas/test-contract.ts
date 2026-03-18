// Generated Zod schemas matching official Stellar bindings
import { z } from 'zod';

export const DataKeySchema = z.union([
  z.object({ tag: z.literal('Admin') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('PendingAdmin') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('AllowlistWasm') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('BlocklistWasm') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('CappedWasm') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('PausableWasm') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('VaultWasm') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('DeployedTokens') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('TokenCount') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('Paused') }).transform(v => ({ ...v, values: undefined as void })),
]) as any;

export const TokenTypeSchema = z.union([
  z.object({ tag: z.literal('Allowlist') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('Blocklist') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('Capped') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('Pausable') }).transform(v => ({ ...v, values: undefined as void })),
  z.object({ tag: z.literal('Vault') }).transform(v => ({ ...v, values: undefined as void })),
]) as any;

export const TokenConfigSchema = z.object({
  admin: z.string().length(56),
  asset: z.string().length(56).nullable(),
  cap: z.string().nullable(),
  decimals: z.number(),
  decimals_offset: z.number().nullable(),
  initial_supply: z.string(),
  manager: z.string().length(56),
  name: z.string(),
  salt: z.string().length(64),
  symbol: z.string(),
  token_type: TokenTypeSchema,
});

export const TokenInfoSchema = z.object({
  address: z.string().length(56),
  admin: z.string().length(56),
  name: z.string().nullable(),
  timestamp: z.string(),
  token_type: TokenTypeSchema,
});

export const SetAllowlistWasmParamsSchema = z.object({
  admin: z.string().length(56),
  wasm_hash: z.string().length(64),
});

export const SetBlocklistWasmParamsSchema = z.object({
  admin: z.string().length(56),
  wasm_hash: z.string().length(64),
});

export const SetCappedWasmParamsSchema = z.object({
  admin: z.string().length(56),
  wasm_hash: z.string().length(64),
});

export const SetPausableWasmParamsSchema = z.object({
  admin: z.string().length(56),
  wasm_hash: z.string().length(64),
});

export const SetVaultWasmParamsSchema = z.object({
  admin: z.string().length(56),
  wasm_hash: z.string().length(64),
});

export const DeployTokenParamsSchema = z.object({
  deployer: z.string().length(56),
  config: TokenConfigSchema,
});

export const GetTokensByTypeParamsSchema = z.object({
  token_type: TokenTypeSchema,
});

export const GetTokensByAdminParamsSchema = z.object({
  admin: z.string().length(56),
});

export const PauseParamsSchema = z.object({
  admin: z.string().length(56),
});

export const UnpauseParamsSchema = z.object({
  admin: z.string().length(56),
});

export const UpgradeParamsSchema = z.object({
  new_wasm_hash: z.string().length(64),
});

export const InitiateAdminTransferParamsSchema = z.object({
  current_admin: z.string().length(56),
  new_admin: z.string().length(56),
});

export const AcceptAdminTransferParamsSchema = z.object({
  new_admin: z.string().length(56),
});

export const CancelAdminTransferParamsSchema = z.object({
  current_admin: z.string().length(56),
});

