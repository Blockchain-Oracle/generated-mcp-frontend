import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface ToolCategory {
  name: string;
  icon: string;
  accent: string;
  actions: Array<{
    title: string;
    label: string;
    action: string;
  }>;
}

interface SuggestedActionsProps {
  tools: Tool[];
  onActionClick: (prompt: string) => void;
}

export function SuggestedActions({ tools, onActionClick }: SuggestedActionsProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const categories = categorizeTools(tools);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-full space-y-6 px-4 md:px-0">
      {/* Category Pills */}
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory px-1">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              type="button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory(index);
              }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all snap-start shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeCategory === index
                  ? 'bg-secondary/80 border-primary shadow-sm backdrop-blur-sm'
                  : 'bg-card/50 border-border/50 hover:border-primary/50 hover:bg-secondary/50'
              }`}
              style={
                activeCategory === index
                  ? {
                      borderColor: category.accent,
                      boxShadow: `0 0 20px -10px ${category.accent}`
                    }
                  : undefined
              }
            >
              <span
                style={activeCategory === index ? { color: category.accent } : undefined}
                className={`text-lg transition-colors ${activeCategory === index ? '' : 'text-muted-foreground'}`}
              >
                {category.icon}
              </span>
              <span className={activeCategory === index ? 'text-foreground' : 'text-muted-foreground'}>
                {category.name}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === index
                  ? 'bg-background/50 text-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {category.actions.length}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto pb-4 px-1">
          <div className="flex gap-4">
            <AnimatePresence mode="wait">
              {categories[activeCategory].actions.map((suggestedAction, index) => (
                <motion.div
                  key={`${suggestedAction.title}-${index}`}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 30 }}
                  className="shrink-0 w-[280px] md:w-[320px]"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      onActionClick(suggestedAction.action);
                    }}
                    className="relative h-full w-full text-left border border-border/60 rounded-xl p-5 bg-card/40 hover:bg-accent/10 hover:border-primary/40 transition-all group overflow-hidden backdrop-blur-sm shadow-sm hover:shadow-md"
                  >
                    {/* Gradient Background Effect on Hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-current"
                      style={{ color: categories[activeCategory].accent }}
                    />

                    {/* Accent bar */}
                    <div
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-r opacity-50 group-hover:opacity-100 transition-all group-hover:w-1.5"
                      style={{ backgroundColor: categories[activeCategory].accent }}
                    />

                    {/* Content */}
                    <div className="pl-3 group-hover:pl-4 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-foreground text-base leading-tight">
                          {suggestedAction.title}
                        </span>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="shrink-0 text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5"
                            style={{ color: categories[activeCategory].accent }}
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </motion.div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {suggestedAction.label}
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/80 pt-4 border-t border-border/40"
      >
        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 text-primary"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {categories.reduce((sum, cat) => sum + cat.actions.length, 0)}+ Actions Available
        </span>
      </motion.div>
    </div>
  );
}

function categorizeTools(tools: Tool[]): ToolCategory[] {
  const categories: Record<
    string,
    { tools: Tool[]; icon: string; accent: string }
  > = {
    deployment: { tools: [], icon: '🚀', accent: '#8B5CF6' },
    queries: { tools: [], icon: '🔍', accent: '#06B6D4' },
    admin: { tools: [], icon: '⚙️', accent: '#10B981' },
    operations: { tools: [], icon: '⚡', accent: '#F59E0B' },
  };

  tools.forEach((tool) => {
    const name = tool.name.toLowerCase();
    const description = tool.description?.toLowerCase() || '';

    // Skip utility tools
    if (name.includes('sign-and-submit') || name.includes('prepare-transaction')) {
      return;
    }

    // Pattern matching
    if (name.startsWith('deploy') || name.includes('create') || description.includes('deploy')) {
      categories.deployment.tools.push(tool);
    } else if (
      name.startsWith('get-') ||
      name.startsWith('query-') ||
      name.includes('list') ||
      description.includes('query') ||
      description.includes('view') ||
      description.includes('get ')
    ) {
      categories.queries.tools.push(tool);
    } else if (
      name.includes('admin') ||
      name.includes('owner') ||
      name.includes('pause') ||
      name.includes('unpause') ||
      name.includes('upgrade') ||
      name.includes('set-') ||
      name.includes('initiate') ||
      name.includes('accept') ||
      name.includes('cancel') ||
      description.includes('admin') ||
      description.includes('upgrade')
    ) {
      categories.admin.tools.push(tool);
    } else {
      categories.operations.tools.push(tool);
    }
  });

  return Object.entries(categories)
    .filter(([_, data]) => data.tools.length > 0)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      icon: data.icon,
      accent: data.accent,
      actions: data.tools.map((tool) => ({
        title: formatToolName(tool.name),
        label: generateLabel(tool.name),
        action: generatePrompt(tool),
      })),
    }));
}

function formatToolName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateLabel(name: string): string {
  const formatted = name.replace(/-/g, ' ');
  if (name.startsWith('deploy')) {
    return `create ${formatted.replace('deploy ', '')}`;
  }
  if (name.startsWith('get-')) {
    return `view ${formatted.replace('get ', '')}`;
  }
  return formatted;
}

function generatePrompt(tool: Tool): string {
  const name = formatToolName(tool.name);

  if (tool.name.startsWith('deploy')) {
    return `Deploy a new ${tool.name.replace('deploy-', '').replace(/-/g, ' ')}`;
  }

  if (tool.name.startsWith('get-')) {
    const what = tool.name.replace('get-', '').replace(/-/g, ' ');
    return `Show me ${what}`;
  }

  if (tool.name.includes('transfer')) {
    return 'Transfer tokens';
  }

  if (tool.name.includes('balance')) {
    return 'Check balance';
  }

  if (tool.name.includes('pause')) {
    return 'Pause the contract';
  }

  if (tool.name.includes('unpause')) {
    return 'Unpause the contract';
  }

  return name;
}
