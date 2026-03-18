import { Router } from 'express';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const chatRouter = Router();

// MCP Server URL - use /mcp endpoint for HTTP transport
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp';

// Type definitions for MCP JSON-RPC
interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

interface MCPToolsListResult {
  tools: MCPTool[];
}

interface MCPToolCallResult {
  content: Array<{
    type: string;
    text?: string;
  }>;
  isError?: boolean;
}

// Helper to parse SSE response from MCP server
function parseSSEResponse(text: string): any {
  // SSE format: "event: message\ndata: {...}\n\n"
  // FastMCP sends multiple events - we need the last one with a result
  const lines = text.split('\n');
  const events: any[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        events.push(JSON.parse(line.substring(6)));
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  // Find the last event with a result or id match (not a notification)
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].result !== undefined || events[i].error !== undefined) {
      return events[i];
    }
  }

  // Fallback: return the last event or try to parse as plain JSON
  if (events.length > 0) {
    return events[events.length - 1];
  }
  return JSON.parse(text);
}

// Helper to make JSON-RPC calls to MCP server
async function mcpJsonRpc<T>(method: string, params?: Record<string, any>): Promise<T> {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: params || {},
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
  }

  // Read response as text first, then parse
  const text = await response.text();
  const data = parseSSEResponse(text);

  if (data.error) {
    throw new Error(`MCP error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result;
}

// Fetch tools list from MCP server via JSON-RPC
async function fetchMCPTools(): Promise<MCPTool[]> {
  // First initialize the server (required for MCP protocol)
  await mcpJsonRpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'frontend-chat', version: '1.0.0' },
  });

  // Then get tools list
  const result = await mcpJsonRpc<MCPToolsListResult>('tools/list', {});
  return result.tools;
}

// Call a tool on the MCP server via JSON-RPC
async function callMCPTool(name: string, args: Record<string, any>): Promise<MCPToolCallResult> {
  // Initialize first (stateless mode requires this for each request)
  await mcpJsonRpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'frontend-chat', version: '1.0.0' },
  });

  // Then call the tool
  return mcpJsonRpc<MCPToolCallResult>('tools/call', {
    name,
    arguments: args,
  });
}

// Convert a single JSON Schema property to Zod type
function convertPropertyToZod(prop: any, isRequired: boolean): z.ZodType<any> {
  let zodType: z.ZodType<any>;

  // Handle anyOf (union types)
  if (prop.anyOf) {
    const variants = prop.anyOf.map((variant: any) => convertPropertyToZod(variant, true));
    zodType = z.union(variants as [z.ZodType<any>, z.ZodType<any>, ...z.ZodType<any>[]]);
    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }
    if (!isRequired) {
      zodType = zodType.optional();
    }
    return zodType;
  }

  // Handle array type like ["string", "null"]
  if (Array.isArray(prop.type)) {
    const hasNull = prop.type.includes('null');
    const nonNullType = prop.type.find((t: string) => t !== 'null');
    zodType = convertPropertyToZod({ ...prop, type: nonNullType }, true);
    if (hasNull) {
      zodType = zodType.nullable();
    }
    if (!isRequired) {
      zodType = zodType.optional();
    }
    return zodType;
  }

  // Handle const values
  if (prop.const !== undefined) {
    zodType = z.literal(prop.const);
    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }
    if (!isRequired) {
      zodType = zodType.optional();
    }
    return zodType;
  }

  switch (prop.type) {
    case 'string':
      zodType = z.string();
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      break;
    case 'number':
    case 'integer':
      zodType = z.number();
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      break;
    case 'boolean':
      zodType = z.boolean();
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      break;
    case 'null':
      zodType = z.null();
      break;
    case 'object':
      // Recursively handle nested objects with their own properties
      if (prop.properties) {
        const nestedShape: Record<string, z.ZodType<any>> = {};
        for (const [nestedKey, nestedProp] of Object.entries(prop.properties)) {
          const nestedRequired = prop.required?.includes(nestedKey) ?? false;
          nestedShape[nestedKey] = convertPropertyToZod(nestedProp, nestedRequired);
        }
        zodType = z.object(nestedShape);
      } else {
        // Generic object without defined properties
        zodType = z.record(z.any());
      }
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      break;
    case 'array':
      if (prop.items) {
        zodType = z.array(convertPropertyToZod(prop.items, true));
      } else {
        zodType = z.array(z.any());
      }
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      break;
    default:
      zodType = z.any();
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
  }

  if (!isRequired) {
    zodType = zodType.optional();
  }

  return zodType;
}

// Convert MCP tool schema to Zod schema
function convertToZodSchema(inputSchema?: MCPTool['inputSchema']): z.ZodType<any> {
  if (!inputSchema || !inputSchema.properties) {
    return z.object({});
  }

  const shape: Record<string, z.ZodType<any>> = {};

  for (const [key, prop] of Object.entries(inputSchema.properties)) {
    const isRequired = inputSchema.required?.includes(key) ?? false;
    shape[key] = convertPropertyToZod(prop, isRequired);
  }

  return z.object(shape);
}

// Convert MCP tools to AI SDK tools format
// pendingXdr: XDR stored in frontend state, used to prevent AI from corrupting XDR strings
function convertMCPToolsToAISDK(mcpTools: MCPTool[], pendingXdr?: string): any {
  const tools: any = {};

  for (const mcpTool of mcpTools) {
    const zodSchema = convertToZodSchema(mcpTool.inputSchema);

    tools[mcpTool.name] = tool({
      description: mcpTool.description || `Execute ${mcpTool.name}`,
      parameters: zodSchema,
      execute: async (args) => {
        console.log(`[Tool] Calling MCP tool: ${mcpTool.name}`, args);

        // XDR INTERCEPTION: For sign_and_submit/sign-and-submit, replace AI's XDR with the stored pendingXdr
        // This prevents XDR corruption/truncation that happens when AI reconstructs long strings
        let finalArgs = args;
        const toolNameLower = mcpTool.name.toLowerCase();
        if ((toolNameLower === 'sign_and_submit' || toolNameLower === 'sign-and-submit') && pendingXdr) {
          console.log('[Tool] XDR Interception: Using pendingXdr instead of AI-provided XDR');
          console.log('[Tool] AI provided XDR length:', args.xdr?.length || 0);
          console.log('[Tool] Pending XDR length:', pendingXdr.length);
          finalArgs = {
            ...args,
            xdr: pendingXdr, // Use the stored XDR from frontend
          };
        }

        try {
          const result = await callMCPTool(mcpTool.name, finalArgs);

          // Extract text content from MCP response
          const textContent = result.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');

          console.log(`[Tool] ${mcpTool.name} result:`, textContent.substring(0, 200));

          // Try to parse as JSON, otherwise return as-is
          try {
            return JSON.parse(textContent);
          } catch {
            return { result: textContent };
          }
        } catch (error) {
          console.error(`[Tool] ${mcpTool.name} error:`, error);
          return {
            error: true,
            message: error instanceof Error ? error.message : 'Tool execution failed',
          };
        }
      },
    });
  }

  return tools;
}

function buildSystemPrompt(authMode: string, walletAddress?: string | null): string {
  // Build mode-specific instructions
  const walletModeInstructions = `
**WALLET MODE - Transaction Flow:**
You are in WALLET mode. The user will sign transactions with their connected wallet in the browser.

For write operations (state-changing functions):
1. First, call the contract function tool (e.g., deploy-token, pause, etc.) to get the initial XDR
2. Then, call "prepare-transaction" with:
   - xdr: the XDR from step 1
   - walletAddress: "${walletAddress}"
   - toolName: name of the function called
   - params: the parameters used
3. Return the walletReadyXdr to the user - the frontend will display a "Sign Transaction" button
4. DO NOT call "sign-and-submit" - the user signs in their wallet via the frontend UI

Example flow:
1. User: "Deploy a token"
2. You: Call deploy-token tool → get XDR
3. You: Call prepare-transaction with the XDR and wallet address
4. You: Return the transaction details with walletReadyXdr for frontend signing`;

  const secretKeyModeInstructions = `
**SECRET KEY MODE - Transaction Flow:**
You are in SECRET KEY mode. Transactions are signed server-side using a Stellar secret key.

**IMPORTANT: Distinguishing Read vs Write Operations**
- READ operations (get-balance, get-admin, get-deployed-tokens, etc.): Just return the data directly. NO signing needed!
- WRITE operations (deploy-token, pause, transfer, mint, etc.): Require signing with prepare-sign-and-submit

For READ operations:
1. Call the contract function tool
2. Return the data/result directly to the user
3. DO NOT call prepare-sign-and-submit for read operations

For WRITE operations (state-changing functions):
1. First, call the contract function tool (e.g., deploy-token, pause, etc.) to get the XDR and simulation
2. Then, call "prepare-sign-and-submit" with:
   - xdr: the XDR from step 1
   - toolName: name of the function called (e.g., "deploy-token")
   - params: the parameters used
   - simulationResult: the simulation result from step 1
3. The frontend will display a signing UI where the user enters their secret key
4. DO NOT call sign-and-submit directly - the user triggers that from the UI after providing their key

Example write flow:
1. User: "Deploy a token called MyToken"
2. You: Call deploy-token tool → get XDR + simulation result
3. You: Call prepare-sign-and-submit with the XDR, toolName, params, and simulationResult
4. Frontend shows signing card with secret key input
5. User enters key and clicks sign - frontend handles the rest

Example read flow:
1. User: "What tokens are deployed?"
2. You: Call get-deployed-tokens tool → get list of tokens
3. You: Return the token list directly to the user (NO prepare-sign-and-submit!)

**Key Rules:**
- NEVER call prepare-sign-and-submit for read/query operations
- ALWAYS call prepare-sign-and-submit for write operations before the user can sign
- DO NOT call sign-and-submit directly - the frontend handles that after prepare-sign-and-submit`;

  const modeInstructions = authMode === 'wallet' ? walletModeInstructions : secretKeyModeInstructions;

  return `You are an AI assistant for interacting with Stellar smart contracts through the Model Context Protocol (MCP).

**Your Role:**
- Help users interact with Stellar smart contracts using natural language
- Call MCP tools to execute contract functions
- Explain what you're doing in clear, simple terms

**User Context:**
- Auth Mode: ${authMode}
${walletAddress ? `- Connected Wallet: ${walletAddress}` : '- No wallet connected'}
- Network: Stellar Testnet
${modeInstructions}

**CRITICAL: XDR Handling Rules**

XDR (External Data Representation) strings are base64-encoded transaction data. They are BINARY DATA that must be preserved EXACTLY.

⚠️ NEVER modify, truncate, summarize, or abbreviate XDR strings!
⚠️ When passing XDR between tools, copy the COMPLETE string character-for-character
⚠️ XDR strings can be 500-2000+ characters - this is normal and expected
⚠️ Even a single character change will corrupt the transaction and cause errors

**Response Format:**

For write operations in WALLET mode, return:
\`\`\`json
{
  "data": { ...operation parameters... },
  "transaction": {
    "xdr": "<WALLET_READY_XDR from prepare-transaction>",
    "contractAddress": "CXXX...",
    "method": "function_name",
    "network": "testnet",
    "params": { ...parameters... }
  }
}
\`\`\`

For read operations, return:
\`\`\`json
{
  "data": { ...query results... }
}
\`\`\`

**Guidelines:**
- Be concise but informative
- Always explain what a transaction will do before asking for approval
- If the user's request is ambiguous, ask clarifying questions
- If an operation requires parameters you don't have, ask for them
- Never make assumptions about amounts, addresses, or critical parameters

Remember: User safety and transparency are paramount. Never execute write operations without explicit user confirmation.`;
}

// Endpoint to fetch available tools from MCP server
chatRouter.get('/tools', async (_req, res) => {
  try {
    const mcpTools = await fetchMCPTools();

    // Convert to frontend format
    const toolsArray = mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema || {},
    }));

    res.json({ tools: toolsArray });
  } catch (error) {
    console.error('Tools fetch error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch tools'
    });
  }
});

// Helper function to filter messages with incomplete tool invocations
function filterMessagesForAPI(messages: any[]): any[] {
  return messages
    .map((msg) => {
      // If message has toolInvocations, filter out incomplete ones
      if (msg.toolInvocations && Array.isArray(msg.toolInvocations)) {
        const completeInvocations = msg.toolInvocations.filter(
          (inv: any) => inv.state === 'result' && inv.result !== undefined
        );

        // If no complete invocations, return message without toolInvocations
        if (completeInvocations.length === 0) {
          const { toolInvocations, ...rest } = msg;
          // If the message has no content and no complete tool invocations, skip it
          if (!rest.content || rest.content === '') {
            return null;
          }
          return rest;
        }

        return { ...msg, toolInvocations: completeInvocations };
      }
      return msg;
    })
    .filter((msg) => msg !== null);
}

chatRouter.post('/chat', async (req, res) => {
  try {
    const { messages: rawMessages, authMode, walletAddress, pendingXdr } = req.body;

    if (!rawMessages || !Array.isArray(rawMessages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Filter out messages with incomplete tool invocations to prevent AI_MessageConversionError
    const messages = filterMessagesForAPI(rawMessages);

    console.log('[Chat] Filtered messages:', messages.length, 'from', rawMessages.length);
    if (pendingXdr) {
      console.log('[Chat] Pending XDR received, length:', pendingXdr.length);
    }

    // Determine which AI provider to use
    const provider = process.env.AI_PROVIDER || 'openai';

    let model;
    if (provider === 'anthropic') {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'ANTHROPIC_API_KEY not configured in .env'
        });
      }
      model = anthropic('claude-3-5-sonnet-20241022');
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'OPENAI_API_KEY not configured in .env'
        });
      }
      model = openai('gpt-4o');
    }

    // Fetch MCP tools and convert to AI SDK format
    // Pass pendingXdr for XDR interception on sign_and_submit calls
    console.log('[Chat] Fetching tools from MCP server...');
    const mcpTools = await fetchMCPTools();
    const tools = convertMCPToolsToAISDK(mcpTools, pendingXdr);

    console.log('[Chat] Got tools from MCP:', Object.keys(tools).length, 'tools');

    // Build system prompt with prepare-transaction guidance
    const systemPrompt = buildSystemPrompt(authMode, walletAddress);

    // Stream AI response with MCP tools
    console.log('[Chat] Calling streamText with provider:', provider);
    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5, // Allow multi-step tool usage
      onChunk: async ({ chunk }) => {
        console.log('[Chat] Chunk:', chunk.type);
      },
      onFinish: async ({ finishReason, usage }) => {
        console.log('[Chat] Stream finished:', finishReason, usage);
      },
      onError: async (error: any) => {
        console.error('[Chat] Stream error:', error);
        // Check for quota error
        if (error?.error?.lastError?.statusCode === 429 ||
            error?.error?.reason === 'maxRetriesExceeded') {
          console.error('[Chat] API quota exceeded! Please check your billing.');
        }
      },
    });

    // Pipe the stream to response (handles headers automatically)
    result.pipeDataStreamToResponse(res);

  } catch (error) {
    console.error('Chat error:', error);
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if ('cause' in error) {
        console.error('Error cause:', error.cause);
      }
    }
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

