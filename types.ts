
export type UnitType = 'ft' | 'm' | 'in';
export type ViewMode = '2d' | '3d';

export interface Point {
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type ToolCategory = 
  | 'project'
  | 'view'
  | 'draw' 
  | 'structure' 
  | 'flooring'
  | 'rooms' 
  | 'furniture' 
  | 'lighting'
  | 'electrical' 
  | 'plumbing' 
  | 'exterior'
  | 'decoration'
  | 'render'
  | 'export';

export type MaterialType = 
  | 'concrete' | 'brick' | 'aac_block' | 'stone' | 'gypsum' | 'glass'
  | 'wood_teak' | 'wood_oak' | 'plywood' 
  | 'tile_vitrified' | 'marble_italian' | 'granite' | 'ceramic'
  | 'fabric_velvet' | 'fabric_cotton' | 'leather'
  | 'metal_steel' | 'metal_alum' | 'metal_brass'
  | 'plastic_pvc' | 'plastic_upvc'
  | 'water' | 'grass' | 'asphalt' | 'soil';

export type ToolType = 
  // Project & View
  | 'settings_general' | 'settings_units'
  | 'select' | 'pan' | 'orbit' | 'zoom_in' | 'zoom_out' | 'grid' | 'snap' | 'layers'
  
  // 2D Draw
  | 'line' | 'polyline' | 'arc' | 'circle' | 'rect' | 'spline' 
  | 'dimension' | 'area' | 'angle' | 'offset' | 'trim' | 'extend' | 'mirror' | 'fillet' | 'chamfer'

  // Structure - Walls
  | 'wall_rcc' | 'wall_brick' | 'wall_aac' | 'wall_stone' | 'wall_gypsum' | 'wall_glass_part' | 'wall_load'
  // Structure - Doors
  | 'door_wood_3d' | 'door_flush' | 'door_panel' | 'door_sliding_glass' | 'door_bifold' | 'door_upvc' | 'door_single' | 'door_double'
  // Structure - Windows
  | 'win_sliding_alum' | 'win_upvc' | 'win_curtain' | 'win_bay' | 'win_skylight' | 'win_casement' | 'win_fixed'
  // Structure - Roof
  | 'roof_tile' | 'roof_metal' | 'roof_concrete' | 'roof_rafter' | 'roof_false_ceiling'
  // Structure - Columns & Beams
  | 'col_rcc_sq' | 'col_rcc_rnd' | 'col_steel_i' | 'col_wood' | 'col_pillar_deco' | 'beam_rcc' | 'beam_steel' | 'beam_wood'
  // Structure - Stairs
  | 'stair_conc' | 'stair_float' | 'stair_glass' | 'stair_spiral' | 'stair_wood' | 'stair_railing'

  // Flooring
  | 'floor_vitrified' | 'floor_marble_it' | 'floor_granite' | 'floor_wood' | 'floor_carpet' | 'floor_cement' | 'floor_out_tile' | 'floor_parking'

  // Rooms
  | 'room_living' | 'room_bedroom' | 'room_kitchen' | 'room_bathroom' | 'room_toilet' 
  | 'room_lobby' | 'room_hall' | 'room_balcony' | 'room_dining' | 'room_store' 
  | 'room_office' | 'room_reception' | 'room_veranda'

  // Furniture - Living
  | 'furn_sofa_l' | 'furn_sofa_321' | 'furn_recliner' | 'furn_tv_cab' | 'furn_coffee' | 'furn_book' | 'furn_showcase'
  // Furniture - Bedroom
  | 'furn_bed_king' | 'furn_bed_queen' | 'furn_wardrobe' | 'furn_dress' | 'furn_side' | 'furn_study' | 'furn_mattress'
  // Furniture - Kitchen
  | 'furn_kitchen_mod' | 'furn_chimney' | 'furn_gas' | 'furn_fridge' | 'furn_sink' | 'furn_micro'
  // Furniture - Bathroom
  | 'furn_wc' | 'furn_basin' | 'furn_shower_panel' | 'furn_bath' | 'furn_mirror' | 'furn_towel'
  // Furniture - Office
  | 'furn_workstation' | 'furn_exec_chair' | 'furn_file_cab' | 'furn_glass_tbl' | 'furn_conf_tbl'

  // Lighting
  | 'light_led_ceil' | 'light_spot' | 'light_wall' | 'light_chandelier' | 'light_tube' | 'light_strip'

  // Electrical
  | 'elec_switch' | 'elec_fan_ceil' | 'elec_ac_in' | 'elec_ac_out' | 'elec_inverter' | 'elec_panel' | 'elec_cctv' | 'elec_lock'

  // Plumbing
  | 'plum_pipe_pvc' | 'plum_pipe_gi' | 'plum_tap' | 'plum_shower' | 'plum_geyser' | 'plum_tank' | 'plum_septic'

  // Exterior
  | 'ext_bound_wall' | 'ext_gate' | 'ext_parking_shade' | 'ext_car' | 'ext_bike' | 'ext_tree' | 'ext_plant' | 'ext_light_out' | 'ext_bench' | 'ext_pool' | 'ext_pave' | 'ext_road' | 'ext_street_light'

  // Decoration
  | 'decor_curtain' | 'decor_blind' | 'decor_rug' | 'decor_vase' | 'decor_frame' | 'decor_pot'

  // Render
  | 'render_mat_pbr' | 'render_hdri' | 'render_shadow' | 'render_dof' | 'render_bloom'

  // Export
  | 'export_2d' | 'export_3d' | 'export_elevation' | 'export_section' | 'export_walkthrough' | 'export_image' | 'export_video' | 'export_pdf' | 'export_obj';

export interface RenderSettings {
  pbr: boolean;
  shadows: boolean;
  hdri: boolean;
  bloom: boolean;
  ambientOcclusion: boolean;
  textureResolution: '2k' | '4k';
  glassTransparency: boolean;
}

export interface AppState {
  viewMode: ViewMode;
  activeTool: ToolType;
  activeCategory: ToolCategory;
  unit: UnitType;
  gridEnabled: boolean;
  snapEnabled: boolean;
  zoom: number;
  pan: Point;
  layers: Layer[];
  activeLayerId: string;
  projectName: string;
  renderSettings: RenderSettings;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

export interface DrawingElement {
  id: string;
  type: ToolType;
  points: Point[]; // For lines, walls, polys
  position: Point; // For symbols/icons
  rotation: number;
  properties: {
    width?: number; // Wall thickness or object width
    height?: number;
    depth?: number;
    elevation?: number; // Height from floor
    color?: string;
    label?: string;
    subType?: string; 
    material?: MaterialType;
    texture?: string;
  };
  layerId: string;
  selected?: boolean;
}
