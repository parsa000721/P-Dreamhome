
import React, { useState } from 'react';
import { Layer } from '../types';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Edit2, GripVertical, Check } from 'lucide-react';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onSetActiveLayer: (id: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onSetActiveLayer
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (layer: Layer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateLayer(editingId, { name: editName });
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
        <h3 className="font-semibold text-sm text-gray-200">Layers</h3>
        <button 
          onClick={onAddLayer}
          className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors"
          title="Add New Layer"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {layers.map((layer) => (
          <div 
            key={layer.id}
            className={`group flex items-center gap-2 p-2 rounded border transition-all ${
              activeLayerId === layer.id 
                ? 'bg-blue-900/20 border-blue-500/50' 
                : 'bg-gray-800/30 border-transparent hover:bg-gray-800'
            }`}
            onClick={() => onSetActiveLayer(layer.id)}
          >
            {/* Grip (Visual only for now) */}
            <GripVertical size={12} className="text-gray-600 cursor-grab" />

            {/* Visibility Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
              className={`p-1 rounded ${layer.visible ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
            >
              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            {/* Lock Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
              className={`p-1 rounded ${layer.locked ? 'text-red-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            {/* Color Indicator */}
            <div 
                className="w-3 h-3 rounded-full border border-white/10" 
                style={{ backgroundColor: layer.color }}
            />

            {/* Name / Edit Input */}
            <div className="flex-1 min-w-0">
              {editingId === layer.id ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="w-full bg-gray-950 border border-gray-600 rounded px-1 py-0.5 text-xs text-white focus:border-blue-500 outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="text-green-400">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group-hover:pr-1">
                    <span className={`text-xs truncate ${activeLayerId === layer.id ? 'font-medium text-blue-100' : 'text-gray-400'}`}>
                    {layer.name}
                    </span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(layer); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
                    >
                        <Edit2 size={10} />
                    </button>
                </div>
              )}
            </div>

            {/* Delete (prevent deleting default) */}
            {layer.id !== 'default' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
