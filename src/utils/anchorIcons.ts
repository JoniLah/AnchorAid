import {AnchorType} from '../types';

/**
 * Get icon representation for anchor type
 * 
 * These are simple text-based icons that can be replaced with:
 * - SVG images from assets
 * - Image files (PNG/SVG) from assets
 * - Icon library components
 * 
 * To use images instead:
 * 1. Add anchor images to assets/anchors/ (e.g., danforth.png, bruce.png)
 * 2. Import them: import danforthIcon from '../assets/anchors/danforth.png'
 * 3. Return <Image source={danforthIcon} style={styles.icon} /> instead
 */
export function getAnchorIcon(type: AnchorType): string {
  // Using Unicode symbols and emoji as placeholders
  // These can be replaced with actual anchor images
  const icons: Record<AnchorType, string> = {
    [AnchorType.DANFORTH]: '⚓', // Fluke anchor symbol
    [AnchorType.BRUCE]: '⚓', // Claw anchor
    [AnchorType.PLOW]: '⚓', // Plow anchor
    [AnchorType.DELTA]: '⚓', // Delta plow
    [AnchorType.ROCNA]: '⚓', // Modern anchor
    [AnchorType.MANTUS]: '⚓', // Modern roll-bar
    [AnchorType.FORTRESS]: '⚓', // Lightweight fluke
    [AnchorType.AC14]: '⚓', // Modern high-holding
    [AnchorType.SPADE]: '⚓', // Spade anchor
    [AnchorType.COBRA]: '⚓', // Cobra anchor
    [AnchorType.HERRESHOFF]: '⚓', // Herreshoff
    [AnchorType.NORTHILL]: '⚓', // Northill
    [AnchorType.ULTRA]: '⚓', // Ultra
    [AnchorType.EXCEL]: '⚓', // Excel
    [AnchorType.VULCAN]: '⚓', // Vulcan
    [AnchorType.SUPREME]: '⚓', // Supreme
    [AnchorType.STOCKLESS]: '⚓', // Stockless
    [AnchorType.NAVY_STOCKLESS]: '⚓', // Navy stockless
    [AnchorType.KEDGE]: '⚓', // Traditional stock
    [AnchorType.GRAPNEL]: '⚓', // Grapnel
    [AnchorType.MUSHROOM]: '⚓', // Mushroom
    [AnchorType.OTHER]: '⚓', // Other
  };

  return icons[type] || '⚓';
}

/**
 * Get a more distinctive icon for each anchor type
 * Using different Unicode symbols to differentiate
 */
export function getAnchorIconDetailed(type: AnchorType): string {
  const icons: Record<AnchorType, string> = {
    [AnchorType.DANFORTH]: '⛵', // Fluke - sailboat
    [AnchorType.BRUCE]: '🔱', // Claw - trident
    [AnchorType.PLOW]: '🔨', // Plow - tool
    [AnchorType.DELTA]: '⬇️', // Delta - triangle down
    [AnchorType.ROCNA]: '⭐', // Modern - star
    [AnchorType.MANTUS]: '💎', // Modern - diamond
    [AnchorType.FORTRESS]: '🏰', // Fortress - castle
    [AnchorType.AC14]: '🔷', // Modern - blue diamond
    [AnchorType.SPADE]: '♠️', // Spade - spade suit
    [AnchorType.COBRA]: '🐍', // Cobra - snake
    [AnchorType.HERRESHOFF]: '⛴️', // Herreshoff - ship
    [AnchorType.NORTHILL]: '🔧', // Northill - wrench
    [AnchorType.ULTRA]: '✨', // Ultra - sparkles
    [AnchorType.EXCEL]: '📊', // Excel - chart
    [AnchorType.VULCAN]: '🔥', // Vulcan - fire
    [AnchorType.SUPREME]: '👑', // Supreme - crown
    [AnchorType.STOCKLESS]: '⚙️', // Stockless - gear
    [AnchorType.NAVY_STOCKLESS]: '🛡️', // Navy - shield
    [AnchorType.KEDGE]: '⚓', // Traditional - anchor
    [AnchorType.GRAPNEL]: '🪝', // Grapnel - hook
    [AnchorType.MUSHROOM]: '🍄', // Mushroom - mushroom emoji
    [AnchorType.OTHER]: '❓', // Other - question
  };

  return icons[type] || '⚓';
}

/**
 * Example: How to use actual images
 * 
 * import {Image} from 'react-native';
 * 
 * export function getAnchorIconComponent(type: AnchorType) {
 *   const iconMap = {
 *     [AnchorType.DANFORTH]: require('../assets/anchors/danforth.png'),
 *     [AnchorType.BRUCE]: require('../assets/anchors/bruce.png'),
 *     // ... etc
 *   };
 *   
 *   return (
 *     <Image 
 *       source={iconMap[type]} 
 *       style={{width: 40, height: 40}} 
 *       resizeMode="contain"
 *     />
 *   );
 * }
 */

