import {AnchorType} from '../types';

// English descriptions (copied from anchorType.ts to avoid import)
const ENGLISH_DESCRIPTIONS: Record<AnchorType, string> = {
  [AnchorType.DANFORTH]: 'Lightweight fluke anchor with excellent holding power in sand and mud. One of the most popular anchors for recreational boats.',
  [AnchorType.BRUCE]: 'Versatile claw anchor that works well in most bottom types. Good for rocky areas where other anchors struggle.',
  [AnchorType.PLOW]: 'Classic pivoting plow anchor. Excellent in mud and good in sand. The pivoting shank helps it reset when wind shifts.',
  [AnchorType.DELTA]: 'Fixed-shank plow anchor with improved performance over CQR. Better setting and holding in various conditions.',
  [AnchorType.ROCNA]: 'Modern roll-bar anchor with exceptional holding power. One of the best-performing anchors available. Excellent in most conditions.',
  [AnchorType.MANTUS]: 'Modern roll-bar anchor with excellent performance. Disassembles for storage. Strong competitor to Rocna.',
  [AnchorType.FORTRESS]: 'Lightweight aluminum fluke anchor. Excellent in sand and mud. Can be disassembled. Popular for cruising boats.',
  [AnchorType.AC14]: 'Modern high-holding power anchor with wide fluke design. Good performance in various conditions.',
  [AnchorType.SPADE]: 'French-designed modern anchor with excellent performance. No roll-bar, relies on shape for orientation.',
  [AnchorType.COBRA]: 'Modern anchor design with good all-around performance. Less common but well-regarded.',
  [AnchorType.HERRESHOFF]: 'Traditional kedge-style anchor designed by yacht designer Nathanael Herreshoff. Good holding but requires skill to use.',
  [AnchorType.NORTHILL]: 'Traditional lightweight anchor with pivoting flukes. Good for small boats and kedging.',
  [AnchorType.ULTRA]: 'Modern scoop-type anchor with excellent performance. Australian design with strong holding power.',
  [AnchorType.EXCEL]: 'Modern scoop anchor with roll-bar. Good alternative to Rocna with competitive performance.',
  [AnchorType.VULCAN]: 'Modern anchor from Rocna manufacturer. No roll-bar, designed for boats where roll-bar is problematic.',
  [AnchorType.SUPREME]: 'Modern anchor design with good performance. Less common but well-regarded by users.',
  [AnchorType.STOCKLESS]: 'Traditional stockless anchor used on larger vessels. Heavy and relies primarily on weight.',
  [AnchorType.NAVY_STOCKLESS]: 'Heavy-duty stockless anchor used by navies and commercial vessels. Extremely heavy and durable.',
  [AnchorType.KEDGE]: 'Traditional stock anchor with arms and flukes. Good holding but requires more scope and skill to use.',
  [AnchorType.GRAPNEL]: 'Multi-pronged anchor with several hooks. Used for temporary anchoring, rocky bottoms, or as a kedge anchor.',
  [AnchorType.MUSHROOM]: 'Heavy, dome-shaped anchor designed for permanent moorings. Excellent holding power in mud and soft bottoms. Buries itself deeply for maximum security.',
  [AnchorType.OTHER]: 'Other anchor type not listed.',
};

/**
 * Get translated description for an anchor type
 * This is in a separate file to avoid circular dependency issues
 * 
 * @param type - The anchor type
 * @param t - Optional translation function. If provided, translations will be used. Otherwise, English is returned.
 */
export function getAnchorDescription(
  type: AnchorType,
  t?: (key: any) => string
): string {
  if (t && typeof t === 'function') {
    try {
      const descriptionMap: Record<AnchorType, string> = {
        [AnchorType.DANFORTH]: t('anchorDescriptionDanforth'),
        [AnchorType.BRUCE]: t('anchorDescriptionBruce'),
        [AnchorType.PLOW]: t('anchorDescriptionPlow'),
        [AnchorType.DELTA]: t('anchorDescriptionDelta'),
        [AnchorType.ROCNA]: t('anchorDescriptionRocna'),
        [AnchorType.MANTUS]: t('anchorDescriptionMantus'),
        [AnchorType.FORTRESS]: t('anchorDescriptionFortress'),
        [AnchorType.AC14]: t('anchorDescriptionAc14'),
        [AnchorType.SPADE]: t('anchorDescriptionSpade'),
        [AnchorType.COBRA]: t('anchorDescriptionCobra'),
        [AnchorType.HERRESHOFF]: t('anchorDescriptionHerreshoff'),
        [AnchorType.NORTHILL]: t('anchorDescriptionNorthill'),
        [AnchorType.ULTRA]: t('anchorDescriptionUltra'),
        [AnchorType.EXCEL]: t('anchorDescriptionExcel'),
        [AnchorType.VULCAN]: t('anchorDescriptionVulcan'),
        [AnchorType.SUPREME]: t('anchorDescriptionSupreme'),
        [AnchorType.STOCKLESS]: t('anchorDescriptionStockless'),
        [AnchorType.NAVY_STOCKLESS]: t('anchorDescriptionNavyStockless'),
        [AnchorType.KEDGE]: t('anchorDescriptionKedge'),
        [AnchorType.GRAPNEL]: t('anchorDescriptionGrapnel'),
        [AnchorType.MUSHROOM]: t('anchorDescriptionMushroom'),
        [AnchorType.OTHER]: t('anchorDescriptionOther'),
      };
      const translated = descriptionMap[type];
      if (translated) {
        return translated;
      }
    } catch (error) {
      // Translation failed, fall through to English
    }
  }
  // Fallback to English
  return ENGLISH_DESCRIPTIONS[type] || '';
}
