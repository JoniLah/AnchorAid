import {BottomType} from '../types';

export interface BottomTypeInfo {
  type: BottomType;
  name: string;
  suitability: string;
  holdingQuality: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

export const BOTTOM_TYPE_INFO: Record<BottomType, BottomTypeInfo> = {
  [BottomType.SAND]: {
    type: BottomType.SAND,
    name: 'Sand',
    suitability: 'Excellent',
    holdingQuality: 'excellent',
    notes: 'Generally excellent holding. Fluke anchors (Danforth, Fortress) and modern anchors (Rocna, Mantus) work excellently. Set anchor firmly.',
  },
  [BottomType.MUD]: {
    type: BottomType.MUD,
    name: 'Mud',
    suitability: 'Good',
    holdingQuality: 'good',
    notes: 'Good holding when anchor sets properly. May require more scope. Plow anchors (CQR, Delta) and modern anchors work well.',
  },
  [BottomType.CLAY]: {
    type: BottomType.CLAY,
    name: 'Clay',
    suitability: 'Good',
    holdingQuality: 'good',
    notes: 'Good holding once set. May be harder to set initially. Increase scope if needed.',
  },
  [BottomType.GRASS_WEEDS]: {
    type: BottomType.GRASS_WEEDS,
    name: 'Grass/Weeds',
    suitability: 'Fair',
    holdingQuality: 'fair',
    notes: 'Holding can be variable. Anchor may not penetrate well. Plow anchors (CQR, Delta), claw anchors (Bruce), or grapnel work better. Increase scope.',
  },
  [BottomType.ROCK]: {
    type: BottomType.ROCK,
    name: 'Rock',
    suitability: 'Poor',
    holdingQuality: 'poor',
    notes: 'May not set well. Risk of anchor fouling. Use caution and consider alternative anchoring methods.',
  },
  [BottomType.CORAL]: {
    type: BottomType.CORAL,
    name: 'Coral',
    suitability: 'Poor',
    holdingQuality: 'poor',
    notes: 'Poor holding and risk of anchor damage. Use with extreme caution. Consider mooring if available.',
  },
  [BottomType.UNKNOWN]: {
    type: BottomType.UNKNOWN,
    name: 'Unknown',
    suitability: 'Unknown',
    holdingQuality: 'fair',
    notes: 'Bottom type unknown. Use conservative scope and monitor anchor carefully.',
  },
};

export function getBottomTypeInfo(type: BottomType): BottomTypeInfo {
  return BOTTOM_TYPE_INFO[type];
}

