
import React, { useState } from 'react';
import { X, Settings, Ruler, Grid, Save, Image, Sun, Sparkles } from 'lucide-react';
import { AppState, UnitType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  initialTab?: 'general' | 'units' | 'render';
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  appState, 
  setAppState,
  initialTab = 'general'
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'units' | 'render'>(initialTab);
  const [localProjectName, setLocalProjectName] = useState(appState.projectName);

  if (!isOpen) return null;

  const handleSave = () => {
    setAppState(prev => ({
      ...prev,
      projectName: localProjectName
    }));
    onClose();
  };

  const updateRenderSetting = (key: keyof typeof appState.renderSettings, value: any) => {
    setAppState(prev => ({
      ...prev,
      renderSettings: { ...prev.renderSettings, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[600px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} className="text-blue-400" />
            Project Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'general' 
                ? 'border-blue-500 text-blue-400 bg-gray-800/30' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/10'
            }`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'units' 
                ? 'border-blue-500 text-blue-400 bg-gray-800/30' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/10'
            }`}
          >
            Units & Grid
          </button>
          <button 
            onClick={() => setActiveTab('render')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'render' 
                ? 'border-purple-500 text-purple-400 bg-gray-800/30' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2"><Image size={14}/> Rendering</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950/50">
          
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={localProjectName}
                  onChange={(e) => setLocalProjectName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                <p>Welcome to HomeDream Architect. Configure your workspace details here.</p>
              </div>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Measurement Units</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ft', 'm', 'in'] as UnitType[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setAppState(prev => ({...prev, unit: u}))}
                      className={`py-2 px-3 rounded border text-sm flex items-center justify-center gap-2 ${
                        appState.unit === u 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <Ruler size={14} />
                      {u === 'ft' ? 'Feet' : u === 'm' ? 'Meters' : 'Inches'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Grid & Snapping</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Grid size={18} className="text-gray-400" />
                      <span className="text-sm">Show Grid</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appState.gridEnabled} 
                        onChange={(e) => setAppState(prev => ({...prev, gridEnabled: e.target.checked}))}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-gray-400" />
                      <span className="text-sm">Snap to Grid</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appState.snapEnabled} 
                        onChange={(e) => setAppState(prev => ({...prev, snapEnabled: e.target.checked}))}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'render' && (
            <div className="space-y-6">
               <div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg text-sm text-purple-200 mb-4 flex items-center gap-2">
                 <Sparkles size={16} />
                 <span>High-fidelity rendering effects. May impact performance.</span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {/* PBR */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">PBR Materials</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.pbr} 
                            onChange={(e) => updateRenderSetting('pbr', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Enable physics-based rendering for realistic metal, wood, and glass.</p>
                  </div>

                  {/* Shadows */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Real Shadows</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.shadows} 
                            onChange={(e) => updateRenderSetting('shadows', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">High-quality dynamic soft shadows.</p>
                  </div>

                  {/* HDRI */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">HDRI Lighting</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.hdri} 
                            onChange={(e) => updateRenderSetting('hdri', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Environment map lighting for realistic reflections.</p>
                  </div>

                  {/* Bloom */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Bloom</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.bloom} 
                            onChange={(e) => updateRenderSetting('bloom', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Glowing effect for lights and bright surfaces.</p>
                  </div>

                  {/* AO */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Ambient Occlusion</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.ambientOcclusion} 
                            onChange={(e) => updateRenderSetting('ambientOcclusion', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Contact shadows in corners and crevices.</p>
                  </div>

                   {/* Glass Transparency */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">Glass Transparency</span>
                          <input 
                            type="checkbox" 
                            checked={appState.renderSettings.glassTransparency} 
                            onChange={(e) => updateRenderSetting('glassTransparency', e.target.checked)}
                            className="accent-purple-500 w-4 h-4"
                          />
                      </div>
                      <p className="text-xs text-gray-500">High quality refraction for windows and glass tables.</p>
                  </div>
               </div>

               <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Texture Resolution</label>
                  <select 
                     value={appState.renderSettings.textureResolution}
                     onChange={(e) => updateRenderSetting('textureResolution', e.target.value)}
                     className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                  >
                     <option value="2k">2K (Balanced)</option>
                     <option value="4k">4K (High Quality)</option>
                  </select>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-800/50 flex justify-end gap-2 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
