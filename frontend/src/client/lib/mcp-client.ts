import { useState, useEffect } from 'react';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';

export const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL ||
  'http://localhost:3000';

interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export function useMcpClient() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    let mounted = true;
    let mcpClient: any = null;

    async function initMcpClient() {
      try {
        setConnectionState('connecting');

        // Create MCP client with HTTP transport
        mcpClient = await createMCPClient({
          transport: {
            type: 'http',
            url: MCP_SERVER_URL,
          },
        });

        // Get tools from MCP server
        const toolsObj = await mcpClient.tools();
        const toolsList = Object.values(toolsObj) as Tool[];

        if (mounted) {
          setTools(toolsList);
          setConnectionState('connected');
        }
      } catch (error) {
        console.error('[useMcpClient] Failed to connect:', error);
        if (mounted) {
          setConnectionState('disconnected');
        }
      }
    }

    initMcpClient();

    return () => {
      mounted = false;
      if (mcpClient) {
        mcpClient.close().catch(console.error);
      }
    };
  }, []);

  const executeTool = async (_toolName: string, _params: any) => {
    // Tool execution will be handled by the AI SDK in the chat
    throw new Error('Direct tool execution not supported - use through chat');
  };

  return {
    connectionState,
    availableTools: tools,
    executeTool,
  };
}
