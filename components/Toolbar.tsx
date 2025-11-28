
import React, { useState } from 'react';
import { ToolCategory, ToolType } from '../types';
import { TOOL_CATEGORIES, TOOLS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  activeCategory: ToolCategory;
  onSelectTool: (tool: ToolType) => void;
  onSelectCategory: (cat: ToolCategory) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  activeCategory, 
  onSelectTool, 
  onSelectCategory 
}) => {
  const [hoveredTool, setHoveredTool] = useState<{id: ToolType, label: string, desc?: string, y: number} | null>(null);

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full select-none z-10 flex-shrink-0 relative">
      <div className="p-5 border-b border-gray-800 bg-gray-900/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
          HomeDream
        </h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-semibold">Architect Suite Pro</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {TOOL_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          const tools = TOOLS[category.id] || [];
          const Icon = category.icon;

          return (
            <div key={category.id} className="border-b border-gray-800/30">
              <button
                onClick={() => onSelectCategory(category.id)}
                className={`w-full flex items-center justify-between p-3.5 transition-all ${
                  isActive ? 'bg-gray-900 text-white border-l-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-gray-900/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                  <span className="font-medium text-sm">{category.label}</span>
                </div>
                <ChevronRight 
                  size={14} 
                  className={`transition-transform duration-200 text-gray-600 ${isActive ? 'rotate-90 text-blue-400' : ''}`} 
                />
              </button>

              {isActive && (
                <div className="bg-gray-900/30 py-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-1 px-2">
                    {tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      const isToolActive = activeTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => onSelectTool(tool.id)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredTool({ id: tool.id, label: tool.label, desc: tool.desc, y: rect.top });
                          }}
                          onMouseLeave={() => setHoveredTool(null)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                            isToolActive 
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-inner' 
                              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300 border-transparent'
                          }`}
                        >
                          <ToolIcon size={20} className="mb-1.5" />
                          <span className="text-[10px] text-center leading-tight">{tool.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-3 text-[10px] text-gray-600 text-center border-t border-gray-800">
         v2.2.0 • 3D Edit • Layers
      </div>

      {/* Hover Tooltip */}
      {hoveredTool && (
        <div 
          className="fixed left-64 z-50 ml-2 bg-gray-900 text-white p-3 rounded-md shadow-2xl border border-gray-700 w-56 tooltip-enter-active"
          style={{ top: Math.max(10, Math.min(hoveredTool.y, window.innerHeight - 100)) }}
        >
          <div className="font-bold text-sm mb-1 text-blue-400">{hoveredTool.label}</div>
          <div className="text-xs text-gray-300 leading-snug">
            {hoveredTool.desc || `Add a ${hoveredTool.label.toLowerCase()} element to your workspace.`}
          </div>
          <div className="mt-2 text-[10px] text-gray-500 italic">
            Click to select, then draw on canvas.
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
