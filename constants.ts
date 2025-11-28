
import { ToolType, ToolCategory, RenderSettings } from './types';
import { 
  MousePointer2, Move, PenTool, Square, Circle, Ruler, 
  BrickWall, DoorOpen, AppWindow, Columns, 
  Bed, Armchair, Table, Bath, Trees, Lightbulb, Zap, Droplet,
  Layers, Settings, Grid, Spline, Scissors,
  Home, Sofa, Tv, Utensils, Briefcase, Flower, 
  Thermometer, Wind, Warehouse, Frame, BoxSelect,
  Eye, FileOutput, Video, Image, Box,
  CornerUpRight, Copy, RotateCw, Hammer,
  Sun, Camera, Palette, FileText, Download,
  TreePine, Fence, Waves, LampCeiling, Lock, Plug, Armchair as Chair,
  Monitor, Archive, Car, Bike, Flag, Paintbrush, Disc
} from 'lucide-react';
// Simple Lucide Sparkles fallback
import { Sparkles } from 'lucide-react';

export const INITIAL_SCALE = 1;
export const GRID_SIZE = 50; // pixels per grid unit

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  pbr: true,
  shadows: true,
  hdri: true,
  bloom: false,
  ambientOcclusion: true,
  textureResolution: '2k',
  glassTransparency: true
};

export const TOOL_CATEGORIES: { id: ToolCategory; label: string; icon: any }[] = [
  { id: 'project', label: 'Project', icon: Settings },
  { id: 'view', label: 'View', icon: Eye },
  { id: 'draw', label: 'Draw 2D', icon: PenTool },
  { id: 'structure', label: 'Structure', icon: Home },
  { id: 'flooring', label: 'Flooring', icon: Square },
  { id: 'rooms', label: 'Rooms', icon: BoxSelect },
  { id: 'furniture', label: 'Furniture', icon: Sofa },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'plumbing', label: 'Plumbing', icon: Droplet },
  { id: 'exterior', label: 'Exterior', icon: Trees },
  { id: 'decoration', label: 'Decor', icon: Paintbrush },
  { id: 'render', label: 'Render', icon: Image },
  { id: 'export', label: 'Export', icon: FileOutput },
];

export const TOOL_DESCRIPTIONS: Record<string, string> = {
  // Project
  'select': 'Select and modify objects',
  'pan': 'Move the canvas view',
  'zoom_in': 'Zoom in for detail',
  'zoom_out': 'Zoom out for overview',
  'grid': 'Toggle grid snapping',
  'layers': 'Manage drawing layers',
  
  // Draw
  'line': 'Draw simple straight lines',
  'polyline': 'Draw continuous lines',
  'rect': 'Draw rectangles',
  'circle': 'Draw circles',
  'wall_rcc': 'Reinforced Concrete Wall',
  'wall_brick': 'Standard Brick Wall',
  
  // Default fallback
  'default': 'Click to place this component'
};

export const TOOLS: Record<ToolCategory, { id: ToolType; label: string; icon: any; desc?: string }[]> = {
  project: [
    { id: 'settings_general', label: 'Settings', icon: Settings, desc: 'Project configuration & details' },
    { id: 'settings_units', label: 'Units', icon: Ruler, desc: 'Change measurement units (ft/m)' },
  ],
  view: [
    { id: 'select', label: 'Select', icon: MousePointer2, desc: 'Select objects to edit properties' },
    { id: 'pan', label: 'Pan', icon: Move, desc: 'Click and drag to move view' },
    { id: 'zoom_in', label: 'Zoom In', icon: Eye, desc: 'Magnify view' },
    { id: 'zoom_out', label: 'Zoom Out', icon: Eye, desc: 'Reduce view' },
    { id: 'grid', label: 'Grid/Snap', icon: Grid, desc: 'Toggle grid visibility and snapping' },
    { id: 'layers', label: 'Layers', icon: Layers, desc: 'Manage visibility and locking' },
  ],
  draw: [
    { id: 'line', label: 'Line', icon: PenTool, desc: 'Draw a single line segment' },
    { id: 'polyline', label: 'Polyline', icon: PenTool, desc: 'Draw continuous connected lines' },
    { id: 'rect', label: 'Rectangle', icon: Square, desc: 'Draw a rectangular shape' },
    { id: 'circle', label: 'Circle', icon: Circle, desc: 'Draw a circle from center' },
    { id: 'arc', label: 'Arc', icon: Circle, desc: 'Draw a curved arc' },
    { id: 'spline', label: 'Spline', icon: Spline, desc: 'Draw a smooth curved line' },
    { id: 'dimension', label: 'Dimension', icon: Ruler, desc: 'Measure distance between points' },
    { id: 'area', label: 'Area', icon: BoxSelect, desc: 'Measure area of a closed shape' },
    { id: 'angle', label: 'Angle', icon: RotateCw, desc: 'Measure angle between lines' },
    { id: 'offset', label: 'Offset', icon: Copy, desc: 'Create parallel copy' },
    { id: 'trim', label: 'Trim', icon: Scissors, desc: 'Trim lines to intersection' },
    { id: 'extend', label: 'Extend', icon: Hammer, desc: 'Extend line to next boundary' },
    { id: 'mirror', label: 'Mirror', icon: Move, desc: 'Create a mirrored copy' },
    { id: 'fillet', label: 'Fillet', icon: CornerUpRight, desc: 'Round corners' },
  ],
  structure: [
    // Walls
    { id: 'wall_rcc', label: 'RCC Wall', icon: BrickWall, desc: 'Reinforced concrete structural wall' },
    { id: 'wall_brick', label: 'Brick Wall', icon: BrickWall, desc: 'Standard red brick masonry' },
    { id: 'wall_aac', label: 'AAC Block', icon: BrickWall, desc: 'Lightweight aerated concrete blocks' },
    { id: 'wall_stone', label: 'Stone Wall', icon: BrickWall, desc: 'Natural stone cladding wall' },
    { id: 'wall_gypsum', label: 'Gypsum Part.', icon: Frame, desc: 'Drywall partition' },
    { id: 'wall_glass_part', label: 'Glass Part.', icon: Frame, desc: 'Office glass partition' },
    // Doors
    { id: 'door_wood_3d', label: '3D Wood Door', icon: DoorOpen, desc: 'High detail wooden door' },
    { id: 'door_flush', label: 'Flush Door', icon: DoorOpen, desc: 'Simple flat wooden door' },
    { id: 'door_panel', label: 'Panel Door', icon: DoorOpen, desc: 'Decorative panel door' },
    { id: 'door_sliding_glass', label: 'Sliding Glass', icon: DoorOpen, desc: 'Patio sliding door' },
    { id: 'door_bifold', label: 'Bi-Fold', icon: DoorOpen, desc: 'Folding door system' },
    { id: 'door_upvc', label: 'UPVC Door', icon: DoorOpen, desc: 'Durable synthetic door' },
    // Windows
    { id: 'win_sliding_alum', label: 'Sliding Alum', icon: AppWindow, desc: 'Aluminum sliding window' },
    { id: 'win_upvc', label: 'UPVC Win', icon: AppWindow, desc: 'Insulated UPVC window' },
    { id: 'win_curtain', label: 'Curtain Wall', icon: AppWindow, desc: 'Full height glass facade' },
    { id: 'win_bay', label: 'Bay Window', icon: AppWindow, desc: 'Projecting window space' },
    { id: 'win_skylight', label: 'Skylight', icon: Sun, desc: 'Roof window' },
    // Roof
    { id: 'roof_tile', label: 'Tile Roof', icon: Home, desc: 'Clay or ceramic roof tiles' },
    { id: 'roof_metal', label: 'Metal Roof', icon: Home, desc: 'Corrugated metal sheet' },
    { id: 'roof_concrete', label: 'Conc. Slab', icon: Home, desc: 'Flat concrete roof' },
    { id: 'roof_rafter', label: 'Rafters', icon: Frame, desc: 'Wooden roof structure' },
    { id: 'roof_false_ceiling', label: 'False Ceiling', icon: Square, desc: 'Dropped ceiling' },
    // Columns
    { id: 'col_rcc_sq', label: 'RCC Sq Col', icon: Columns, desc: 'Square structural column' },
    { id: 'col_rcc_rnd', label: 'RCC Rnd Col', icon: Columns, desc: 'Circular structural column' },
    { id: 'col_steel_i', label: 'Steel I-Beam', icon: Columns, desc: 'Steel structural beam' },
    { id: 'col_pillar_deco', label: 'Deco Pillar', icon: Columns, desc: 'Ornamental pillar' },
    // Stairs
    { id: 'stair_conc', label: 'Conc. Stair', icon: Frame, desc: 'Concrete staircase' },
    { id: 'stair_float', label: 'Floating Stair', icon: Frame, desc: 'Modern floating steps' },
    { id: 'stair_glass', label: 'Glass Stair', icon: Frame, desc: 'Glass tread staircase' },
    { id: 'stair_spiral', label: 'Spiral Stair', icon: RotateCw, desc: 'Space-saving spiral stair' },
  ],
  flooring: [
    { id: 'floor_vitrified', label: 'Vitrified Tile', icon: Square, desc: 'Glossy durable tiles' },
    { id: 'floor_marble_it', label: 'Ital. Marble', icon: Square, desc: 'Premium Italian marble' },
    { id: 'floor_granite', label: 'Granite', icon: Square, desc: 'Hard stone flooring' },
    { id: 'floor_wood', label: 'Wood Floor', icon: Square, desc: 'Hardwood or laminate' },
    { id: 'floor_carpet', label: 'Carpet', icon: Square, desc: 'Soft fabric flooring' },
    { id: 'floor_cement', label: 'Cement', icon: Square, desc: 'Polished concrete' },
    { id: 'floor_out_tile', label: 'Outdoor Tile', icon: Square, desc: 'Anti-slip exterior tile' },
    { id: 'floor_parking', label: 'Parking Tile', icon: Square, desc: 'Heavy duty parking tile' },
  ],
  rooms: [
    { id: 'room_living', label: 'Living Room', icon: Sofa },
    { id: 'room_bedroom', label: 'Bedroom', icon: Bed },
    { id: 'room_kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'room_bathroom', label: 'Bathroom', icon: Bath },
    { id: 'room_dining', label: 'Dining', icon: Utensils },
    { id: 'room_hall', label: 'Hall', icon: Square },
    { id: 'room_office', label: 'Office', icon: Briefcase },
    { id: 'room_balcony', label: 'Balcony', icon: Sun },
    { id: 'room_store', label: 'Store Room', icon: Warehouse },
  ],
  furniture: [
    // Living
    { id: 'furn_sofa_l', label: 'L-Shape Sofa', icon: Sofa, desc: 'Corner sofa unit' },
    { id: 'furn_sofa_321', label: 'Sofa 3+2+1', icon: Sofa, desc: 'Full sofa set' },
    { id: 'furn_recliner', label: 'Recliner', icon: Armchair, desc: 'Comfortable reclining chair' },
    { id: 'furn_tv_cab', label: 'TV Cabinet', icon: Tv, desc: 'Media unit' },
    { id: 'furn_coffee', label: 'Coffee Table', icon: Table, desc: 'Center table' },
    { id: 'furn_book', label: 'Bookshelf', icon: Box, desc: 'Storage for books' },
    { id: 'furn_showcase', label: 'Showcase', icon: Box, desc: 'Glass display unit' },
    // Bed
    { id: 'furn_bed_king', label: 'King Bed', icon: Bed, desc: 'Large double bed' },
    { id: 'furn_bed_queen', label: 'Queen Bed', icon: Bed, desc: 'Standard double bed' },
    { id: 'furn_wardrobe', label: 'Wardrobe', icon: Box, desc: 'Clothes storage' },
    { id: 'furn_dress', label: 'Dressing Tbl', icon: Table, desc: 'Table with mirror' },
    { id: 'furn_side', label: 'Side Table', icon: Table, desc: 'Bedside table' },
    { id: 'furn_study', label: 'Study Desk', icon: Table, desc: 'Work desk' },
    { id: 'furn_mattress', label: 'Mattress', icon: Box, desc: 'Bed mattress' },
    // Kitchen
    { id: 'furn_kitchen_mod', label: 'Modular Cab', icon: Box, desc: 'Kitchen cabinetry' },
    { id: 'furn_chimney', label: 'Chimney', icon: Box, desc: 'Exhaust hood' },
    { id: 'furn_gas', label: 'Gas Stove', icon: Utensils, desc: 'Cooking range' },
    { id: 'furn_fridge', label: 'Refrigerator', icon: Box, desc: 'Fridge/Freezer' },
    { id: 'furn_sink', label: 'Kitchen Sink', icon: Droplet, desc: 'Washing sink' },
    { id: 'furn_micro', label: 'Microwave', icon: Box, desc: 'Microwave oven' },
    // Bath
    { id: 'furn_wc', label: 'Toilet Seat', icon: Bath, desc: 'WC Unit' },
    { id: 'furn_basin', label: 'Wash Basin', icon: Droplet, desc: 'Bathroom sink' },
    { id: 'furn_shower_panel', label: 'Shower Panel', icon: Droplet, desc: 'Wall mounted shower' },
    { id: 'furn_bath', label: 'Bathtub', icon: Bath, desc: 'Full size bath' },
    // Office
    { id: 'furn_workstation', label: 'Workstation', icon: Table, desc: 'Office cubicle' },
    { id: 'furn_exec_chair', label: 'Exec Chair', icon: Chair, desc: 'Ergonomic office chair' },
    { id: 'furn_file_cab', label: 'File Cab', icon: Archive, desc: 'Document storage' },
    { id: 'furn_conf_tbl', label: 'Conf Table', icon: Table, desc: 'Meeting table' },
  ],
  lighting: [
    { id: 'light_led_ceil', label: 'LED Ceiling', icon: Lightbulb, desc: 'Recessed ceiling light' },
    { id: 'light_spot', label: 'Spot Light', icon: Lightbulb, desc: 'Focused spotlight' },
    { id: 'light_wall', label: 'Wall Lamp', icon: LampCeiling, desc: 'Wall mounted sconce' },
    { id: 'light_chandelier', label: 'Chandelier', icon: LampCeiling, desc: 'Decorative hanging light' },
    { id: 'light_tube', label: 'Tube Light', icon: Box, desc: 'Linear fluorescent light' },
    { id: 'light_strip', label: 'LED Strip', icon: Spline, desc: 'Flexible LED tape' },
  ],
  electrical: [
    { id: 'elec_switch', label: 'Switch Board', icon: Zap, desc: 'Wall switches' },
    { id: 'elec_fan_ceil', label: 'Ceiling Fan', icon: Wind, desc: 'Rotating ceiling fan' },
    { id: 'elec_ac_in', label: 'AC Indoor', icon: Thermometer, desc: 'Split AC unit' },
    { id: 'elec_ac_out', label: 'AC Outdoor', icon: Box, desc: 'Compressor unit' },
    { id: 'elec_inverter', label: 'Inverter', icon: Box, desc: 'Power backup' },
    { id: 'elec_cctv', label: 'CCTV', icon: Eye, desc: 'Security camera' },
    { id: 'elec_lock', label: 'Smart Lock', icon: Lock, desc: 'Digital door lock' },
  ],
  plumbing: [
    { id: 'plum_pipe_pvc', label: 'PVC Pipe', icon: Spline, desc: 'Water pipe' },
    { id: 'plum_pipe_gi', label: 'GI Pipe', icon: Spline, desc: 'Galvanized iron pipe' },
    { id: 'plum_tap', label: 'Water Tap', icon: Droplet, desc: 'Faucet' },
    { id: 'plum_geyser', label: 'Geyser', icon: Zap, desc: 'Water heater' },
    { id: 'plum_tank', label: 'Water Tank', icon: Box, desc: 'Storage tank' },
    { id: 'plum_septic', label: 'Septic Tank', icon: Box, desc: 'Waste tank' },
  ],
  exterior: [
    { id: 'ext_bound_wall', label: 'Boundary', icon: Frame, desc: 'Perimeter wall' },
    { id: 'ext_gate', label: 'Gate', icon: Fence, desc: 'Entry gate' },
    { id: 'ext_parking_shade', label: 'Parking Shade', icon: Home, desc: 'Vehicle shelter' },
    { id: 'ext_car', label: 'Car', icon: Car, desc: 'Vehicle model' },
    { id: 'ext_bike', label: 'Bike', icon: Bike, desc: 'Motorcycle' },
    { id: 'ext_tree', label: 'Tree', icon: TreePine, desc: 'Garden tree' },
    { id: 'ext_plant', label: 'Plant', icon: Flower, desc: 'Small plant' },
    { id: 'ext_pool', label: 'Pool', icon: Waves, desc: 'Swimming pool' },
    { id: 'ext_light_out', label: 'Street Light', icon: Lightbulb, desc: 'Exterior pole light' },
    { id: 'ext_road', label: 'Road', icon: Box, desc: 'Paved road' },
  ],
  decoration: [
    { id: 'decor_curtain', label: 'Curtain', icon: Frame, desc: 'Window drapes' },
    { id: 'decor_blind', label: 'Blinds', icon: Frame, desc: 'Window blinds' },
    { id: 'decor_rug', label: 'Rug/Carpet', icon: Square, desc: 'Floor rug' },
    { id: 'decor_vase', label: 'Vase', icon: Flower, desc: 'Decorative vase' },
    { id: 'decor_frame', label: 'Photo Frame', icon: Image, desc: 'Wall art' },
    { id: 'decor_pot', label: 'Flower Pot', icon: Disc, desc: 'Planter' },
  ],
  render: [
    { id: 'render_mat_pbr', label: 'PBR Material', icon: Palette, desc: 'Realistic materials' },
    { id: 'render_hdri', label: 'HDRI Light', icon: Sun, desc: 'Environment lighting' },
    { id: 'render_shadow', label: 'Shadows', icon: Sun, desc: 'Cast shadows' },
    { id: 'render_bloom', label: 'Bloom', icon: Sparkles, desc: 'Glow effect' },
  ],
  export: [
    { id: 'export_2d', label: '2D Plan', icon: FileText, desc: 'Export as image' },
    { id: 'export_3d', label: '3D Model', icon: Box, desc: 'Export OBJ' },
    { id: 'export_image', label: 'Render Image', icon: Image, desc: 'High res render' },
    { id: 'export_video', label: 'Video', icon: Video, desc: 'Walkthrough video' },
    { id: 'export_pdf', label: 'PDF Export', icon: FileText, desc: 'Export blueprint' },
  ]
};

export const COLORS = {
  wall: '#9ca3af', // gray-400
  wallSelected: '#60a5fa', // blue-400
  door: '#fbbf24', // amber-400
  window: '#38bdf8', // sky-400
  furniture: '#a78bfa', // violet-400
  electrical: '#facc15', // yellow-400
  plumbing: '#34d399', // emerald-400
  exterior: '#4ade80', // green-400
  grid: '#1f2937', // gray-800
  background: '#030712', // gray-950
  text: '#ffffff',
};
