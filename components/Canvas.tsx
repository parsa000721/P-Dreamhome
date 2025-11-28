
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, Point, DrawingElement, AppState } from '../types';
import { COLORS, GRID_SIZE } from '../constants';

interface CanvasProps {
  appState: AppState;
  elements: DrawingElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onSelectElement: (id: string | null) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  appState, 
  elements, 
  setElements, 
  setAppState,
  onSelectElement
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - appState.pan.x) / appState.zoom,
      y: (screenY - appState.pan.y) / appState.zoom
    };
  }, [appState.pan, appState.zoom]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const drawDoor = (ctx: CanvasRenderingContext2D, el: DrawingElement, color: string) => {
     if (!el.position) return;
     const size = el.properties.width || 40;
     const type = el.type;

     ctx.save();
     ctx.translate(el.position.x, el.position.y);
     ctx.rotate((el.rotation * Math.PI) / 180);
     ctx.strokeStyle = color;
     ctx.lineWidth = 2;

     // Frame
     ctx.strokeRect(-2, -5, 4, 10);
     ctx.strokeRect(size - 2, -5, 4, 10);

     if (type.includes('double') || type.includes('bifold')) {
        const half = size / 2;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, half); ctx.arc(0,0, half, Math.PI/2, 0, true); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(size,0); ctx.lineTo(size, half); ctx.arc(size,0, half, Math.PI/2, Math.PI, false); ctx.stroke();
     } else if (type.includes('sliding') || type.includes('glass')) {
        ctx.fillStyle = type.includes('glass') ? '#a5f3fc' : color;
        ctx.beginPath();
        ctx.rect(0, -2, size/2, 4);
        ctx.rect(size/2, 2, size/2, 4);
        ctx.fill(); ctx.stroke();
     } else {
        // Single
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        ctx.moveTo(0, size); 
        ctx.arc(0, 0, size, 0.5 * Math.PI, 0, true);
        ctx.stroke();
     }
     ctx.restore();
  };

  const drawWindow = (ctx: CanvasRenderingContext2D, el: DrawingElement, color: string) => {
      if (!el.position) return;
      const w = el.properties.width || 50;
      const thickness = 8;
      
      ctx.save();
      ctx.translate(el.position.x, el.position.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      
      // Wall cut filler
      ctx.fillStyle = '#1f2937'; 
      ctx.fillRect(-w/2, -thickness/2, w, thickness);
      
      // Frame
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-w/2, -thickness/2, w, thickness);

      // Glass
      ctx.strokeStyle = '#87ceeb';
      if (el.type.includes('bay')) {
         ctx.beginPath();
         ctx.moveTo(-w/2, 0); ctx.lineTo(-w/2 - 10, -20); ctx.lineTo(w/2 + 10, -20); ctx.lineTo(w/2, 0);
         ctx.stroke();
      } else {
         ctx.beginPath(); ctx.moveTo(-w/2, 0); ctx.lineTo(w/2, 0); ctx.stroke();
      }

      if (el.type.includes('casement') || el.type.includes('sliding')) {
          ctx.beginPath(); ctx.moveTo(0, -thickness/2); ctx.lineTo(0, thickness/2); ctx.stroke();
      }

      ctx.restore();
  };

  const drawFurniture = (ctx: CanvasRenderingContext2D, el: DrawingElement, color: string) => {
    if(!el.position) return;
    const type = el.type;
    let w = el.properties.width || 40;
    let h = el.properties.height || 40;
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.save();
    ctx.translate(el.position.x, el.position.y);
    ctx.rotate((el.rotation * Math.PI) / 180);

    if (type.includes('bed')) {
        w = type.includes('king') ? 76 : (type.includes('queen') ? 60 : 40);
        h = 80;
        ctx.fillStyle = '#d8b4fe'; 
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.fillStyle = '#fff'; 
        ctx.fillRect(-w/2 + 5, -h/2 + 5, w/2 - 10, 15);
        ctx.fillRect(5, -h/2 + 5, w/2 - 10, 15);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-w/2, 0, w, h/2);
    } 
    else if (type.includes('sofa')) {
        ctx.fillStyle = '#a78bfa';
        if (type.includes('sofa_l')) {
            w = 80; h = 80;
            ctx.fillRect(-w/2, -h/2, w, 25); // Back main
            ctx.fillRect(-w/2, -h/2, 25, h); // Side L
            ctx.fillStyle = '#c4b5fd'; // Cushions
            ctx.fillRect(-w/2+5, -h/2+25, 20, h-30);
            ctx.fillRect(-w/2+25, -h/2+5, w-30, 20);
        } else {
            w = 80; h = 30;
            ctx.fillRect(-w/2, -h/2, w, 8); // Back
            ctx.fillRect(-w/2, -h/2, 10, h); // Left arm
            ctx.fillRect(w/2 - 10, -h/2, 10, h); // Right arm
            ctx.fillStyle = '#c4b5fd';
            ctx.fillRect(-w/2 + 10, -h/2 + 8, w - 20, h - 8); // Seat
        }
    }
    else if (type.includes('table') || type.includes('coffee') || type.includes('desk') || type.includes('dining')) {
        ctx.fillStyle = '#d1d5db';
        if (type.includes('glass')) ctx.fillStyle = 'rgba(173, 216, 230, 0.5)';
        if (type.includes('round') || type.includes('coffee')) {
             ctx.beginPath(); ctx.arc(0, 0, w/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
             ctx.fillRect(-w/2, -h/2, w, h);
             ctx.strokeRect(-w/2, -h/2, w, h);
        }
    }
    else if (type.includes('toilet') || type.includes('wc')) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-15, -20, 30, 10); // Tank
        ctx.beginPath(); ctx.ellipse(0, 10, 12, 18, 0, 0, Math.PI * 2); // Bowl
        ctx.fill(); ctx.stroke();
    }
    else if (type.includes('sink') || type.includes('basin')) {
        ctx.fillStyle = '#fff';
        if (type.includes('kitchen')) { ctx.fillRect(-25, -15, 50, 30); ctx.strokeRect(-20, -10, 40, 20); }
        else { ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI*2); ctx.fillStyle='#94a3b8'; ctx.fill();
    }
    else if (type.includes('stove') || type.includes('gas')) {
        ctx.fillStyle = '#d1d5db'; ctx.fillRect(-25, -15, 50, 30);
        ctx.beginPath(); ctx.arc(-12, 0, 8, 0, Math.PI*2); ctx.fillStyle='#1f2937'; ctx.fill();
        ctx.beginPath(); ctx.arc(12, 0, 8, 0, Math.PI*2); ctx.fill();
    }
    else if (type.includes('tree') || type.includes('plant')) {
        ctx.fillStyle = COLORS.exterior;
        ctx.beginPath();
        for(let i=0; i<8; i++) {
            const angle = (i/8)*Math.PI*2;
            ctx.quadraticCurveTo(Math.cos(angle)*(w/2+10), Math.sin(angle)*(h/2+10), Math.cos(angle+0.5)*w/2, Math.sin(angle+0.5)*h/2);
        }
        ctx.fill();
        ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(0,0, w/6, 0, Math.PI*2); ctx.fill();
    }
    else if (type.includes('car')) {
         ctx.fillStyle = '#6b7280'; ctx.fillRect(-35, -60, 70, 120);
         ctx.fillStyle = '#9ca3af'; ctx.fillRect(-30, -30, 60, 50); // roof
    }
    else if (type.includes('light') || type.includes('fan')) {
         ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
         ctx.beginPath(); ctx.moveTo(-10,-10); ctx.lineTo(10,10); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(10,-10); ctx.lineTo(-10,10); ctx.stroke();
         ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2); ctx.stroke();
         if(type.includes('fan')) { ctx.beginPath(); ctx.arc(0,0, 25, 0, Math.PI*2); ctx.setLineDash([2,4]); ctx.stroke(); ctx.setLineDash([]); }
    }
    else {
        // Fallback Box
        ctx.fillStyle = isSelected(el) ? COLORS.wallSelected : (el.properties.color || '#6366f1');
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.fillStyle = '#fff';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(type.slice(0, 4), 0, 3);
    }

    ctx.restore();
  };

  const isSelected = (el: DrawingElement) => el.selected || false;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(appState.pan.x, appState.pan.y);
    ctx.scale(appState.zoom, appState.zoom);

    // Grid
    if (appState.gridEnabled) {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1 / appState.zoom;
      const startX = Math.floor(-appState.pan.x / appState.zoom / GRID_SIZE) * GRID_SIZE;
      const startY = Math.floor(-appState.pan.y / appState.zoom / GRID_SIZE) * GRID_SIZE;
      const endX = startX + (canvas.width / appState.zoom) + GRID_SIZE;
      const endY = startY + (canvas.height / appState.zoom) + GRID_SIZE;
      ctx.beginPath();
      for (let x = startX; x < endX; x += GRID_SIZE) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
      for (let y = startY; y < endY; y += GRID_SIZE) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
      ctx.stroke();
    }

    const sortedElements = [...elements].sort((a, b) => {
        const priority: any = { 'floor': 0, 'ext': 1, 'room': 2, 'wall': 3, 'win': 4, 'door': 5, 'stair': 6, 'furn': 7, 'decor': 8, 'light': 9, 'elec': 9, 'plum': 9 };
        const typeA = a.type.split('_')[0];
        const typeB = b.type.split('_')[0];
        return (priority[typeA] || 10) - (priority[typeB] || 10);
    });

    sortedElements.forEach(el => {
      ctx.save();
      const selected = isSelected(el);
      const color = selected ? COLORS.wallSelected : (el.properties.color || '#fff');
      ctx.strokeStyle = color;
      ctx.fillStyle = el.properties.color || '#ccc';
      ctx.lineWidth = selected ? 3 : 2;

      if (el.type.startsWith('wall') || el.type === 'line' || el.type === 'polyline' || el.type.includes('wire') || el.type.includes('pipe')) {
         if (el.points.length >= 2) {
            ctx.beginPath();
            if (el.type.includes('wire') || el.type.includes('strip')) {
                 ctx.setLineDash([5, 5]);
                 ctx.strokeStyle = COLORS.electrical;
            } else if (el.type.includes('pipe')) {
                 ctx.strokeStyle = COLORS.plumbing;
                 ctx.lineWidth = 4;
            } else if (el.type.startsWith('wall')) {
                 ctx.lineWidth = el.properties.width || 12;
                 ctx.strokeStyle = selected ? COLORS.wallSelected : (el.type.includes('glass') ? '#a5f3fc' : COLORS.wall);
                 if (el.type.includes('brick')) ctx.strokeStyle = '#b91c1c';
            }
            
            ctx.moveTo(el.points[0].x, el.points[0].y);
            el.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();

            // Wall inner
            if (el.type.startsWith('wall') && !selected && !el.type.includes('glass')) {
                ctx.lineWidth = (el.properties.width || 12) - 4;
                ctx.strokeStyle = el.type.includes('brick') ? '#ef4444' : '#4b5563'; 
                ctx.stroke();
            }
         }
      }
      else if (el.type === 'rect' || el.type.startsWith('room_') || el.type.startsWith('floor_') || el.type.startsWith('roof_') || el.type.startsWith('ext_')) {
          if (el.points.length >= 2) {
              const x = el.points[0].x;
              const y = el.points[0].y;
              const w = el.points[1].x - x;
              const h = el.points[1].y - y;
              
              ctx.fillStyle = selected ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)';
              if (el.type.startsWith('floor_')) ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
              if (el.type.startsWith('ext_garden') || el.type.startsWith('ext_tree')) ctx.fillStyle = 'rgba(22, 101, 52, 0.1)';
              if (el.type.includes('pool')) ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
              
              ctx.fillRect(x, y, w, h);
              ctx.strokeStyle = selected ? COLORS.wallSelected : '#fff';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, w, h);

              if (el.type.startsWith('room_') || el.type.startsWith('roof_')) {
                  ctx.fillStyle = '#fff';
                  ctx.font = '14px Inter';
                  ctx.textAlign = 'center';
                  const label = el.properties.label || el.type.split('_')[1];
                  ctx.fillText(label.toUpperCase(), x + w/2, y + h/2);
              }
          }
      }
      else if (el.type.startsWith('door_')) {
          drawDoor(ctx, el, selected ? COLORS.wallSelected : COLORS.door);
      }
      else if (el.type.startsWith('win_')) {
          drawWindow(ctx, el, selected ? COLORS.wallSelected : COLORS.window);
      }
      else {
          drawFurniture(ctx, el, color);
      }
      ctx.restore();
    });

    if (isDragging && startPoint && currentPoint) {
       ctx.save();
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
       ctx.setLineDash([5, 5]);
       
       const w = currentPoint.x - startPoint.x;
       const h = currentPoint.y - startPoint.y;

       if (appState.activeTool.startsWith('wall') || appState.activeTool === 'line' || appState.activeTool.includes('pipe') || appState.activeTool.includes('wire')) {
         ctx.beginPath();
         ctx.moveTo(startPoint.x, startPoint.y);
         ctx.lineTo(currentPoint.x, currentPoint.y);
         ctx.stroke();
       } else if (appState.activeTool === 'circle') {
          const r = Math.sqrt(w*w + h*h);
          ctx.beginPath(); ctx.arc(startPoint.x, startPoint.y, r, 0, Math.PI*2); ctx.stroke();
       } else if (appState.activeTool === 'rect' || appState.activeTool.startsWith('room') || appState.activeTool.startsWith('floor') || appState.activeTool.startsWith('ext')) {
          ctx.strokeRect(startPoint.x, startPoint.y, w, h);
       }
       ctx.restore();
    }

    ctx.restore();
  }, [appState, elements, isDragging, startPoint, currentPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const observer = new ResizeObserver(() => {
         canvas.width = canvas.parentElement?.clientWidth || 800;
         canvas.height = canvas.parentElement?.clientHeight || 600;
         draw();
      });
      observer.observe(canvas.parentElement!);
      return () => observer.disconnect();
    }
  }, [draw]);

  useEffect(() => {
    requestAnimationFrame(draw);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (e.button === 1 || appState.activeTool === 'pan') {
       setStartPoint({ x, y }); 
       setIsDragging(true);
       return;
    }

    const worldPos = screenToWorld(x, y);

    if (appState.activeTool === 'select') {
       const hit = elements.find(el => {
          const px = el.points?.[0]?.x || el.position?.x;
          const py = el.points?.[0]?.y || el.position?.y;
          if (px === undefined) return false;
          if (el.points && el.points.length > 1) {
             const cx = (el.points[0].x + el.points[1].x)/2;
             const cy = (el.points[0].y + el.points[1].y)/2;
             const dist = Math.sqrt(Math.pow(worldPos.x - cx, 2) + Math.pow(worldPos.y - cy, 2));
             return dist < 40; 
          }
          const dist = Math.sqrt(Math.pow(worldPos.x - px, 2) + Math.pow(worldPos.y - py, 2));
          return dist < 30; 
       });
       
       if (hit) {
         setElements(prev => prev.map(el => ({...el, selected: el.id === hit.id})));
         onSelectElement(hit.id);
       } else {
         setElements(prev => prev.map(el => ({...el, selected: false})));
         onSelectElement(null);
       }
       return;
    }

    setStartPoint(worldPos);
    setCurrentPoint(worldPos);
    setIsDragging(true);
    
    const isShape = ['wall', 'line', 'rect', 'circle', 'room', 'floor', 'roof', 'wire', 'pipe', 'ext_bound', 'polyline', 'pool', 'road'].some(k => appState.activeTool.includes(k));
    const isNavigation = ['select', 'pan', 'zoom_in', 'zoom_out'].includes(appState.activeTool);

    if (!isShape && !isNavigation) {
        const newEl: DrawingElement = {
            id: generateId(),
            type: appState.activeTool,
            points: [],
            position: worldPos,
            rotation: 0,
            properties: { 
                width: 40, 
                height: 40,
                color: '#6366f1',
                label: appState.activeTool
            },
            layerId: 'default'
        };
        setElements(prev => [...prev, newEl]);
        setIsDragging(false); 
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = screenToWorld(x, y);

    if (isDragging && startPoint) {
      if (appState.activeTool === 'pan' || (e.buttons === 4)) {
         setAppState(prev => ({
             ...prev,
             pan: { x: prev.pan.x + e.movementX, y: prev.pan.y + e.movementY }
         }));
      } else {
        if (appState.snapEnabled) {
            worldPos.x = Math.round(worldPos.x / (GRID_SIZE/2)) * (GRID_SIZE/2);
            worldPos.y = Math.round(worldPos.y / (GRID_SIZE/2)) * (GRID_SIZE/2);
        }
        setCurrentPoint(worldPos);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && startPoint && currentPoint) {
      if (appState.activeTool === 'pan') {
          setIsDragging(false); setStartPoint(null); return;
      }
      
      const isDrawingShape = ['wall', 'line', 'rect', 'circle', 'room', 'floor', 'roof', 'wire', 'pipe', 'ext_bound', 'pool', 'road'].some(k => appState.activeTool.includes(k));
      
      if (isDrawingShape) {
          const dist = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2));
          if (dist > 5) {
            const newEl: DrawingElement = {
                id: generateId(),
                type: appState.activeTool,
                points: [startPoint, currentPoint], 
                position: startPoint, 
                rotation: 0,
                properties: { 
                    width: appState.activeTool.startsWith('wall') ? 12 : undefined,
                    label: appState.activeTool.startsWith('room') ? appState.activeTool.replace('room_', '') : undefined
                },
                layerId: 'default'
            };
            setElements(prev => [...prev, newEl]);
          }
      }
    }
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.1, appState.zoom + scaleAmount), 5);
    setAppState(prev => ({ ...prev, zoom: newZoom }));
  };

  return (
    <canvas
      ref={canvasRef}
      className="block cursor-crosshair active:cursor-grabbing w-full h-full bg-gray-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

export default Canvas;
