
import React, { useState } from 'react';
import { DrawingElement, UnitType, Layer } from '../types';
import { Trash2, Copy, Layers, Palette, Settings2 } from 'lucide-react';
import LayersPanel from './LayersPanel';

interface PropertiesPanelProps {
  selectedElement: DrawingElement | null;
  unit: UnitType;
  layers: Layer[];
  activeLayerId: string;
  onUpdateElement: (id: string, updates: Partial<DrawingElement>) => void;
  onDeleteElement: (id: string) => void;
  onLayerActions: {
      add: () => void;
      remove: (id: string) => void;
      update: (id: string, u: Partial<Layer>) => void;
      setActive: (id: string) => void;
  };
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedElement, 
  unit,
  layers,
  activeLayerId,
  onUpdateElement,
  onDeleteElement,
  onLayerActions
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');

  const handleChange = (key: string, value: any) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, [key]: value }
    });
  };

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col h-full z-10 shadow-xl shadow-black/50">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'props' ? 'text-blue-400 bg-gray-800/50 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
          }`}
        >
          <Settings2 size={14} /> Properties
        </button>
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'layers' ? 'text-blue-400 bg-gray-800/50 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
          }`}
        >
          <Layers size={14} /> Layers
        </button>
      </div>

      {activeTab === 'layers' ? (
        <LayersPanel 
          layers={layers}
          activeLayerId={activeLayerId}
          onAddLayer={onLayerActions.add}
          onRemoveLayer={onLayerActions.remove}
          onUpdateLayer={onLayerActions.update}
          onSetActiveLayer={onLayerActions.setActive}
        />
      ) : (
        <>
          {!selectedElement ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8">
              <Palette size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select an object on the canvas or 3D view to edit properties.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <h2 className="font-semibold text-white text-sm">
                   {selectedElement.type.replace(/_/g, ' ').toUpperCase()}
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {selectedElement.id.slice(0, 8)}</p>
              </div>

              <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* General Appearance */}
                <div className="space-y-3">
                    <h3 className="text-xs uppercase font-bold text-gray-500 border-b border-gray-800 pb-1">Appearance</h3>
                    
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Label / Name</label>
                      <input 
                        type="text"
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                        value={selectedElement.properties.label || ''}
                        placeholder="Label"
                        onChange={(e) => handleChange('label', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Color</label>
                            <div className="flex items-center gap-2 bg-gray-950 border border-gray-700 rounded p-1">
                                <input 
                                    type="color" 
                                    value={selectedElement.properties.color || '#ffffff'}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer"
                                />
                                <span className="text-xs text-gray-500 font-mono">{selectedElement.properties.color}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Layer</label>
                        <select 
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300 outline-none"
                            value={selectedElement.layerId}
                            onChange={(e) => onUpdateElement(selectedElement.id, { layerId: e.target.value })}
                        >
                            {layers.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Material</label>
                        <select 
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300 outline-none"
                            value={selectedElement.properties.material || 'wood'}
                            onChange={(e) => handleChange('material', e.target.value)}
                        >
                            <option value="wood">Wood (Standard)</option>
                            <option value="wood_teak">Teak Wood</option>
                            <option value="wood_oak">Oak Wood</option>
                            <option value="tile_vitrified">Vitrified Tile</option>
                            <option value="marble_italian">Italian Marble</option>
                            <option value="concrete">Concrete</option>
                            <option value="brick">Red Brick</option>
                            <option value="glass">Glass</option>
                            <option value="metal_steel">Steel</option>
                            <option value="metal_gold">Gold / Brass</option>
                            <option value="fabric_velvet">Velvet Fabric</option>
                            <option value="leather">Leather</option>
                        </select>
                    </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold text-gray-500 border-b border-gray-800 pb-1">Dimensions ({unit})</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Width</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                        value={selectedElement.properties.width || 0}
                        onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Length/Depth</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                        value={selectedElement.properties.height || 0}
                        onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                      />
                    </div>
                     <div>
                      <label className="text-xs text-gray-400 mb-1 block">Elevation</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                        value={selectedElement.properties.elevation || 0}
                        onChange={(e) => handleChange('elevation', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                  <label className="text-xs uppercase font-bold text-gray-500 mb-2 block flex justify-between">
                      Rotation <span className="text-white font-normal">{selectedElement.rotation || 0}°</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => onUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-gray-800 grid grid-cols-2 gap-2 bg-gray-900">
                <button 
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded text-sm transition-colors border border-red-500/20"
                >
                    <Trash2 size={16} /> Delete
                </button>
                <button 
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded text-sm transition-colors border border-gray-700"
                >
                    <Copy size={16} /> Clone
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;
