import {AnchorType, BottomType} from '../types';

export interface AnchorTypeInfo {
  type: AnchorType;
  name: string;
  category: 'fluke' | 'plow' | 'claw' | 'modern' | 'traditional' | 'other';
  description: string;
}

export const ANCHOR_TYPE_INFO: Record<AnchorType, AnchorTypeInfo> = {
  [AnchorType.DANFORTH]: {
    type: AnchorType.DANFORTH,
    name: 'Danforth / Fluke',
    category: 'fluke',
    description: 'Lightweight, excellent in sand and mud. High holding power when set properly.',
  },
  [AnchorType.BRUCE]: {
    type: AnchorType.BRUCE,
    name: 'Bruce / Claw',
    category: 'claw',
    description: 'Good all-around anchor. Works well in most bottom types including rock.',
  },
  [AnchorType.PLOW]: {
    type: AnchorType.PLOW,
    name: 'CQR / Plow',
    category: 'plow',
    description: 'Traditional plow anchor. Good in mud and sand. Pivoting shank design.',
  },
  [AnchorType.DELTA]: {
    type: AnchorType.DELTA,
    name: 'Delta',
    category: 'plow',
    description: 'Fixed shank plow anchor. Good holding power in various bottoms.',
  },
  [AnchorType.ROCNA]: {
    type: AnchorType.ROCNA,
    name: 'Rocna',
    category: 'modern',
    description: 'Modern high-holding power anchor. Excellent in most conditions.',
  },
  [AnchorType.MANTUS]: {
    type: AnchorType.MANTUS,
    name: 'Mantus',
    category: 'modern',
    description: 'Modern roll-bar anchor. High holding power, good in most bottoms.',
  },
  [AnchorType.FORTRESS]: {
    type: AnchorType.FORTRESS,
    name: 'Fortress',
    category: 'fluke',
    description: 'Lightweight aluminum fluke anchor. Excellent in sand and mud.',
  },
  [AnchorType.AC14]: {
    type: AnchorType.AC14,
    name: 'AC14',
    category: 'modern',
    description: 'Modern high-holding power anchor. Wide fluke design for strong hold.',
  },
  [AnchorType.SPADE]: {
    type: AnchorType.SPADE,
    name: 'Spade',
    category: 'modern',
    description: 'Modern anchor with wide fluke. Excellent holding in most conditions.',
  },
  [AnchorType.COBRA]: {
    type: AnchorType.COBRA,
    name: 'Cobra',
    category: 'modern',
    description: 'Modern anchor design. Good all-around performance.',
  },
  [AnchorType.STOCKLESS]: {
    type: AnchorType.STOCKLESS,
    name: 'Stockless',
    category: 'traditional',
    description: 'Traditional stockless anchor. Common on larger vessels.',
  },
  [AnchorType.NAVY_STOCKLESS]: {
    type: AnchorType.NAVY_STOCKLESS,
    name: 'Navy Stockless',
    category: 'traditional',
    description: 'Heavy-duty stockless anchor. Used on commercial vessels.',
  },
  [AnchorType.KEDGE]: {
    type: AnchorType.KEDGE,
    name: 'Kedge / Admiralty',
    category: 'traditional',
    description: 'Traditional stock anchor. Good holding but requires more scope.',
  },
  [AnchorType.GRAPNEL]: {
    type: AnchorType.GRAPNEL,
    name: 'Grapnel',
    category: 'other',
    description: 'Multi-pronged anchor. Used for temporary anchoring or rocky bottoms.',
  },
  [AnchorType.OTHER]: {
    type: AnchorType.OTHER,
    name: 'Other',
    category: 'other',
    description: 'Other anchor type not listed.',
  },
};

/**
 * Get recommended anchor types for a given bottom type
 */
export function getRecommendedAnchorsForBottom(
  bottomType: BottomType,
): AnchorType[] {
  switch (bottomType) {
    case BottomType.SAND:
      return [
        AnchorType.DANFORTH,
        AnchorType.FORTRESS,
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.AC14,
        AnchorType.SPADE,
      ];
    case BottomType.MUD:
      return [
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.DANFORTH,
        AnchorType.ROCNA,
        AnchorType.MANTUS,
      ];
    case BottomType.CLAY:
      return [
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.BRUCE,
      ];
    case BottomType.GRASS_WEEDS:
      return [
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.BRUCE,
        AnchorType.GRAPNEL,
        AnchorType.ROCNA,
      ];
    case BottomType.ROCK:
      return [
        AnchorType.BRUCE,
        AnchorType.GRAPNEL,
        AnchorType.ROCNA,
        AnchorType.MANTUS,
      ];
    case BottomType.CORAL:
      return [
        AnchorType.BRUCE,
        AnchorType.GRAPNEL,
        // Note: Coral is generally poor for anchoring
      ];
    case BottomType.UNKNOWN:
    default:
      // For unknown, recommend versatile anchors
      return [
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.BRUCE,
        AnchorType.DELTA,
      ];
  }
}

/**
 * Get anchor type info
 */
export function getAnchorTypeInfo(type: AnchorType): AnchorTypeInfo {
  return ANCHOR_TYPE_INFO[type];
}

/**
 * Check if anchor type is recommended for bottom type
 */
export function isAnchorRecommendedForBottom(
  anchorType: AnchorType,
  bottomType: BottomType,
): boolean {
  const recommended = getRecommendedAnchorsForBottom(bottomType);
  return recommended.includes(anchorType);
}

