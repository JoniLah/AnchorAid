import {AnchorType, BottomType} from '../types';

export interface AnchorTypeInfo {
  type: AnchorType;
  name: string;
  category: 'fluke' | 'plow' | 'claw' | 'modern' | 'traditional' | 'other';
  description: string;
  detailedInfo?: {
    pros: string[];
    cons: string[];
    priceRange: 'budget' | 'moderate' | 'premium' | 'very-premium';
    bestFor: string[];
    weight: string; // Relative weight description
    setting: string; // How well it sets
    holding: string; // Holding power description
  };
}

export const ANCHOR_TYPE_INFO: Record<AnchorType, AnchorTypeInfo> = {
  [AnchorType.DANFORTH]: {
    type: AnchorType.DANFORTH,
    name: 'Danforth / Fluke',
    category: 'fluke',
    description: 'Lightweight fluke anchor with excellent holding power in sand and mud. One of the most popular anchors for recreational boats.',
    detailedInfo: {
      pros: [
        'Excellent holding power in sand and mud (up to 200x anchor weight)',
        'Very lightweight and easy to handle',
        'Flattens for easy storage',
        'Affordable and widely available',
        'Sets quickly in soft bottoms'
      ],
      cons: [
        'Can struggle in grass, weeds, and rocky bottoms',
        'May not reset if wind shifts significantly',
        'Flukes can bend if overloaded',
        'Requires proper setting technique'
      ],
      priceRange: 'budget',
      bestFor: ['Sand bottoms', 'Mud bottoms', 'Calm to moderate conditions', 'Small to medium boats'],
      weight: 'Lightweight',
      setting: 'Fast setting in soft bottoms',
      holding: 'Excellent in sand/mud (200:1 ratio), poor in grass/rock'
    },
  },
  [AnchorType.BRUCE]: {
    type: AnchorType.BRUCE,
    name: 'Bruce / Claw',
    category: 'claw',
    description: 'Versatile claw anchor that works well in most bottom types. Good for rocky areas where other anchors struggle.',
    detailedInfo: {
      pros: [
        'Works in almost all bottom types including rock',
        'Self-righting design',
        'Good holding in grass and weeds',
        'No moving parts, very durable',
        'Sets reliably in most conditions'
      ],
      cons: [
        'Heavier than fluke anchors',
        'Holding power lower than modern scoop anchors',
        'Can be expensive',
        'May drag in very soft mud'
      ],
      priceRange: 'moderate',
      bestFor: ['Rocky bottoms', 'Mixed bottoms', 'Grass/weeds', 'All-around use'],
      weight: 'Moderate to heavy',
      setting: 'Reliable setting in most conditions',
      holding: 'Good all-around (30-50:1 ratio), excellent in rock'
    },
  },
  [AnchorType.PLOW]: {
    type: AnchorType.PLOW,
    name: 'CQR / Plow',
    category: 'plow',
    description: 'Classic pivoting plow anchor. Excellent in mud and good in sand. The pivoting shank helps it reset when wind shifts.',
    detailedInfo: {
      pros: [
        'Excellent in mud and soft bottoms',
        'Pivoting shank helps reset on wind shifts',
        'Proven design used for decades',
        'Good holding power when properly set',
        'Works well with chain rode'
      ],
      cons: [
        'Heavy and bulky',
        'Can be difficult to set in hard bottoms',
        'May struggle in grass and weeds',
        'Expensive compared to fluke anchors',
        'Requires more scope than modern anchors'
      ],
      priceRange: 'moderate',
      bestFor: ['Mud bottoms', 'Soft sand', 'Long-term anchoring', 'Larger boats'],
      weight: 'Heavy',
      setting: 'Good in soft bottoms, slower in hard',
      holding: 'Excellent in mud (40-60:1), good in sand'
    },
  },
  [AnchorType.DELTA]: {
    type: AnchorType.DELTA,
    name: 'Delta',
    category: 'plow',
    description: 'Fixed-shank plow anchor with improved performance over CQR. Better setting and holding in various conditions.',
    detailedInfo: {
      pros: [
        'Improved design over CQR plow',
        'Faster setting than traditional plow',
        'Good holding in mud, sand, and clay',
        'Fixed shank more reliable than pivoting',
        'Widely used and proven'
      ],
      cons: [
        'Still heavy compared to modern anchors',
        'Not as good as modern scoop anchors',
        'Can struggle in grass',
        'More expensive than fluke anchors'
      ],
      priceRange: 'moderate',
      bestFor: ['Mud and soft bottoms', 'Mixed conditions', 'Medium to large boats'],
      weight: 'Heavy',
      setting: 'Faster than CQR, good overall',
      holding: 'Good to excellent (50-80:1) in soft bottoms'
    },
  },
  [AnchorType.ROCNA]: {
    type: AnchorType.ROCNA,
    name: 'Rocna',
    category: 'modern',
    description: 'Modern roll-bar anchor with exceptional holding power. One of the best-performing anchors available. Excellent in most conditions.',
    detailedInfo: {
      pros: [
        'Exceptional holding power (often 100:1+ ratio)',
        'Sets quickly and reliably',
        'Works in almost all bottom types',
        'Roll-bar ensures proper orientation',
        'Excellent reset capability on wind shifts',
        'Widely tested and proven'
      ],
      cons: [
        'Expensive (premium price)',
        'Heavier than fluke anchors',
        'Roll-bar can snag on deck hardware',
        'May be overkill for small boats'
      ],
      priceRange: 'premium',
      bestFor: ['All bottom types', 'Storm conditions', 'Long-term anchoring', 'Serious cruisers'],
      weight: 'Moderate to heavy',
      setting: 'Very fast and reliable',
      holding: 'Exceptional (100:1+ ratio) in most conditions'
    },
  },
  [AnchorType.MANTUS]: {
    type: AnchorType.MANTUS,
    name: 'Mantus',
    category: 'modern',
    description: 'Modern roll-bar anchor with excellent performance. Disassembles for storage. Strong competitor to Rocna.',
    detailedInfo: {
      pros: [
        'Excellent holding power similar to Rocna',
        'Can be disassembled for storage',
        'Fast setting in most conditions',
        'Good reset capability',
        'Works well in various bottoms'
      ],
      cons: [
        'Premium pricing',
        'Assembly required (though simple)',
        'Roll-bar can be a storage concern',
        'Newer design, less long-term data'
      ],
      priceRange: 'premium',
      bestFor: ['All-around use', 'Storage-constrained boats', 'Modern cruising'],
      weight: 'Moderate',
      setting: 'Very fast and reliable',
      holding: 'Excellent (90-100:1 ratio)'
    },
  },
  [AnchorType.FORTRESS]: {
    type: AnchorType.FORTRESS,
    name: 'Fortress',
    category: 'fluke',
    description: 'Lightweight aluminum fluke anchor. Excellent in sand and mud. Can be disassembled. Popular for cruising boats.',
    detailedInfo: {
      pros: [
        'Extremely lightweight (aluminum construction)',
        'Excellent holding in sand and mud',
        'Can be disassembled for storage',
        'Won\'t rust',
        'Adjustable fluke angle for different conditions',
        'Very affordable'
      ],
      cons: [
        'Aluminum can be damaged by rocks',
        'Not suitable for rocky bottoms',
        'May struggle in grass and weeds',
        'Flukes can bend if overloaded',
        'Less durable than steel anchors'
      ],
      priceRange: 'budget',
      bestFor: ['Sand bottoms', 'Mud bottoms', 'Lightweight boats', 'Storage space limited'],
      weight: 'Very lightweight',
      setting: 'Fast in soft bottoms',
      holding: 'Excellent in sand/mud (similar to Danforth)'
    },
  },
  [AnchorType.AC14]: {
    type: AnchorType.AC14,
    name: 'AC14',
    category: 'modern',
    description: 'Modern high-holding power anchor with wide fluke design. Good performance in various conditions.',
    detailedInfo: {
      pros: [
        'Good holding power',
        'Wide fluke design',
        'Sets reasonably well',
        'Moderate pricing'
      ],
      cons: [
        'Not as proven as Rocna/Mantus',
        'May struggle in some conditions',
        'Less widely available'
      ],
      priceRange: 'moderate',
      bestFor: ['General anchoring', 'Mixed bottoms'],
      weight: 'Moderate',
      setting: 'Good',
      holding: 'Good to very good (70-90:1)'
    },
  },
  [AnchorType.SPADE]: {
    type: AnchorType.SPADE,
    name: 'Spade',
    category: 'modern',
    description: 'French-designed modern anchor with excellent performance. No roll-bar, relies on shape for orientation.',
    detailedInfo: {
      pros: [
        'Excellent holding power',
        'No roll-bar (cleaner design)',
        'Fast setting',
        'Good in various bottoms',
        'Well-regarded by cruisers'
      ],
      cons: [
        'Premium pricing',
        'Requires proper storage to avoid damage',
        'Less common than Rocna/Mantus',
        'May not self-right in all conditions'
      ],
      priceRange: 'premium',
      bestFor: ['All-around use', 'Serious cruising', 'Various bottom types'],
      weight: 'Moderate',
      setting: 'Very fast',
      holding: 'Excellent (90-100:1 ratio)'
    },
  },
  [AnchorType.COBRA]: {
    type: AnchorType.COBRA,
    name: 'Cobra',
    category: 'modern',
    description: 'Modern anchor design with good all-around performance. Less common but well-regarded.',
    detailedInfo: {
      pros: [
        'Good holding power',
        'Modern design',
        'Sets well',
        'Works in various conditions'
      ],
      cons: [
        'Less widely available',
        'Moderate to premium pricing',
        'Less proven than major brands'
      ],
      priceRange: 'moderate',
      bestFor: ['General use', 'Mixed conditions'],
      weight: 'Moderate',
      setting: 'Good',
      holding: 'Good (70-85:1 ratio)'
    },
  },
  [AnchorType.HERRESHOFF]: {
    type: AnchorType.HERRESHOFF,
    name: 'Herreshoff',
    category: 'traditional',
    description: 'Traditional kedge-style anchor designed by yacht designer Nathanael Herreshoff. Good holding but requires skill to use.',
    detailedInfo: {
      pros: [
        'Classic design',
        'Good holding when properly set',
        'Traditional appearance',
        'Works in various bottoms'
      ],
      cons: [
        'Requires more scope',
        'Less efficient than modern anchors',
        'Can be difficult to set',
        'Heavy',
        'Less common today'
      ],
      priceRange: 'moderate',
      bestFor: ['Traditional boats', 'Experienced sailors', 'Kedging operations'],
      weight: 'Heavy',
      setting: 'Requires proper technique',
      holding: 'Good when properly set (30-40:1)'
    },
  },
  [AnchorType.NORTHILL]: {
    type: AnchorType.NORTHILL,
    name: 'Northill',
    category: 'traditional',
    description: 'Traditional lightweight anchor with pivoting flukes. Good for small boats and kedging.',
    detailedInfo: {
      pros: [
        'Lightweight',
        'Pivoting flukes',
        'Good for small boats',
        'Can be used for kedging',
        'Affordable'
      ],
      cons: [
        'Lower holding power than modern anchors',
        'Can be difficult to set',
        'Less common',
        'Not suitable for larger boats'
      ],
      priceRange: 'budget',
      bestFor: ['Small boats', 'Dinghies', 'Kedging', 'Temporary anchoring'],
      weight: 'Lightweight',
      setting: 'Moderate, requires technique',
      holding: 'Moderate (20-30:1 ratio)'
    },
  },
  [AnchorType.ULTRA]: {
    type: AnchorType.ULTRA,
    name: 'Ultra',
    category: 'modern',
    description: 'Modern scoop-type anchor with excellent performance. Australian design with strong holding power.',
    detailedInfo: {
      pros: [
        'Excellent holding power',
        'Fast setting',
        'Good reset capability',
        'Works in various bottoms',
        'Well-regarded performance'
      ],
      cons: [
        'Premium pricing',
        'Less widely available',
        'Newer design'
      ],
      priceRange: 'premium',
      bestFor: ['All-around use', 'Various bottom types', 'Serious cruising'],
      weight: 'Moderate',
      setting: 'Very fast',
      holding: 'Excellent (90-100:1 ratio)'
    },
  },
  [AnchorType.EXCEL]: {
    type: AnchorType.EXCEL,
    name: 'Excel',
    category: 'modern',
    description: 'Modern scoop anchor with roll-bar. Good alternative to Rocna with competitive performance.',
    detailedInfo: {
      pros: [
        'Good holding power',
        'Roll-bar design',
        'Fast setting',
        'Competitive with Rocna',
        'Moderate pricing'
      ],
      cons: [
        'Less proven than Rocna',
        'Roll-bar storage consideration',
        'Moderate availability'
      ],
      priceRange: 'moderate',
      bestFor: ['All-around use', 'Various conditions'],
      weight: 'Moderate',
      setting: 'Fast',
      holding: 'Very good (80-95:1 ratio)'
    },
  },
  [AnchorType.VULCAN]: {
    type: AnchorType.VULCAN,
    name: 'Vulcan',
    category: 'modern',
    description: 'Modern anchor from Rocna manufacturer. No roll-bar, designed for boats where roll-bar is problematic.',
    detailedInfo: {
      pros: [
        'No roll-bar (easier storage)',
        'Excellent holding power',
        'Fast setting',
        'From proven manufacturer',
        'Good reset capability'
      ],
      cons: [
        'Premium pricing',
        'Newer design',
        'May not self-right as reliably as roll-bar versions'
      ],
      priceRange: 'premium',
      bestFor: ['Boats with storage constraints', 'All-around use', 'Various bottoms'],
      weight: 'Moderate',
      setting: 'Very fast',
      holding: 'Excellent (90-100:1 ratio)'
    },
  },
  [AnchorType.SUPREME]: {
    type: AnchorType.SUPREME,
    name: 'Supreme',
    category: 'modern',
    description: 'Modern anchor design with good performance. Less common but well-regarded by users.',
    detailedInfo: {
      pros: [
        'Good holding power',
        'Modern design',
        'Sets well',
        'Works in various conditions'
      ],
      cons: [
        'Less widely available',
        'Moderate pricing',
        'Less proven than major brands'
      ],
      priceRange: 'moderate',
      bestFor: ['General use', 'Mixed conditions'],
      weight: 'Moderate',
      setting: 'Good',
      holding: 'Good to very good (75-90:1 ratio)'
    },
  },
  [AnchorType.STOCKLESS]: {
    type: AnchorType.STOCKLESS,
    name: 'Stockless',
    category: 'traditional',
    description: 'Traditional stockless anchor used on larger vessels. Heavy and relies primarily on weight.',
    detailedInfo: {
      pros: [
        'No stock to break',
        'Stows easily in hawsepipe',
        'Durable construction',
        'Traditional design'
      ],
      cons: [
        'Very heavy',
        'Low holding power per weight',
        'Requires significant scope',
        'Not suitable for recreational boats',
        'Expensive'
      ],
      priceRange: 'very-premium',
      bestFor: ['Large commercial vessels', 'Ships', 'Permanent moorings'],
      weight: 'Very heavy',
      setting: 'Slow, relies on weight',
      holding: 'Moderate (10-20:1 ratio), relies on weight'
    },
  },
  [AnchorType.NAVY_STOCKLESS]: {
    type: AnchorType.NAVY_STOCKLESS,
    name: 'Navy Stockless',
    category: 'traditional',
    description: 'Heavy-duty stockless anchor used by navies and commercial vessels. Extremely heavy and durable.',
    detailedInfo: {
      pros: [
        'Extremely durable',
        'Designed for harsh conditions',
        'No stock to break',
        'Proven in naval use'
      ],
      cons: [
        'Extremely heavy and expensive',
        'Very low holding power per weight',
        'Not suitable for recreational use',
        'Requires heavy equipment to handle'
      ],
      priceRange: 'very-premium',
      bestFor: ['Naval vessels', 'Large commercial ships', 'Heavy-duty applications'],
      weight: 'Extremely heavy',
      setting: 'Very slow, weight-based',
      holding: 'Low ratio (5-15:1), weight-dependent'
    },
  },
  [AnchorType.KEDGE]: {
    type: AnchorType.KEDGE,
    name: 'Kedge / Admiralty',
    category: 'traditional',
    description: 'Traditional stock anchor with arms and flukes. Good holding but requires more scope and skill to use.',
    detailedInfo: {
      pros: [
        'Traditional design',
        'Good holding when properly set',
        'Can work in various bottoms',
        'Classic appearance'
      ],
      cons: [
        'Requires significant scope (7:1 or more)',
        'Stock can break or get fouled',
        'Heavy and awkward to handle',
        'Requires skill to set properly',
        'Less efficient than modern anchors'
      ],
      priceRange: 'moderate',
      bestFor: ['Traditional boats', 'Kedging operations', 'Experienced sailors'],
      weight: 'Heavy',
      setting: 'Requires proper technique and scope',
      holding: 'Good when properly set (30-40:1 with adequate scope)'
    },
  },
  [AnchorType.GRAPNEL]: {
    type: AnchorType.GRAPNEL,
    name: 'Grapnel',
    category: 'other',
    description: 'Multi-pronged anchor with several hooks. Used for temporary anchoring, rocky bottoms, or as a kedge anchor.',
    detailedInfo: {
      pros: [
        'Works in rocky bottoms where others fail',
        'Lightweight and compact',
        'Can hook onto rocks or coral',
        'Inexpensive',
        'Good for temporary use'
      ],
      cons: [
        'Low holding power',
        'Can get permanently fouled',
        'Not suitable for soft bottoms',
        'Unreliable in most conditions',
        'Not recommended for primary anchor'
      ],
      priceRange: 'budget',
      bestFor: ['Rocky bottoms', 'Coral', 'Temporary anchoring', 'Kedging', 'Dinghies'],
      weight: 'Lightweight',
      setting: 'Hooks rather than sets',
      holding: 'Low and unreliable, hooks onto objects'
    },
  },
  [AnchorType.OTHER]: {
    type: AnchorType.OTHER,
    name: 'Other',
    category: 'other',
    description: 'Other anchor type not listed.',
    detailedInfo: {
      pros: [],
      cons: [],
      priceRange: 'moderate',
      bestFor: [],
      weight: 'Varies',
      setting: 'Varies',
      holding: 'Varies'
    },
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
        AnchorType.SPADE,
        AnchorType.ULTRA,
        AnchorType.AC14,
        AnchorType.VULCAN,
      ];
    case BottomType.MUD:
      return [
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.DANFORTH,
        AnchorType.FORTRESS,
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.SPADE,
      ];
    case BottomType.CLAY:
      return [
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.SPADE,
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.BRUCE,
        AnchorType.ULTRA,
      ];
    case BottomType.GRASS_WEEDS:
      return [
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.SPADE,
        AnchorType.PLOW,
        AnchorType.DELTA,
        AnchorType.BRUCE,
        AnchorType.ULTRA,
      ];
    case BottomType.ROCK:
      return [
        AnchorType.BRUCE,
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.GRAPNEL,
        AnchorType.SPADE,
      ];
    case BottomType.CORAL:
      return [
        AnchorType.BRUCE,
        AnchorType.GRAPNEL,
        // Note: Coral is generally poor for anchoring - use with extreme caution
      ];
    case BottomType.UNKNOWN:
    default:
      // For unknown, recommend versatile anchors
      return [
        AnchorType.ROCNA,
        AnchorType.MANTUS,
        AnchorType.SPADE,
        AnchorType.BRUCE,
        AnchorType.DELTA,
        AnchorType.ULTRA,
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

