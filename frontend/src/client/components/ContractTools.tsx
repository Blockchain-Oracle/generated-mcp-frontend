import { useState } from 'react';
import { ToolExecutor } from './ToolExecutor';

interface ContractToolsProps {
  tools: any[];
  authMode: 'secret' | 'wallet';
  secretKey: string;
  walletAddress: string | null;
}

export function ContractTools({
  tools,
  authMode,
  secretKey,
  walletAddress
}: ContractToolsProps) {
  const [selectedTool, setSelectedTool] = useState<any | null>(null);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Contract Functions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools?.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setSelectedTool(tool)}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <h3 className="font-semibold text-lg">{tool.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {tool.description}
            </p>
          </button>
        ))}
      </div>

      {selectedTool && (
        <ToolExecutor
          tool={selectedTool}
          authMode={authMode}
          secretKey={secretKey}
          walletAddress={walletAddress}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}
