
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import View3D from './components/View3D';
import PropertiesPanel from './components/PropertiesPanel';
import Login from './components/Login';
import SettingsModal from './components/SettingsModal';
import AIAssistant from './components/AIAssistant';
import { useHistory } from './hooks/useHistory';
import { AppState, ToolType, DrawingElement, Layer } from './types';
import { DEFAULT_RENDER_SETTINGS } from './constants';
import { Download, Upload, Grid, MousePointer2, Undo2, Redo2, Box, Eye, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'units' | 'render'>('general');

  const [appState, setAppState] = useState<AppState>({
    viewMode: '2d',
    activeTool: 'select',
    activeCategory: 'project',
    unit: 'ft',
    gridEnabled: true,
    snapEnabled: true,
    zoom: 1,
    pan: { x: 0, y: 0 },
    layers: [{ id: 'default', name: 'Default Layer', visible: true, locked: false, color: '#ffffff' }],
    activeLayerId: 'default',
    projectName: 'Untitled Plan',
    renderSettings: DEFAULT_RENDER_SETTINGS
  });

  // History Hook replaces simple state for elements
  const { 
    elements, 
    pushState, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory([]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Wrapper for updating elements to ensure history tracking
  const setElements = (newElements: DrawingElement[] | ((prev: DrawingElement[]) => DrawingElement[])) => {
    let nextElements;
    if (typeof newElements === 'function') {
      nextElements = newElements(elements);
    } else {
      nextElements = newElements;
    }
    pushState(nextElements);
  };

  const handleUpdateElement = (id: string, updates: Partial<DrawingElement>) => {
    // Check if layer is locked
    const el = elements.find(e => e.id === id);
    if (el) {
        const layer = appState.layers.find(l => l.id === el.layerId);
        if (layer && layer.locked && id !== 'SYSTEM') { 
            return;
        }
    }

    const nextElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    pushState(nextElements);
  };

  const handleDeleteElement = (id: string) => {
    const nextElements = elements.filter(el => el.id !== id);
    pushState(nextElements);
    setSelectedElementId(null);
  };

  const handleUndo = () => {
    const prev = undo();
    if (prev) {
      if (selectedElementId && !prev.find(e => e.id === selectedElementId)) {
        setSelectedElementId(null);
      }
    }
  };

  const handleRedo = () => {
    redo();
  };

  // --- Tool Selection Handler ---
  const handleSelectTool = (t: ToolType) => {
    if (t === 'settings_general') {
      setSettingsTab('general');
      setShowSettings(true);
    } else if (t === 'settings_units') {
      setSettingsTab('units');
      setShowSettings(true);
    } else {
      setAppState(prev => ({ ...prev, activeTool: t }));
    }
  };

  // --- Layer Actions ---
  const layerActions = {
      add: () => {
          const newId = `layer_${Date.now()}`;
          const newLayer: Layer = {
              id: newId,
              name: `Layer ${appState.layers.length + 1}`,
              visible: true,
              locked: false,
              color: '#' + Math.floor(Math.random()*16777215).toString(16)
          };
          setAppState(prev => ({ 
              ...prev, 
              layers: [...prev.layers, newLayer],
              activeLayerId: newId 
          }));
      },
      remove: (id: string) => {
          if (id === 'default') return;
          setElements(prev => prev.map(el => el.layerId === id ? { ...el, layerId: 'default' } : el));
          
          setAppState(prev => {
              const newLayers = prev.layers.filter(l => l.id !== id);
              return {
                  ...prev,
                  layers: newLayers,
                  activeLayerId: prev.activeLayerId === id ? 'default' : prev.activeLayerId
              };
          });
      },
      update: (id: string, updates: Partial<Layer>) => {
          setAppState(prev => ({
              ...prev,
              layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
          }));
      },
      setActive: (id: string) => {
          setAppState(prev => ({ ...prev, activeLayerId: id }));
      }
  };

  const handleExport = () => {
     if (appState.viewMode === '3d') {
         alert("To export 3D image: Right click on the view -> Save Image As.");
     } else {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${appState.projectName.replace(/\s+/g, '_').toLowerCase()}.png`;
            link.href = url;
            link.click();
        }
     }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden">
      
      {/* Sidebar Toolbar */}
      <Toolbar 
        activeTool={appState.activeTool}
        activeCategory={appState.activeCategory}
        onSelectTool={handleSelectTool}
        onSelectCategory={(c) => setAppState(prev => ({ ...prev, activeCategory: c }))}
      />

      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Bar / Menu */}
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-10 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                Project: <span className="text-white font-bold">{appState.projectName}</span>
                <button onClick={() => { setSettingsTab('general'); setShowSettings(true); }} className="text-gray-500 hover:text-white">
                  <Settings size={14} />
                </button>
             </div>
             <div className="h-6 w-px bg-gray-700 mx-2"></div>
             
             {/* History Controls */}
             <div className="flex gap-1">
               <button 
                 onClick={handleUndo} 
                 disabled={!canUndo}
                 className="p-2 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300 transition-colors"
                 title="Undo (Ctrl+Z)"
               >
                 <Undo2 size={18} />
               </button>
               <button 
                 onClick={handleRedo} 
                 disabled={!canRedo}
                 className="p-2 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300 transition-colors"
                 title="Redo (Ctrl+Y)"
               >
                 <Redo2 size={18} />
               </button>
             </div>

             <div className="h-6 w-px bg-gray-700 mx-2"></div>

             {/* View Controls */}
             <button 
                onClick={() => setAppState(prev => ({...prev, gridEnabled: !prev.gridEnabled}))}
                className={`p-2 rounded hover:bg-gray-800 transition-colors ${appState.gridEnabled ? 'text-blue-400 bg-blue-900/10' : 'text-gray-500'}`}
                title="Toggle Grid"
             >
                <Grid size={18} />
             </button>
             
             <div className="flex bg-gray-800 rounded p-1 gap-1">
                <button 
                  onClick={() => setAppState(prev => ({...prev, viewMode: '2d'}))}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                    appState.viewMode === '2d' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={12} /> 2D
                </button>
                <button 
                  onClick={() => setAppState(prev => ({...prev, viewMode: '3d'}))}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                    appState.viewMode === '3d' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Box size={12} /> 3D
                </button>
             </div>

           </div>

           <div className="flex items-center gap-2">
              {/* Active Layer Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-xs border border-gray-700 mr-2">
                  <span className="text-gray-400">Layer:</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: appState.layers.find(l => l.id === appState.activeLayerId)?.color }} />
                  <span>{appState.layers.find(l => l.id === appState.activeLayerId)?.name}</span>
              </div>

              <select 
               className="bg-gray-800 border border-gray-700 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500 mr-2"
               value={appState.unit}
               onChange={(e) => setAppState(prev => ({...prev, unit: e.target.value as any}))}
              >
               <option value="ft">Feet (ft)</option>
               <option value="m">Meters (m)</option>
               <option value="in">Inches (in)</option>
              </select>

              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-xs px-3 py-2 rounded text-gray-200 transition">
                  <Upload size={14} /> Import
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-xs px-3 py-2 rounded text-white font-medium transition shadow-lg shadow-blue-900/20"
              >
                  <Download size={14} /> Export
              </button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 relative overflow-hidden bg-gray-950">
           {/* HUD */}
           <div className="absolute top-4 left-4 z-20 bg-gray-900/80 backdrop-blur px-3 py-1.5 rounded-full text-xs text-gray-400 border border-gray-700 pointer-events-none flex items-center gap-3 shadow-lg">
              <span className="flex items-center gap-1">
                <MousePointer2 size={12} /> {appState.activeTool.startsWith('settings') ? 'select' : appState.activeTool}
              </span>
              <div className="w-px h-3 bg-gray-600"></div>
              <span className="flex items-center gap-1">
                 <Eye size={12} /> {Math.round(appState.zoom * 100)}%
              </span>
              {appState.viewMode === '3d' && (
                  <>
                  <div className="w-px h-3 bg-gray-600"></div>
                  <span className="text-blue-400">Controls: T=Move, R=Rotate, S=Scale</span>
                  </>
              )}
           </div>

           {appState.viewMode === '2d' ? (
             <Canvas 
               appState={appState}
               setAppState={setAppState}
               elements={elements}
               setElements={setElements}
               onSelectElement={setSelectedElementId}
             />
           ) : (
             <View3D 
               elements={elements} 
               appState={appState}
               onSelectElement={setSelectedElementId}
               onUpdateElement={handleUpdateElement}
             />
           )}
        </div>
      </div>

      {/* Right Sidebar Properties */}
      <PropertiesPanel 
        selectedElement={selectedElement}
        unit={appState.unit}
        layers={appState.layers}
        activeLayerId={appState.activeLayerId}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onLayerActions={layerActions}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        appState={appState}
        setAppState={setAppState}
        initialTab={settingsTab}
      />
      
      <AIAssistant />

    </div>
  );
};

export default App;
