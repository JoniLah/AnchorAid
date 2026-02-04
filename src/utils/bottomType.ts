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

/**
 * Get translated bottom type name
 * 
 * @param type - The bottom type
 * @param t - Optional translation function. If provided, translations will be used. Otherwise, English is returned.
 */
export function getBottomTypeName(
  type: BottomType,
  t?: (key: any) => string
): string {
  if (t && typeof t === 'function') {
    try {
      switch (type) {
        case BottomType.SAND:
          return t('bottomTypeSand');
        case BottomType.MUD:
          return t('bottomTypeMud');
        case BottomType.CLAY:
          return t('bottomTypeClay');
        case BottomType.GRASS_WEEDS:
          return t('bottomTypeGrassWeeds');
        case BottomType.ROCK:
          return t('bottomTypeRock');
        case BottomType.CORAL:
          return t('bottomTypeCoral');
        case BottomType.UNKNOWN:
          return t('bottomTypeUnknown');
        default:
          return BOTTOM_TYPE_INFO[type]?.name || 'Unknown';
      }
    } catch (error) {
      // Translation failed, fall through to English
    }
  }
  // Fallback to English
  return BOTTOM_TYPE_INFO[type]?.name || 'Unknown';
}

/**
 * Get translated suitability rating
 * 
 * @param suitability - The suitability rating ('Excellent', 'Good', 'Fair', 'Poor', 'Unknown')
 * @param t - Optional translation function. If provided, translations will be used. Otherwise, English is returned.
 */
export function getSuitabilityRating(
  suitability: string,
  t?: (key: any) => string
): string {
  if (t && typeof t === 'function') {
    try {
      const suitabilityLower = suitability.toLowerCase();
      switch (suitabilityLower) {
        case 'excellent':
          return t('excellent');
        case 'good':
          return t('good');
        case 'fair':
          return t('fair');
        case 'poor':
          return t('poor');
        case 'unknown':
          return t('bottomTypeUnknown');
        default:
          return suitability;
      }
    } catch (error) {
      // Translation failed, fall through to English
    }
  }
  // Fallback to English
  return suitability;
}

/**
 * Get bottom type info with optional translation
 * 
 * @param type - The bottom type
 * @param t - Optional translation function. If provided, notes will be translated. Otherwise, English is returned.
 */
export function getBottomTypeInfo(
  type: BottomType,
  t?: (key: any) => string
): BottomTypeInfo {
  const info = BOTTOM_TYPE_INFO[type];
  
  // Return translated notes if translation function is provided
  if (t && typeof t === 'function') {
    try {
      let notesKey: string;
      switch (type) {
        case BottomType.SAND:
          notesKey = 'bottomTypeSandNote';
          break;
        case BottomType.MUD:
          notesKey = 'bottomTypeMudNote';
          break;
        case BottomType.CLAY:
          notesKey = 'bottomTypeClayNote';
          break;
        case BottomType.GRASS_WEEDS:
          notesKey = 'bottomTypeGrassWeedsNote';
          break;
        case BottomType.ROCK:
          notesKey = 'bottomTypeRockNote';
          break;
        case BottomType.CORAL:
          notesKey = 'bottomTypeCoralNote';
          break;
        case BottomType.UNKNOWN:
          notesKey = 'bottomTypeUnknownNote';
          break;
        default:
          return info;
      }
      return {
        ...info,
        notes: t(notesKey),
      };
    } catch (error) {
      // Translation failed, fall through to default
    }
  }
  return info;
}

