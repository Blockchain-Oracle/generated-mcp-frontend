import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check with config status
app.get('/health', (_req, res) => {
  const provider = process.env.AI_PROVIDER || 'openai';
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasMcpServer = !!process.env.MCP_SERVER_URL;

  // Check if required API key is configured based on provider
  const hasRequiredApiKey = provider === 'anthropic' ? hasAnthropic : hasOpenAI;

  const errors: string[] = [];
  if (!hasRequiredApiKey) {
    errors.push(provider === 'anthropic'
      ? 'ANTHROPIC_API_KEY not configured'
      : 'OPENAI_API_KEY not configured');
  }

  res.json({
    status: errors.length === 0 ? 'ok' : 'degraded',
    config: {
      provider,
      openai: hasOpenAI,
      anthropic: hasAnthropic,
      mcpServer: hasMcpServer,
      mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp',
    },
    errors: errors.length > 0 ? errors : undefined,
  });
});

// Chat API
app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`   Chat endpoint: http://localhost:${PORT}/api/chat`);
});
