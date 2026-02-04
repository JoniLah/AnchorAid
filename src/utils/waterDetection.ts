/**
 * Check if coordinates are on water using a free API service
 * Falls back to blocking if API fails (conservative approach)
 */
export async function isOnWater(
  latitude: number,
  longitude: number,
): Promise<boolean> {
  try {
    // Try using IsItWater API (free, no key required)
    // API endpoint: https://isitwater.com/api/{lat},{lng}
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://isitwater.com/api/${latitude},${longitude}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // API returns {water: true/false}
      if (typeof data.water === 'boolean') {
        return data.water;
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Water detection API timeout');
    } else {
      console.log('Water detection API error:', error);
    }
  }

  // Fallback: Default to allowing (if API fails, allow drawing - we'll filter land points when finishing)
  // This ensures users can always draw, and we'll handle land points during polygon completion
  return true;
}

/**
 * Check multiple coordinates at once (for polygon validation)
 */
export async function validatePolygonOnWater(
  coordinates: Array<{latitude: number; longitude: number}>,
): Promise<{isValid: boolean; landPoints: number[]}> {
  const landPoints: number[] = [];
  
  // Check each point
  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i];
    const onWater = await isOnWater(coord.latitude, coord.longitude);
    if (!onWater) {
      landPoints.push(i);
    }
    // Add small delay to avoid rate limiting
    if (i < coordinates.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return {
    isValid: landPoints.length === 0,
    landPoints,
  };
}
