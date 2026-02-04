/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(
  point: {latitude: number; longitude: number},
  polygon: Array<{latitude: number; longitude: number}>,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if two polygons overlap
 * Returns true if any vertex of polygon1 is inside polygon2, or vice versa
 */
export function doPolygonsOverlap(
  polygon1: Array<{latitude: number; longitude: number}>,
  polygon2: Array<{latitude: number; longitude: number}>,
): boolean {
  // Check if any vertex of polygon1 is inside polygon2
  for (const point of polygon1) {
    if (isPointInPolygon(point, polygon2)) {
      return true;
    }
  }

  // Check if any vertex of polygon2 is inside polygon1
  for (const point of polygon2) {
    if (isPointInPolygon(point, polygon1)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate distance from a point to a line segment (in degrees)
 */
function pointToLineDistance(
  point: {latitude: number; longitude: number},
  lineStart: {latitude: number; longitude: number},
  lineEnd: {latitude: number; longitude: number},
): number {
  const A = point.longitude - lineStart.longitude;
  const B = point.latitude - lineStart.latitude;
  const C = lineEnd.longitude - lineStart.longitude;
  const D = lineEnd.latitude - lineStart.latitude;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.longitude;
    yy = lineStart.latitude;
  } else if (param > 1) {
    xx = lineEnd.longitude;
    yy = lineEnd.latitude;
  } else {
    xx = lineStart.longitude + param * C;
    yy = lineStart.latitude + param * D;
  }

  const dx = point.longitude - xx;
  const dy = point.latitude - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the closest point on a polygon edge to a given point
 */
function findClosestPointOnPolygon(
  point: {latitude: number; longitude: number},
  polygon: Array<{latitude: number; longitude: number}>,
): {latitude: number; longitude: number; distance: number} | null {
  let minDistance = Infinity;
  let closestPoint: {latitude: number; longitude: number} | null = null;

  for (let i = 0; i < polygon.length; i++) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];

    const A = point.longitude - start.longitude;
    const B = point.latitude - start.latitude;
    const C = end.longitude - start.longitude;
    const D = end.latitude - start.latitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = start.longitude;
      yy = start.latitude;
    } else if (param > 1) {
      xx = end.longitude;
      yy = end.latitude;
    } else {
      xx = start.longitude + param * C;
      yy = start.latitude + param * D;
    }

    const dx = point.longitude - xx;
    const dy = point.latitude - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = {latitude: yy, longitude: xx};
    }
  }

  if (closestPoint) {
    return {...closestPoint, distance: minDistance};
  }
  return null;
}

/**
 * Snap polygon vertices to the edges of another polygon
 * Threshold is in degrees (approximately 0.001 degrees ≈ 111 meters)
 */
export function snapPolygonToPolygon(
  polygonToSnap: Array<{latitude: number; longitude: number}>,
  targetPolygon: Array<{latitude: number; longitude: number}>,
  threshold: number = 0.001, // ~111 meters
): Array<{latitude: number; longitude: number}> {
  const snapped = polygonToSnap.map((point) => {
    const closest = findClosestPointOnPolygon(point, targetPolygon);
    if (closest && closest.distance < threshold) {
      return {latitude: closest.latitude, longitude: closest.longitude};
    }
    return point;
  });

  return snapped;
}
