
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { DrawingElement, AppState, Layer } from '../types';

interface View3DProps {
  elements: DrawingElement[];
  appState: AppState;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DrawingElement>) => void;
}

const View3D: React.FC<View3DProps> = ({ elements, appState, onSelectElement, onUpdateElement }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlRef = useRef<TransformControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const elementMeshes = useRef<Map<string, THREE.Object3D>>(new Map()); // Map ID -> Mesh
  const meshIds = useRef<Map<THREE.Object3D, string>>(new Map()); // Map Mesh -> ID
  const selectionBox = useRef<THREE.BoxHelper | null>(null);

  // --- Procedural Textures Helper ---
  const createProceduralTexture = (type: 'wood' | 'concrete' | 'fabric' | 'tile' | 'brick' | 'marble' | 'leather', resolution: '2k'|'4k') => {
    const size = resolution === '4k' ? 2048 : 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if(!ctx) return new THREE.CanvasTexture(canvas);

    if (type === 'wood') {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0,0,size,size);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let i=0; i<100; i++) {
            const y = Math.random() * size;
            ctx.fillRect(0, y, size, Math.random() * (size/100));
        }
    } else if (type === 'tile') {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0,0,size,size);
        ctx.fillStyle = '#ccc';
        const tileSize = size/16;
        for(let i=0; i<=size; i+=tileSize) {
            ctx.fillRect(i, 0, 4, size);
            ctx.fillRect(0, i, size, 4);
        }
    } else if (type === 'brick') {
         ctx.fillStyle = '#a04040';
         ctx.fillRect(0,0,size,size);
         ctx.fillStyle = '#803030';
         const bH = size/32;
         const bW = size/16;
         for(let y=0; y<size; y+=bH) {
             const offset = (y/bH)%2 === 0 ? 0 : bW/2;
             for(let x=offset; x<size; x+=bW) {
                 ctx.fillRect(x, y, bW-2, bH-2);
             }
         }
    } else if (type === 'marble') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,size,size);
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 2;
        for(let i=0; i<20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random()*size, Math.random()*size);
            ctx.bezierCurveTo(Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size);
            ctx.stroke();
        }
    } else if (type === 'leather') {
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(0,0,size,size);
        // Noise simulation
        const id = ctx.getImageData(0,0,size,size);
        for(let i=0; i<id.data.length; i+=4) {
            const noise = (Math.random()-0.5) * 20;
            id.data[i] = Math.min(255, Math.max(0, id.data[i]+noise));
            id.data[i+1] = Math.min(255, Math.max(0, id.data[i+1]+noise));
            id.data[i+2] = Math.min(255, Math.max(0, id.data[i+2]+noise));
        }
        ctx.putImageData(id, 0, 0);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  const textures = useRef<{ [key: string]: THREE.Texture }>({});

  // Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    // Load textures
    const res = appState.renderSettings.textureResolution;
    textures.current = {
        wood: createProceduralTexture('wood', res),
        tile: createProceduralTexture('tile', res),
        brick: createProceduralTexture('brick', res),
        marble: createProceduralTexture('marble', res),
        leather: createProceduralTexture('leather', res),
    };

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); 
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 10000);
    camera.position.set(500, 500, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    
    // Settings Handling
    renderer.shadowMap.enabled = appState.renderSettings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Transform Controls
    const transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('dragging-changed', (event) => {
        if (controlsRef.current) controlsRef.current.enabled = !event.value;
    });
    transformControl.addEventListener('mouseUp', () => {
         if (transformControl.object && meshIds.current.has(transformControl.object)) {
             const id = meshIds.current.get(transformControl.object)!;
             const obj = transformControl.object;
             onUpdateElement(id, {
                 position: { x: obj.position.x, y: obj.position.z },
                 rotation: -(obj.rotation.y * 180 / Math.PI),
                 properties: { elevation: obj.position.y }
             });
         }
    });
    scene.add(transformControl);
    transformControlRef.current = transformControl;

    // Post-Processing Composer
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    if (appState.renderSettings.ambientOcclusion) {
       const saoPass = new SSAOPass(scene, camera, containerRef.current.clientWidth, containerRef.current.clientHeight);
       saoPass.kernelRadius = 16;
       saoPass.minDistance = 0.005;
       saoPass.maxDistance = 0.1;
       composer.addPass(saoPass);
    }

    if (appState.renderSettings.bloom) {
       const bloomPass = new UnrealBloomPass(new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight), 1.5, 0.4, 0.85);
       bloomPass.threshold = 0.5;
       bloomPass.strength = 0.3;
       bloomPass.radius = 0.5;
       composer.addPass(bloomPass);
    }
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.3); 
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.5);
    sunLight.position.set(1000, 1500, 1000);
    sunLight.castShadow = appState.renderSettings.shadows;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Ground
    const gridHelper = new THREE.GridHelper(5000, 100, 0x444444, 0x222222);
    scene.add(gridHelper);

    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (composerRef.current) {
         composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composerRef.current?.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const handleClick = (event: MouseEvent) => {
        if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);
        
        let foundId = null;
        for (const hit of intersects) {
            if (hit.object.type === 'GridHelper') continue;
            let obj: THREE.Object3D | null = hit.object;
            while (obj) {
                if (meshIds.current.has(obj)) {
                    foundId = meshIds.current.get(obj);
                    break;
                }
                obj = obj.parent;
            }
            if (foundId) break;
        }
        onSelectElement(foundId || null);
    };
    rendererRef.current.domElement.addEventListener('click', handleClick);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!transformControlRef.current) return;
        switch(event.key.toLowerCase()) {
            case 't': transformControlRef.current.setMode('translate'); break;
            case 'r': transformControlRef.current.setMode('rotate'); break;
            case 's': transformControlRef.current.setMode('scale'); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (rendererRef.current) {
          rendererRef.current.domElement.removeEventListener('click', handleClick);
          rendererRef.current.dispose();
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [appState.renderSettings]); // Re-init on settings change

  // --- Object Sync Logic ---
  useEffect(() => {
    if (!sceneRef.current) return;

    const visibleLayerIds = new Set(appState.layers.filter(l => l.visible).map(l => l.id));
    const lockedLayerIds = new Set(appState.layers.filter(l => l.locked).map(l => l.id));
    const currentElementIds = new Set();

    elements.forEach(el => {
        if (!visibleLayerIds.has(el.layerId)) {
            if (elementMeshes.current.has(el.id)) {
                const obj = elementMeshes.current.get(el.id)!;
                if (transformControlRef.current?.object === obj) transformControlRef.current.detach();
                sceneRef.current?.remove(obj);
                elementMeshes.current.delete(el.id);
                meshIds.current.delete(obj);
            }
            return;
        }

        currentElementIds.add(el.id);
        let mesh = elementMeshes.current.get(el.id);

        if (!mesh) {
            mesh = create3DObject(el);
            if (mesh) {
                mesh.userData.id = el.id;
                sceneRef.current?.add(mesh);
                elementMeshes.current.set(el.id, mesh);
                meshIds.current.set(mesh, el.id);
            }
        } else {
            // Update Transforms if not currently selected in transform tool
            if (transformControlRef.current?.object !== mesh) {
                if (el.position) {
                    mesh.position.set(el.position.x, el.properties.elevation || 0, el.position.y);
                    mesh.rotation.y = -((el.rotation || 0) * Math.PI) / 180;
                }
            }
        }
    });

    elementMeshes.current.forEach((mesh, id) => {
        if (!currentElementIds.has(id)) {
            if (transformControlRef.current?.object === mesh) transformControlRef.current.detach();
            sceneRef.current?.remove(mesh);
            elementMeshes.current.delete(id);
            meshIds.current.delete(mesh);
        }
    });

    // Handle Selection Box
    const selectedEl = elements.find(e => e.selected);
    if (selectedEl && visibleLayerIds.has(selectedEl.layerId)) {
        const mesh = elementMeshes.current.get(selectedEl.id);
        if (mesh) {
            if (!selectionBox.current) {
                selectionBox.current = new THREE.BoxHelper(mesh, 0xffff00);
                sceneRef.current.add(selectionBox.current);
            } else {
                selectionBox.current.setFromObject(mesh);
                selectionBox.current.visible = true;
            }

            const isLocked = lockedLayerIds.has(selectedEl.layerId);
            if (!isLocked && transformControlRef.current && transformControlRef.current.object !== mesh) {
                transformControlRef.current.attach(mesh);
            }
        }
    } else {
        if (selectionBox.current) selectionBox.current.visible = false;
        transformControlRef.current?.detach();
    }
  }, [elements, appState.layers]);

  // --- 3D Object Factory with Detailed Models ---
  const create3DObject = (el: DrawingElement): THREE.Object3D | null => {
      const group = new THREE.Group();
      const type = el.type;
      const { pbr, shadows } = appState.renderSettings;

      // PBR Material Helper
      const makeMat = (props: any) => new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          ...props
      });

      const mats = {
          wood: makeMat({ color: 0x8b5a2b, roughness: 0.6, metalness: 0.1, map: textures.current.wood }),
          woodDark: makeMat({ color: 0x5c4033, roughness: 0.7, metalness: 0.1 }),
          concrete: makeMat({ color: 0xaaaaaa, roughness: 0.9, metalness: 0.1 }),
          white: makeMat({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }),
          glass: makeMat({ color: 0xffffff, transmission: 0.95, opacity: 0.3, transparent: true, roughness: 0, metalness: 0, thickness: 2 }),
          metal: makeMat({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 }),
          chrome: makeMat({ color: 0xffffff, roughness: 0.1, metalness: 1.0 }),
          fabric: makeMat({ color: 0x606080, roughness: 1.0, metalness: 0 }),
          leather: makeMat({ color: 0x3d2817, roughness: 0.4, metalness: 0, map: textures.current.leather }),
          water: makeMat({ color: 0x00aaff, transmission: 0.9, roughness: 0.1 }),
          ceramic: makeMat({ color: 0xffffff, roughness: 0.1, metalness: 0 }),
          marble: makeMat({ color: 0xffffff, roughness: 0.1, metalness: 0, map: textures.current.marble }),
          default: makeMat({ color: parseInt(el.properties.color?.replace('#', '0x') || '0xcccccc'), roughness: 0.5 })
      };

      const addMesh = (geo: THREE.BufferGeometry, mat: THREE.Material, pos = {x:0, y:0, z:0}, rot = {x:0, y:0, z:0}) => {
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(pos.x, pos.y, pos.z);
          mesh.rotation.set(rot.x, rot.y, rot.z);
          if (shadows) { mesh.castShadow = true; mesh.receiveShadow = true; }
          group.add(mesh);
          return mesh;
      };

      // --- Walls & Structure ---
      if (type.startsWith('wall')) {
          if (el.points.length < 2) return null;
          const len = Math.sqrt(Math.pow(el.points[1].x - el.points[0].x, 2) + Math.pow(el.points[1].y - el.points[0].y, 2));
          const height = el.properties.height || 120;
          const thickness = el.properties.width || 12;
          const mat = type.includes('glass') ? mats.glass : mats.concrete;
          
          const mesh = addMesh(
              new THREE.BoxGeometry(len, height, thickness), 
              mat, 
              {x: (el.points[0].x + el.points[1].x)/2, y: height/2, z: (el.points[0].y + el.points[1].y)/2}
          );
          mesh.rotation.y = -Math.atan2(el.points[1].y - el.points[0].y, el.points[1].x - el.points[0].x);
      }
      else if (type.startsWith('floor') || type.startsWith('room')) {
          if (el.points.length < 2) return null;
          const w = Math.abs(el.points[1].x - el.points[0].x);
          const h = Math.abs(el.points[1].y - el.points[0].y);
          addMesh(
            new THREE.PlaneGeometry(w, h), 
            type.includes('wood') ? mats.wood : mats.concrete, 
            {x: Math.min(el.points[0].x, el.points[1].x) + w/2, y: 0.5, z: Math.min(el.points[0].y, el.points[1].y) + h/2}, 
            {x: -Math.PI/2, y: 0, z: 0}
          );
      }
      else if (el.position) {
        group.position.set(el.position.x, el.properties.elevation || 0, el.position.y);
        group.rotation.y = -((el.rotation || 0) * Math.PI) / 180;

        // --- FURNITURE MODELS ---
        
        // --- LIVING ROOM ---
        if (type === 'furn_sofa_l') {
            const mat = mats.fabric;
            addMesh(new THREE.BoxGeometry(80, 15, 30), mat, {x:0, y:7.5, z:0}); // Base 1
            addMesh(new THREE.BoxGeometry(30, 15, 50), mat, {x:-25, y:7.5, z:40}); // Base L
            addMesh(new THREE.BoxGeometry(80, 25, 5), mat, {x:0, y:12.5, z:-12.5}); // Back
            addMesh(new THREE.BoxGeometry(5, 25, 50), mat, {x:-37.5, y:12.5, z:40}); // Side Back
            // Cushions
            addMesh(new THREE.BoxGeometry(25, 5, 25), mats.white, {x:-25, y:17.5, z:0});
            addMesh(new THREE.BoxGeometry(25, 5, 25), mats.white, {x:0, y:17.5, z:0});
            addMesh(new THREE.BoxGeometry(25, 5, 25), mats.white, {x:25, y:17.5, z:0});
        }
        else if (type === 'furn_sofa_321') {
            const mat = mats.leather;
            addMesh(new THREE.BoxGeometry(70, 12, 25), mat, {x:0,y:6,z:0}); // Seat
            addMesh(new THREE.BoxGeometry(70, 20, 5), mat, {x:0,y:10,z:-10}); // Back
            addMesh(new THREE.BoxGeometry(8, 15, 25), mat, {x:-31,y:7.5,z:0}); // Arm L
            addMesh(new THREE.BoxGeometry(8, 15, 25), mat, {x:31,y:7.5,z:0}); // Arm R
        }
        else if (type === 'furn_recliner') {
            const mat = mats.leather;
            addMesh(new THREE.BoxGeometry(30, 15, 30), mat, {x:0,y:7.5,z:0});
            addMesh(new THREE.BoxGeometry(30, 30, 5), mat, {x:0,y:15,z:-12.5});
            addMesh(new THREE.BoxGeometry(25, 5, 10), mats.metal, {x:0,y:5,z:20}); // Footrest
        }
        else if (type === 'furn_tv_cab') {
            addMesh(new THREE.BoxGeometry(60, 15, 15), mats.wood, {x:0,y:7.5,z:0});
            addMesh(new THREE.BoxGeometry(50, 25, 2), mats.white, {x:0,y:27.5,z:0}); // TV Screen
            addMesh(new THREE.BoxGeometry(52, 27, 1), mats.metal, {x:0,y:27.5,z:-1}); // TV Frame
        }
        else if (type === 'furn_coffee') {
            addMesh(new THREE.BoxGeometry(30, 2, 20), mats.glass, {x:0,y:10,z:0});
            addMesh(new THREE.CylinderGeometry(1, 1, 10), mats.metal, {x:-10,y:5,z:-7});
            addMesh(new THREE.CylinderGeometry(1, 1, 10), mats.metal, {x:10,y:5,z:-7});
            addMesh(new THREE.CylinderGeometry(1, 1, 10), mats.metal, {x:-10,y:5,z:7});
            addMesh(new THREE.CylinderGeometry(1, 1, 10), mats.metal, {x:10,y:5,z:7});
        }
        else if (type === 'furn_book' || type === 'furn_showcase') {
             addMesh(new THREE.BoxGeometry(30, 60, 10), mats.wood, {x:0,y:30,z:0});
             for(let i=10; i<60; i+=12) addMesh(new THREE.BoxGeometry(28, 1, 9), mats.woodDark, {x:0,y:i,z:0}); // Shelves
        }
        
        // --- BEDROOM ---
        else if (type.includes('bed')) {
            const w = type.includes('king') ? 76 : (type.includes('queen') ? 60 : 40);
            addMesh(new THREE.BoxGeometry(w, 8, 80), mats.wood, {x:0,y:4,z:0}); // Base
            addMesh(new THREE.BoxGeometry(w-2, 6, 78), mats.white, {x:0,y:11,z:0}); // Mattress
            addMesh(new THREE.BoxGeometry(w, 30, 4), mats.wood, {x:0,y:15,z:-38}); // Headboard
            // Pillows
            addMesh(new THREE.BoxGeometry(18, 4, 10), mats.fabric, {x:-w/4,y:14,z:-30});
            addMesh(new THREE.BoxGeometry(18, 4, 10), mats.fabric, {x:w/4,y:14,z:-30});
        }
        else if (type === 'furn_wardrobe') {
            addMesh(new THREE.BoxGeometry(40, 70, 20), mats.wood, {x:0,y:35,z:0});
            addMesh(new THREE.BoxGeometry(18, 68, 1), mats.woodDark, {x:-10,y:35,z:10}); // Door L
            addMesh(new THREE.BoxGeometry(18, 68, 1), mats.woodDark, {x:10,y:35,z:10}); // Door R
            addMesh(new THREE.SphereGeometry(1), mats.metal, {x:-2,y:35,z:11}); // Knob
        }

        // --- KITCHEN ---
        else if (type === 'furn_kitchen_mod') {
            addMesh(new THREE.BoxGeometry(20, 30, 20), mats.wood, {x:0,y:15,z:0}); // Cabinet
            addMesh(new THREE.BoxGeometry(22, 2, 22), mats.marble, {x:0,y:31,z:1}); // Countertop
        }
        else if (type === 'furn_chimney') {
             addMesh(new THREE.ConeGeometry(10, 15, 4), mats.metal, {x:0,y:60,z:0});
             addMesh(new THREE.BoxGeometry(20, 2, 15), mats.metal, {x:0,y:52,z:0});
        }
        else if (type === 'furn_gas') {
             addMesh(new THREE.BoxGeometry(20, 5, 12), mats.metal, {x:0,y:2.5,z:0});
             addMesh(new THREE.CylinderGeometry(3,3,1), mats.white, {x:-5,y:5,z:0}); // Burner
             addMesh(new THREE.CylinderGeometry(3,3,1), mats.white, {x:5,y:5,z:0});
        }
        else if (type === 'furn_fridge') {
             addMesh(new THREE.BoxGeometry(25, 60, 25), mats.metal, {x:0,y:30,z:0});
             addMesh(new THREE.BoxGeometry(1, 20, 1), mats.chrome, {x:12,y:40,z:13}); // Handle
        }

        // --- BATHROOM ---
        else if (type === 'furn_wc') {
             addMesh(new THREE.BoxGeometry(15, 20, 10), mats.ceramic, {x:0,y:10,z:-10}); // Tank
             addMesh(new THREE.CylinderGeometry(10, 8, 12), mats.ceramic, {x:0,y:6,z:5}); // Bowl
        }
        else if (type === 'furn_basin') {
             addMesh(new THREE.CylinderGeometry(2,2,30), mats.metal, {x:0,y:15,z:0}); // Stand
             addMesh(new THREE.SphereGeometry(10, 32, 16, 0, Math.PI*2, 0, Math.PI/2), mats.ceramic, {x:0,y:30,z:0}, {x:Math.PI, y:0, z:0}); // Bowl
             addMesh(new THREE.CylinderGeometry(1,1,5), mats.chrome, {x:0,y:35,z:-8}); // Tap
        }
        else if (type === 'furn_bath') {
             addMesh(new THREE.BoxGeometry(60, 15, 25), mats.ceramic, {x:0,y:7.5,z:0});
             const water = addMesh(new THREE.PlaneGeometry(55, 20), mats.water, {x:0,y:12,z:0});
             water.rotation.x = -Math.PI/2;
        }

        // --- OFFICE ---
        else if (type === 'furn_workstation') {
             addMesh(new THREE.BoxGeometry(50, 2, 25), mats.wood, {x:0,y:29,z:0});
             addMesh(new THREE.BoxGeometry(2, 28, 25), mats.metal, {x:-24,y:14,z:0});
             addMesh(new THREE.BoxGeometry(2, 28, 25), mats.metal, {x:24,y:14,z:0});
        }
        else if (type === 'furn_exec_chair') {
             addMesh(new THREE.CylinderGeometry(10, 10, 2), mats.metal, {x:0,y:2,z:0}); // Base
             addMesh(new THREE.CylinderGeometry(2, 2, 15), mats.metal, {x:0,y:10,z:0}); // Stem
             addMesh(new THREE.BoxGeometry(18, 2, 18), mats.leather, {x:0,y:18,z:0}); // Seat
             addMesh(new THREE.BoxGeometry(18, 25, 2), mats.leather, {x:0,y:30,z:-8}); // Back
        }

        // --- DEFAULT ---
        else {
             addMesh(new THREE.BoxGeometry(20, 20, 20), mats.default, {x:0,y:10,z:0});
        }
      }

      return group;
  };

  return <div ref={containerRef} className="w-full h-full bg-black shadow-inner" />;
};

export default View3D;
