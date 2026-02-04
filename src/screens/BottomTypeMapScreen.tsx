import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker, Circle, Polygon, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {getCurrentPosition} from '../services/location-expo';
import {
  predictBottomType,
  getBottomTypeHeatmap,
  getBottomTypeStats,
  BottomTypePrediction,
} from '../services/bottomTypePrediction';
import {Location, BottomType} from '../types';
import {BOTTOM_TYPE_INFO, getBottomTypeName} from '../utils/bottomType';
import {t} from '../i18n';
import {Button} from '../components/Button';
import {PickerField} from '../components/PickerField';
import {loadData, saveData} from '../services/storage';
import {Platform} from 'react-native';
import {isOnWater, validatePolygonOnWater} from '../utils/waterDetection';
import {doPolygonsOverlap, snapPolygonToPolygon} from '../utils/polygonCollision';
import {haversineDistance} from '../utils/haversine';
import {useTheme} from '../theme/ThemeContext';

// Color mapping for bottom types
const BOTTOM_TYPE_COLORS: Record<BottomType, string> = {
  [BottomType.SAND]: '#F4D03F', // Yellow
  [BottomType.MUD]: '#8B4513', // Brown
  [BottomType.CLAY]: '#CD853F', // Tan
  [BottomType.GRASS_WEEDS]: '#228B22', // Green
  [BottomType.ROCK]: '#696969', // Gray
  [BottomType.CORAL]: '#FF1493', // Pink
  [BottomType.UNKNOWN]: '#CCCCCC', // Light gray
};

interface DrawnArea {
  id: string;
  coordinates: Array<{latitude: number; longitude: number}>;
  bottomType: BottomType;
  timestamp: number;
  type: 'polygon' | 'circle';
  center?: {latitude: number; longitude: number};
  radius?: number; // in meters
}

export const BottomTypeMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();
  const isDark = effectiveTheme === 'dark';
  // Use much darker blue in dark mode for better visibility
  const primaryBlue = isDark ? '#1E88E5' : '#007AFF';
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [prediction, setPrediction] = useState<BottomTypePrediction | null>(null);
  const [showPredictionPanel, setShowPredictionPanel] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [heatmapData, setHeatmapData] = useState<Array<{
    latitude: number;
    longitude: number;
    bottomType: BottomType;
    confidence: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalRecords: number;
    recordsByType: Record<BottomType, number>;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Drawing mode state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isMoveMarkerMode, setIsMoveMarkerMode] = useState(false);
  const [drawingType, setDrawingType] = useState<'polygon' | 'circle'>('polygon');
  const [currentPolygon, setCurrentPolygon] = useState<Array<{id: string; latitude: number; longitude: number}>>([]);
  const [currentCircle, setCurrentCircle] = useState<{center: {latitude: number; longitude: number}; radius: number} | null>(null);
  const [drawnAreas, setDrawnAreas] = useState<DrawnArea[]>([]);
  const [selectedBottomType, setSelectedBottomType] = useState<BottomType>(BottomType.SAND);
  const [showBottomTypePicker, setShowBottomTypePicker] = useState(false);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
  const [editingArea, setEditingArea] = useState<DrawnArea | null>(null);
  const [isDeletingMarker, setIsDeletingMarker] = useState(false);
  const [isAreaInfoExpanded, setIsAreaInfoExpanded] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
    loadStats();
    loadDrawnAreas();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      updateMapRegion(currentLocation);
      loadPrediction(currentLocation);
      
      const timer = setTimeout(() => {
        loadHeatmap(currentLocation);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentLocation]);

  // Force map to center when both mapRegion and mapReady are available
  useEffect(() => {
    if (mapRegion && mapReady && mapRef.current) {
      const forceCenter = () => {
        try {
          console.log('🔄 Forcing map to center on:', mapRegion);
          mapRef.current?.animateToRegion(mapRegion, 1000);
        } catch (error) {
          console.error('❌ Error forcing map center:', error);
        }
      };

      forceCenter();
      const timer1 = setTimeout(forceCenter, 300);
      const timer2 = setTimeout(forceCenter, 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mapRegion, mapReady]);

  const loadCurrentLocation = async () => {
    try {
      setLoading(true);
      const {requestLocationPermission} = await import('../services/location-expo');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          t('permissionRequired'),
          t('locationPermissionRequired'),
        );
        setLoading(false);
        return;
      }
      const location = await getCurrentPosition();
      
      if (location.latitude === 0 && location.longitude === 0) {
        throw new Error('Invalid location coordinates (0,0)');
      }
      
      if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
        throw new Error('Invalid location coordinates');
      }
      
      console.log('Location loaded successfully:', location.latitude, location.longitude);
      
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      console.log('Setting mapRegion to:', newRegion);
      setMapRegion(newRegion);
      setCurrentLocation(location);
    } catch (error: any) {
      console.error('Error loading location:', error);
      const errorMessage =
        error?.message || t('failedToGetLocation');
      Alert.alert(t('locationError'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMapRegion = (location: Location) => {
    if (location.latitude !== 0 && location.longitude !== 0 && 
        Math.abs(location.latitude) <= 90 && Math.abs(location.longitude) <= 180) {
      console.log('Updating map region to:', location.latitude, location.longitude);
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setMapRegion(newRegion);
      
      if (mapReady && mapRef.current) {
        setTimeout(() => {
          try {
            mapRef.current?.animateToRegion(newRegion, 1000);
          } catch (error) {
            console.log('Could not animate map:', error);
          }
        }, 100);
      }
    }
  };

  const loadPrediction = async (location: Location) => {
    try {
      const pred = await predictBottomType(location);
      setPrediction(pred);
    } catch (error) {
      console.error('Error loading prediction:', error);
    }
  };

  const loadHeatmap = async (location: Location) => {
    try {
      const data = await getBottomTypeHeatmap(location, 5, 30);
      setHeatmapData(data);
      console.log('Heatmap loaded:', data.length, 'points');
    } catch (error) {
      console.error('Error loading heatmap:', error);
    }
  };

  const loadStats = async () => {
    const statsData = await getBottomTypeStats();
    setStats({
      totalRecords: statsData.totalRecords,
      recordsByType: statsData.recordsByType,
    });
  };

  const handleMapPress = async (event: any) => {
    // Don't add points if a marker is selected, being dragged, or being deleted
    if (selectedMarkerIndex !== null || draggingPointIndex !== null || isDeletingMarker) {
      // Just clear selection, don't add point
      if (selectedMarkerIndex !== null && !isDeletingMarker) {
        setSelectedMarkerIndex(null);
      }
      return;
    }
    
    if (isMoveMarkerMode) {
      // In move marker mode, don't add points - just clear selection
      setSelectedMarkerIndex(null);
      return;
    }
    
    if (isDrawingMode) {
      const coordinate = event.nativeEvent.coordinate;
      
      if (drawingType === 'circle') {
        // For circle mode, create circle on first tap
        if (!currentCircle) {
          setCurrentCircle({
            center: coordinate,
            radius: 500, // Default 500 meters
          });
        }
      } else {
        // Polygon mode - add point with unique ID
        setCurrentPolygon([...currentPolygon, {
          id: `point-${Date.now()}-${Math.random()}`,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        }]);
      }
    } else {
      // Check if clicking on an existing area for editing
      const {latitude, longitude} = event.nativeEvent.coordinate;
      const tappedLocation: Location = {
        latitude,
        longitude,
        timestamp: Date.now(),
      };
      
      // Check if tap is on an existing area
      let tappedArea: DrawnArea | null = null;
      for (const area of drawnAreas) {
        if (area.type === 'circle' && area.center) {
          const distance = haversineDistance(tappedLocation, area.center);
          if (distance <= (area.radius || 500)) {
            tappedArea = area;
            break;
          }
        } else if (area.type === 'polygon') {
          // Check if point is inside polygon
          const {isPointInPolygon} = await import('../utils/polygonCollision');
          if (isPointInPolygon(tappedLocation, area.coordinates)) {
            tappedArea = area;
            break;
          }
        }
      }
      
      if (tappedArea) {
        // Enter edit mode for this area
        setEditingArea(tappedArea);
        setIsAreaInfoExpanded(false); // Start collapsed
        if (tappedArea.type === 'polygon') {
          // Convert coordinates to points with IDs for editing
          const pointsWithIds = tappedArea.coordinates.map((coord, idx) => ({
            id: `point-${tappedArea.id}-${idx}`,
            latitude: coord.latitude,
            longitude: coord.longitude,
          }));
          setCurrentPolygon(pointsWithIds);
          setIsDrawingMode(true);
          setDrawingType('polygon');
        } else {
          setCurrentCircle({
            center: tappedArea.center!,
            radius: tappedArea.radius || 500,
          });
          setIsDrawingMode(true);
          setDrawingType('circle');
        }
        setSelectedBottomType(tappedArea.bottomType);
        return;
      }
      
      // Get prediction for tapped location
      await loadPrediction(tappedLocation);
    }
  };

  const handleMarkerPress = (e: any, index: number) => {
    if (!isDrawingMode) return;
    if (draggingPointIndex !== null) return; // Don't handle press if already dragging
    
    // If clicking on the first marker while drawing and we have at least 3 points, close the polygon
    if (!isMoveMarkerMode && index === 0 && currentPolygon.length >= 3) {
      // Close the polygon by finishing the drawing
      finishDrawing();
      return;
    }
    
    // If in drawing mode and marker is pressed, switch to move marker mode
    if (!isMoveMarkerMode && currentPolygon.length > 0) {
      setIsMoveMarkerMode(true);
    }
    
    // Select the marker - this prevents map press from adding new points
    // Keep it selected until drag starts or user taps elsewhere
    setSelectedMarkerIndex(index);
  };

  const handleMarkerDragStart = (e: any, index: number) => {
    console.log('Drag start:', index);
    setDraggingPointIndex(index);
    setSelectedMarkerIndex(index);
  };

  const handleMarkerDrag = (e: any, index: number) => {
    const coordinate = e.nativeEvent.coordinate;
    console.log('🔄 Dragging:', index, 'lat:', coordinate.latitude, 'lng:', coordinate.longitude);
    
    // Ensure we have valid coordinates
    if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
      console.warn('Invalid coordinate in drag:', coordinate);
      return;
    }
    
    // Update the point being dragged in real-time
    setCurrentPolygon(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };
      return updated;
    });
  };

  const handleMarkerDragEnd = (e: any, index: number) => {
    const coordinate = e.nativeEvent.coordinate;
    console.log('✅ Drag end:', index, 'lat:', coordinate.latitude, 'lng:', coordinate.longitude);
    
    // Ensure we have valid coordinates
    if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
      console.warn('Invalid coordinate in drag end:', coordinate);
      setDraggingPointIndex(null);
      setSelectedMarkerIndex(null);
      return;
    }
    
    // Final update
    setCurrentPolygon(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };
      return updated;
    });
    
    // Clear dragging state
    setDraggingPointIndex(null);
    setSelectedMarkerIndex(null);
  };

  const handleRegionChangeComplete = async (region: any) => {
    const center: Location = {
      latitude: region.latitude,
      longitude: region.longitude,
      timestamp: Date.now(),
    };
    await loadHeatmap(center);
  };

  const startDrawing = (type: 'polygon' | 'circle' = 'polygon') => {
    setIsDrawingMode(true);
    setIsMoveMarkerMode(false);
    setDrawingType(type);
    setCurrentPolygon([]);
    setCurrentCircle(null);
    setSelectedMarkerIndex(null);
    setEditingArea(null);
  };

  const toggleMoveMarkerMode = () => {
    if (currentPolygon.length === 0) {
      Alert.alert('No Points', 'Please add at least one point before moving markers.');
      return;
    }
    setIsMoveMarkerMode(!isMoveMarkerMode);
    setSelectedMarkerIndex(null);
    setDraggingPointIndex(null);
  };

  const cancelDrawing = () => {
    setIsDrawingMode(false);
    setIsMoveMarkerMode(false);
    setCurrentPolygon([]);
    setCurrentCircle(null);
    setSelectedMarkerIndex(null);
    setDraggingPointIndex(null);
    setEditingArea(null);
    setIsAreaInfoExpanded(false);
  };

  const cancelMoveMarkerMode = () => {
    setIsMoveMarkerMode(false);
    setSelectedMarkerIndex(null);
    setDraggingPointIndex(null);
  };

  const deleteSelectedMarker = () => {
    if (selectedMarkerIndex === null || drawingType === 'circle' || isDeletingMarker) return;
    
    if (currentPolygon.length <= 3) {
      Alert.alert(
        t('cannotDelete'),
        t('polygonNeedsThreePoints'),
      );
      return;
    }

    // Get the point ID to delete before async operation
    const pointToDelete = currentPolygon[selectedMarkerIndex];
    if (!pointToDelete || !pointToDelete.id) {
      Alert.alert(t('error'), t('unableToIdentifyMarker'));
      return;
    }
    
    const pointIdToDelete = pointToDelete.id;
    setIsDeletingMarker(true); // Prevent map interactions during deletion
    
    Alert.alert(
      t('deleteMarker'),
      t('deleteMarkerConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
          onPress: () => {
            // Clear selection and deletion flag when canceling
            setSelectedMarkerIndex(null);
            setIsDeletingMarker(false);
          },
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            // Clear selection and exit move marker mode FIRST, before updating polygon
            setSelectedMarkerIndex(null);
            setIsMoveMarkerMode(false);
            
            // Use functional update to delete by ID
            setCurrentPolygon(prevPolygon => {
              const updatedPolygon = prevPolygon.filter(point => point.id !== pointIdToDelete);
              
              // Clear deletion flag after update
              setIsDeletingMarker(false);
              
              // If less than 3 points remain, warn user
              if (updatedPolygon.length < 3) {
                setTimeout(() => {
                  Alert.alert(
                    t('warning'),
                    t('polygonNeedsThreePointsComplete'),
                  );
                }, 100);
              }
              
              return updatedPolygon;
            });
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          // Clear deletion flag if alert is dismissed
          setIsDeletingMarker(false);
        },
      },
    );
  };

  const finishDrawing = async () => {
    if (drawingType === 'circle') {
      // Handle circle saving
      if (!currentCircle) {
        Alert.alert(t('invalidCircle'), t('createCircleFirst'));
        return;
      }
      
      // Check if center is on water
      const onWater = await isOnWater(currentCircle.center.latitude, currentCircle.center.longitude);
      if (!onWater) {
        Alert.alert(t('landDetected'), t('circleCenterOnLand'));
        return;
      }
      
      const saveCircleArea = () => {
        const newArea: DrawnArea = {
          id: editingArea?.id || `area-${Date.now()}`,
          coordinates: [], // Empty for circles
          bottomType: selectedBottomType,
          timestamp: editingArea?.timestamp || Date.now(),
          type: 'circle',
          center: currentCircle.center,
          radius: currentCircle.radius,
        };
        
        if (editingArea) {
          // Update existing area - remove old, add new
          const updatedAreas = drawnAreas.filter(area => area.id !== editingArea.id);
          updatedAreas.push(newArea);
          setDrawnAreas(updatedAreas);
          saveDrawnAreas(updatedAreas);
        } else {
          // Add new area
          setDrawnAreas([...drawnAreas, newArea]);
          saveDrawnAreas([...drawnAreas, newArea]);
        }
        
        setIsDrawingMode(false);
        setCurrentCircle(null);
        setEditingArea(null);
        Alert.alert(t('areaSaved'), t('savedCircle').replace('{type}', getBottomTypeName(selectedBottomType, t)).replace('{radius}', String(Math.round(currentCircle.radius))));
      };
      
      saveCircleArea();
      return;
    }
    
    // Handle polygon saving
    if (currentPolygon.length < 3) {
      Alert.alert(t('invalidPolygon'), t('polygonNeedsThreePointsAdd'));
      return;
    }
    
    // Convert polygon points to coordinates for validation
    const coordinates = currentPolygon.map(p => ({latitude: p.latitude, longitude: p.longitude}));
    
    // Validate polygon points and filter out land points
    const validation = await validatePolygonOnWater(coordinates);
    
    let finalPolygon = currentPolygon;
    
    if (!validation.isValid) {
      finalPolygon = currentPolygon.filter((_, index) => !validation.landPoints.includes(index));
      
      if (finalPolygon.length < 3) {
        Alert.alert(
          'Too Many Land Points',
          'Too many points are on land. Please ensure at least 3 points are on water.',
        );
        return;
      }
      
      const landCount = validation.landPoints.length;
      const waterCount = finalPolygon.length;
      
      if (landCount > 0) {
        // Get the translated message template
        const messageTemplate = t('landPointsRemovedMessage');
        // Determine plural suffix and was/were based on language
        // Check if message contains language-specific patterns
        const isFinnish = messageTemplate.includes('maapistettä');
        const isSwedish = messageTemplate.includes('punkt');
        const plural = landCount > 1 ? (isFinnish ? 't' : isSwedish ? 'er' : 's') : '';
        // was/were is only needed for English
        const wasWere = (!isFinnish && !isSwedish) ? (landCount > 1 ? 'were' : 'was') : '';
        Alert.alert(
          t('landPointsRemoved'),
          messageTemplate
            .replace('{count}', String(landCount))
            .replace('{plural}', plural)
            .replace('{wasWere}', wasWere)
            .replace('{waterCount}', String(waterCount)),
        );
      }
    }
    
    // Convert finalPolygon to coordinates for collision detection
    const finalCoordinates = finalPolygon.map(p => ({latitude: p.latitude, longitude: p.longitude}));
    
    // Check for collisions with existing areas
    const overlappingAreas: DrawnArea[] = [];
    for (const area of drawnAreas) {
      if (area.id === editingArea?.id) continue; // Skip the area being edited
      
      if (area.type === 'polygon' && doPolygonsOverlap(finalCoordinates, area.coordinates)) {
        overlappingAreas.push(area);
      } else if (area.type === 'circle' && area.center) {
        // Check if polygon overlaps with circle
        const centerInPolygon = (await import('../utils/polygonCollision')).isPointInPolygon(area.center, finalCoordinates);
        if (centerInPolygon) {
          overlappingAreas.push(area);
        }
      }
    }
    
    const savePolygonArea = (snappedCoordinates?: Array<{latitude: number; longitude: number}>) => {
      // Convert finalPolygon points to coordinates format (remove IDs)
      const finalCoordinates = finalPolygon.map(p => ({latitude: p.latitude, longitude: p.longitude}));
      const coordinatesToSave = snappedCoordinates || finalCoordinates;
      const newArea: DrawnArea = {
        id: editingArea?.id || `area-${Date.now()}`,
        coordinates: coordinatesToSave,
        bottomType: selectedBottomType,
        timestamp: editingArea?.timestamp || Date.now(),
        type: 'polygon',
      };
      
      if (editingArea) {
        // Update existing area - remove old, add new
        const updatedAreas = drawnAreas.filter(area => area.id !== editingArea.id);
        updatedAreas.push(newArea);
        setDrawnAreas(updatedAreas);
        saveDrawnAreas(updatedAreas);
      } else {
        // Add new area
        setDrawnAreas([...drawnAreas, newArea]);
        saveDrawnAreas([...drawnAreas, newArea]);
      }
      
      setIsDrawingMode(false);
      setCurrentPolygon([]);
      setEditingArea(null);
      Alert.alert(t('areaSaved'), t('savedArea').replace('{type}', getBottomTypeName(selectedBottomType, t)).replace('{count}', String(coordinatesToSave.length)));
    };
    
    if (overlappingAreas.length > 0) {
      const areaNames = overlappingAreas
        .map(area => getBottomTypeName(area.bottomType, t))
        .join(', ');
      
      Alert.alert(
        t('overlappingAreaDetected'),
        t('polygonOverlapsExisting').replace('{areas}', areaNames),
        [
          {
            text: t('cancel'),
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: t('snapToBorder'),
            onPress: () => {
              let snappedCoordinates = finalCoordinates;
              for (const overlapArea of overlappingAreas) {
                if (overlapArea.type === 'polygon') {
                  snappedCoordinates = snapPolygonToPolygon(snappedCoordinates, overlapArea.coordinates);
                }
              }
              savePolygonArea(snappedCoordinates);
            },
          },
          {
            text: t('removeExisting'),
            style: 'destructive',
            onPress: () => {
              const remainingAreas = drawnAreas.filter(
                area => !overlappingAreas.some(overlap => overlap.id === area.id)
              );
              setDrawnAreas(remainingAreas);
              saveDrawnAreas(remainingAreas);
              savePolygonArea();
            },
          },
        ],
        {cancelable: true},
      );
    } else {
      savePolygonArea();
    }
  };

  const saveDrawnAreas = async (areas: DrawnArea[]) => {
    try {
      await saveData('drawnBottomTypeAreas', areas);
    } catch (error) {
      console.error('Error saving drawn areas:', error);
    }
  };

  const loadDrawnAreas = async () => {
    try {
      const areas = await loadData<DrawnArea[]>('drawnBottomTypeAreas');
      if (areas) {
        // Ensure backward compatibility - add type field if missing
        const normalizedAreas = areas.map(area => ({
          ...area,
          type: area.type || 'polygon', // Default to polygon for old data
        }));
        setDrawnAreas(normalizedAreas);
      }
    } catch (error) {
      console.error('Error loading drawn areas:', error);
    }
  };

  const deleteArea = (id: string) => {
    const updatedAreas = drawnAreas.filter(area => area.id !== id);
    setDrawnAreas(updatedAreas);
    saveDrawnAreas(updatedAreas);
  };

  const clearAllMappings = () => {
    if (drawnAreas.length === 0) {
      Alert.alert(t('noMappings'), t('noMappingsToClear'));
      return;
    }

    Alert.alert(
      t('clearAllMappings'),
      t('deleteAllMappingsConfirm').replace('{count}', String(drawnAreas.length)).replace('{plural}', drawnAreas.length > 1 ? 's' : ''),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: () => {
            setDrawnAreas([]);
            saveDrawnAreas([]);
            Alert.alert(t('mappingsCleared'), t('allMappingsRemoved'));
          },
        },
      ],
      {cancelable: true},
    );
  };

  const bottomTypeOptions = Object.values(BottomType)
    .filter(type => type !== BottomType.UNKNOWN)
    .map(type => ({
      label: getBottomTypeName(type, t),
      value: type,
    }));

  return (
    <View style={styles.container}>
      {/* Toggle Container for Prediction Panel and Legend */}
      <View
        style={[
          styles.toggleContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            top: insets.top + 4,
          },
        ]}>
        {prediction && (
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => setShowPredictionPanel(!showPredictionPanel)}
            activeOpacity={0.7}>
            <Ionicons
              name={showPredictionPanel ? 'eye-off' : 'eye'}
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.toggleLabel, {color: colors.text}]}>
              {t('prediction')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.toggleItem}
          onPress={() => setShowLegend(!showLegend)}
          activeOpacity={0.7}>
          <Ionicons
            name={showLegend ? 'eye-off' : 'eye'}
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.toggleLabel, {color: colors.text}]}>
            {t('bottomTypes')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prediction Info Panel */}
      {prediction && showPredictionPanel && (
        <View style={[
          styles.predictionPanel,
          {
            backgroundColor: colors.surface,
            top: insets.top + 52,
          },
        ]}>
          <Text style={[styles.predictionTitle, {color: colors.text}]}>{t('predictedBottomType')}</Text>
          <View style={styles.predictionContent}>
            <View
              style={[
                styles.bottomTypeIndicator,
                {backgroundColor: BOTTOM_TYPE_COLORS[prediction.bottomType]},
              ]}
            />
            <View style={styles.predictionInfo}>
              <Text style={[styles.predictionType, {color: colors.text}]}>
                {getBottomTypeName(prediction.bottomType, t)}
              </Text>
              <Text style={[styles.predictionConfidence, {color: colors.textSecondary}]}>
                {t('confidence')}: {Math.round(prediction.confidence * 100)}%
              </Text>
              <Text style={[styles.predictionDetails, {color: colors.textTertiary}]}>
                {prediction.nearbyRecords === 1 
                  ? t('basedOnNearbyObservations').replace('{count}', String(prediction.nearbyRecords))
                  : t('nearbyObservationsPlural').replace('{count}', String(prediction.nearbyRecords))} {t('avgDistanceAway').replace('{distance}', String(Math.round(prediction.averageDistance)))}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats Panel */}
      {stats && (
        <View style={styles.statsPanel}>
          <Text style={styles.statsTitle}>
            {stats.totalRecords > 0 
              ? t('databaseObservations').replace('{count}', String(stats.totalRecords))
              : t('noDataYet')}
          </Text>
        </View>
      )}

      {/* Drawing/Move Marker Mode Indicator */}
      {isDrawingMode && (
        <View style={[
          styles.drawingModePanel,
          {
            backgroundColor: primaryBlue,
          },
          isMoveMarkerMode && styles.moveMarkerModePanel
        ]}>
          <Text style={styles.drawingModeText}>
            {isMoveMarkerMode 
              ? t('moveMarkerMode').replace('{details}', drawingType === 'circle' ? t('circle') : `${currentPolygon.length} ${t('points').toLowerCase()}`)
              : drawingType === 'circle'
              ? t('circleMode').replace('{radius}', String(currentCircle ? Math.round(currentCircle.radius) : 0))
              : t('polygonMode').replace('{count}', String(currentPolygon.length))}
          </Text>
          
          {/* Area Information Box - shown when editing existing area */}
          {editingArea && (
            <View style={styles.areaInfoBox}>
              <TouchableOpacity
                style={styles.areaInfoHeader}
                onPress={() => setIsAreaInfoExpanded(!isAreaInfoExpanded)}
                activeOpacity={0.7}>
                <View style={styles.areaInfoHeaderContent}>
                  <View
                    style={[
                      styles.areaInfoColorIndicator,
                      {backgroundColor: BOTTOM_TYPE_COLORS[selectedBottomType]},
                    ]}
                  />
                  <Text style={styles.areaInfoHeaderText}>
                    {getBottomTypeName(selectedBottomType, t)}
                  </Text>
                </View>
                <Ionicons
                  name={isAreaInfoExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
              
              {isAreaInfoExpanded && (
                <View style={styles.areaInfoContent}>
                  <View style={styles.areaInfoRow}>
                    <Text style={styles.areaInfoLabelText}>{t('created')}:</Text>
                    <Text style={styles.areaInfoValue}>
                      {new Date(editingArea.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  {editingArea.type === 'circle' && editingArea.radius && (
                    <View style={styles.areaInfoRow}>
                      <Text style={styles.areaInfoLabelText}>{t('radius')}:</Text>
                      <Text style={styles.areaInfoValue}>
                        {Math.round(editingArea.radius)}m
                      </Text>
                    </View>
                  )}
                  {editingArea.type === 'polygon' && (
                    <View style={styles.areaInfoRow}>
                      <Text style={styles.areaInfoLabelText}>{t('points')}:</Text>
                      <Text style={styles.areaInfoValue}>
                        {editingArea.coordinates.length}
                      </Text>
                    </View>
                  )}
                  <View style={styles.areaInfoBottomTypePicker}>
                    <PickerField
                      label={t('bottomType')}
                      value={selectedBottomType}
                      options={bottomTypeOptions}
                      onValueChange={(value) => {
                        const newBottomType = value as BottomType;
                        setSelectedBottomType(newBottomType);
                        // Update editingArea's bottomType as well
                        if (editingArea) {
                          setEditingArea({
                            ...editingArea,
                            bottomType: newBottomType,
                          });
                        }
                      }}
                    />
                  </View>
                  <View style={styles.areaInfoActions}>
                    <Button
                      title={t('deleteArea')}
                      onPress={() => {
                        Alert.alert(
                          t('deleteArea'),
                          t('deleteAreaConfirm'),
                          [
                            {text: t('cancel'), style: 'cancel'},
                            {
                              text: t('delete'),
                              style: 'destructive',
                              onPress: () => {
                                deleteArea(editingArea.id);
                                cancelDrawing();
                              },
                            },
                          ],
                        );
                      }}
                      variant="danger"
                      style={styles.deleteAreaButton}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
          
          {drawingType === 'circle' && currentCircle && (
            <View style={styles.circleControls}>
              <Text style={styles.circleControlLabel}>Radius: {Math.round(currentCircle.radius)}m</Text>
              <View style={styles.radiusControls}>
                <Button
                  title="-"
                  onPress={() => {
                    setCurrentCircle({
                      ...currentCircle,
                      radius: Math.max(50, currentCircle.radius - 50),
                    });
                  }}
                  variant="secondary"
                  style={styles.radiusButton}
                />
                <Button
                  title="+"
                  onPress={() => {
                    setCurrentCircle({
                      ...currentCircle,
                      radius: Math.min(5000, currentCircle.radius + 50),
                    });
                  }}
                  variant="secondary"
                  style={styles.radiusButton}
                />
              </View>
            </View>
          )}
          <View style={styles.drawingControls}>
            {isMoveMarkerMode ? (
              <>
                <Button
                  title={t('backToDrawing')}
                  onPress={cancelMoveMarkerMode}
                  variant="secondary"
                  style={styles.drawingButton}
                />
                {selectedMarkerIndex !== null && drawingType === 'polygon' && currentPolygon.length > 3 && (
                  <Button
                    title={t('deleteMarker')}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      deleteSelectedMarker();
                    }}
                    variant="danger"
                    style={styles.drawingButton}
                  />
                )}
                <Button
                  title={t('cancel')}
                  onPress={cancelDrawing}
                  variant="secondary"
                  style={styles.drawingButton}
                />
              </>
            ) : (
              <>
                <Button
                  title={t('cancel')}
                  onPress={cancelDrawing}
                  variant="secondary"
                  style={styles.drawingButton}
                />
                {drawingType === 'polygon' && currentPolygon.length >= 3 ? (
                  <Button
                    title={t('connectToFinish')}
                    onPress={finishDrawing}
                    variant="primary"
                    style={styles.drawingButton}
                  />
                ) : (
                  <Button
                    title={t('finish')}
                    onPress={finishDrawing}
                    variant="primary"
                    style={styles.drawingButton}
                    disabled={drawingType === 'polygon' ? currentPolygon.length < 3 : !currentCircle}
                  />
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Map */}
      {mapRegion && currentLocation && 
       currentLocation.latitude !== 0 && currentLocation.longitude !== 0 ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={mapRegion}
            region={mapRegion}
            onPress={handleMapPress}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
            scrollEnabled={!isMoveMarkerMode && selectedMarkerIndex === null && draggingPointIndex === null}
            zoomEnabled={!isMoveMarkerMode && selectedMarkerIndex === null && draggingPointIndex === null}
            pitchEnabled={false}
            rotateEnabled={false}
            onMapReady={() => {
              console.log('✅ Map is ready!');
              if (mapRegion) {
                console.log('📍 Map region:', mapRegion.latitude, mapRegion.longitude);
              }
              setMapReady(true);
              
              if (mapRegion && mapRef.current) {
                setTimeout(() => {
                  try {
                    mapRef.current?.animateToRegion(mapRegion, 500);
                  } catch (error) {
                    console.error('❌ Error animating map:', error);
                  }
                }, 300);
              }
              
              if (currentLocation) {
                loadHeatmap(currentLocation);
              }
            }}>
            {/* Heatmap circles */}
            {showPredictionPanel && heatmapData.map((point, index) => {
              const opacity = Math.max(0.5, Math.min(0.9, point.confidence));
              const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
              const fillColor = BOTTOM_TYPE_COLORS[point.bottomType] + opacityHex;
              
              return (
                <Circle
                  key={`circle-${index}`}
                  center={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  radius={300}
                  fillColor={fillColor}
                  strokeColor={BOTTOM_TYPE_COLORS[point.bottomType]}
                  strokeWidth={3}
                />
              );
            })}

            {/* Drawn areas - polygons and circles */}
            {drawnAreas.map((area) => {
              if (area.type === 'circle' && area.center) {
                return (
                  <Circle
                    key={area.id}
                    center={area.center}
                    radius={area.radius || 500}
                    fillColor={BOTTOM_TYPE_COLORS[area.bottomType] + '80'} // 50% opacity
                    strokeColor={BOTTOM_TYPE_COLORS[area.bottomType]}
                    strokeWidth={2}
                    tappable
                    onPress={() => {
                      // Enter edit mode directly without alert
                      setEditingArea(area);
                      setIsAreaInfoExpanded(false); // Start collapsed
                      setCurrentCircle({
                        center: area.center!,
                        radius: area.radius || 500,
                      });
                      setIsDrawingMode(true);
                      setDrawingType('circle');
                      setSelectedBottomType(area.bottomType);
                    }}
                  />
                );
              } else {
                // Get the exact color value to ensure consistency
                const strokeColor = BOTTOM_TYPE_COLORS[area.bottomType];
                
                return (
                  <Polygon
                    key={area.id}
                    coordinates={area.coordinates}
                    fillColor={BOTTOM_TYPE_COLORS[area.bottomType] + '80'} // 50% opacity
                    strokeColor={strokeColor}
                    strokeWidth={3}
                    lineCap="round"
                    lineJoin="round"
                    tappable
                    onPress={() => {
                      // Enter edit mode directly without alert
                      setEditingArea(area);
                      setIsAreaInfoExpanded(false); // Start collapsed
                      // Convert coordinates to points with IDs for editing
                      const pointsWithIds = area.coordinates.map((coord, idx) => ({
                        id: `point-${area.id}-${idx}-${Date.now()}`,
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                      }));
                      setCurrentPolygon(pointsWithIds);
                      setIsDrawingMode(true);
                      setDrawingType('polygon');
                      setSelectedBottomType(area.bottomType);
                    }}
                  />
                );
              }
            })}

            {/* Current polygon being drawn - use Polyline to show only consecutive connections, not closed */}
            {isDrawingMode && drawingType === 'polygon' && currentPolygon.length > 1 && (
              <Polyline
                coordinates={currentPolygon.map(p => ({latitude: p.latitude, longitude: p.longitude}))}
                strokeColor={BOTTOM_TYPE_COLORS[selectedBottomType]}
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
                tappable={false}
              />
            )}
            
            {/* Show closing line from last to first point when there are at least 3 points */}
            {isDrawingMode && drawingType === 'polygon' && currentPolygon.length >= 3 && !isMoveMarkerMode && (
              <Polyline
                coordinates={[
                  currentPolygon[currentPolygon.length - 1],
                  currentPolygon[0],
                ].map(p => ({latitude: p.latitude, longitude: p.longitude}))}
                strokeColor={BOTTOM_TYPE_COLORS[selectedBottomType]}
                strokeWidth={2}
                lineDashPattern={[5, 5]}
                lineCap="round"
                tappable={false}
              />
            )}

            {/* Current circle being drawn */}
            {isDrawingMode && drawingType === 'circle' && currentCircle && (
              <Circle
                center={currentCircle.center}
                radius={currentCircle.radius}
                fillColor={BOTTOM_TYPE_COLORS[selectedBottomType] + '40'} // 25% opacity
                strokeColor={BOTTOM_TYPE_COLORS[selectedBottomType]}
                strokeWidth={3}
              />
            )}

            {/* Current polygon points as markers - only show in polygon mode */}
            {(isDrawingMode || isMoveMarkerMode) && drawingType === 'polygon' && currentPolygon.map((point, index) => {
              // Use unique ID as key for stable rendering - this ensures React properly tracks markers
              const markerKey = point.id || `polygon-point-${index}`;
              const isSelected = selectedMarkerIndex === index;
              const isDragging = draggingPointIndex === index;
              const isLatestPoint = !isMoveMarkerMode && index === currentPolygon.length - 1; // Latest point when drawing
              
              // Color logic: dragging > selected > latest (when drawing) > normal
              let pinColor = primaryBlue; // Default blue
              if (isDragging || isSelected) {
                pinColor = "#FF6B00"; // Orange for dragging/selected
              } else if (isLatestPoint && isDrawingMode && !isMoveMarkerMode) {
                pinColor = "#00FF00"; // Green for latest point (indicates where next line starts)
              }
              
              return (
                <Marker
                  key={markerKey}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  pinColor={pinColor}
                  draggable={isMoveMarkerMode && isSelected}
                  tracksViewChanges={isDragging}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleMarkerPress(e, index);
                  }}
                  onDragStart={(e) => {
                    e.stopPropagation?.();
                    handleMarkerDragStart(e, index);
                  }}
                  onDrag={(e) => {
                    handleMarkerDrag(e, index);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation?.();
                    handleMarkerDragEnd(e, index);
                  }}
                />
              );
            })}

            {/* Circle center marker */}
            {isDrawingMode && drawingType === 'circle' && currentCircle && (
              <Marker
                coordinate={currentCircle.center}
                pinColor={selectedMarkerIndex === 0 ? "#FF6B00" : primaryBlue}
                draggable={isMoveMarkerMode}
                onPress={(e) => {
                  if (!isMoveMarkerMode && currentCircle) {
                    setIsMoveMarkerMode(true);
                  }
                  setSelectedMarkerIndex(0);
                }}
                onDragStart={(e) => {
                  setDraggingPointIndex(0);
                  setSelectedMarkerIndex(0);
                }}
                onDrag={(e) => {
                  if (currentCircle) {
                    setCurrentCircle({
                      ...currentCircle,
                      center: e.nativeEvent.coordinate,
                    });
                  }
                }}
                onDragEnd={(e) => {
                  if (currentCircle) {
                    setCurrentCircle({
                      ...currentCircle,
                      center: e.nativeEvent.coordinate,
                    });
                  }
                  setDraggingPointIndex(null);
                  setSelectedMarkerIndex(null);
                }}
              />
            )}

            {/* Current location marker */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title={prediction && showPredictionPanel
                  ? `${t('yourLocation')} - ${getBottomTypeName(prediction.bottomType, t)}`
                  : t('yourLocation')}
                description={prediction && showPredictionPanel
                  ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\n${t('confidence')}: ${Math.round(prediction.confidence * 100)}%`
                  : `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                pinColor="#FF0000"
              />
            )}
          </MapView>
        </View>
      ) : !currentLocation && loading ? (
        <View style={styles.mapFallback}>
          <ActivityIndicator size="large" color={primaryBlue} />
          <Text style={styles.fallbackText}>{t('loadingYourLocation')}</Text>
        </View>
      ) : (
        <View style={styles.mapFallback}>
          <Text style={styles.fallbackTitle}>{t('mapNotAvailable')}</Text>
          <Text style={styles.fallbackText}>
            {t('waitingForLocation')}
          </Text>
          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>{t('currentLocationLabel')}:</Text>
              <Text style={styles.locationText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={[
        styles.controls,
        {
          paddingBottom: insets.bottom + 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}>
        {!isDrawingMode ? (
          <>
            <View style={styles.controlsLeft}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setShowBottomTypePicker(true);
                }}
                activeOpacity={0.7}>
                <View style={[styles.iconButtonCircle, {backgroundColor: primaryBlue}]}>
                  <Ionicons name="pencil" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={loadCurrentLocation}
                activeOpacity={0.7}>
                <View style={[styles.iconButtonCircle, {backgroundColor: '#6C757D'}]}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
            {drawnAreas.length > 0 && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={clearAllMappings}
                activeOpacity={0.7}>
                <View style={[styles.iconButtonCircle, {backgroundColor: '#DC3545'}]}>
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )}
          </>
        ) : null}
      </View>

      {/* Bottom Type Picker Modal */}
      <Modal
        visible={showBottomTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBottomTypePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>{t('selectDrawingType')}</Text>
            <Text style={[styles.modalDescription, {color: colors.textSecondary}]}>
              {t('drawingTypeDescription')}
            </Text>
            <View style={styles.drawingTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.drawingTypeOption,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                  drawingType === 'polygon' && {
                    borderColor: primaryBlue,
                    backgroundColor: isDark ? 'rgba(30, 136, 229, 0.3)' : '#E3F2FD',
                  },
                ]}
                onPress={() => setDrawingType('polygon')}>
                <Ionicons 
                  name="create-outline" 
                  size={24} 
                  color={drawingType === 'polygon' ? primaryBlue : colors.textSecondary} 
                />
                <Text style={[
                  styles.drawingTypeOptionText,
                  {color: colors.text},
                  drawingType === 'polygon' && {
                    color: primaryBlue,
                    fontWeight: '600',
                  },
                ]}>
                  {t('polygon')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.drawingTypeOption,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                  drawingType === 'circle' && {
                    borderColor: primaryBlue,
                    backgroundColor: isDark ? 'rgba(30, 136, 229, 0.3)' : '#E3F2FD',
                  },
                ]}
                onPress={() => setDrawingType('circle')}>
                <Ionicons 
                  name="radio-button-on-outline" 
                  size={24} 
                  color={drawingType === 'circle' ? primaryBlue : colors.textSecondary} 
                />
                <Text style={[
                  styles.drawingTypeOptionText,
                  {color: colors.text},
                  drawingType === 'circle' && {
                    color: primaryBlue,
                    fontWeight: '600',
                  },
                ]}>
                  {t('circle')}
                </Text>
              </TouchableOpacity>
            </View>
            <PickerField
              label={t('bottomType')}
              value={selectedBottomType}
              options={bottomTypeOptions}
              onValueChange={(value) => {
                setSelectedBottomType(value as BottomType);
              }}
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('cancel')}
                onPress={() => setShowBottomTypePicker(false)}
                variant="secondary"
              />
              <Button
                title={t('startDrawing')}
                onPress={() => {
                  setShowBottomTypePicker(false);
                  startDrawing(drawingType);
                }}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={primaryBlue} />
          <Text style={styles.loadingText}>{t('loadingLocation')}</Text>
        </View>
      )}

      {/* Legend */}
      {showLegend && (
        <View style={[
          styles.legend,
          {
            bottom: insets.bottom + 100,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
          <Text style={[styles.legendTitle, {color: colors.text}]}>{t('bottomTypes')}</Text>
        <View style={styles.legendItems}>
          {Object.values(BottomType)
            .filter(type => type !== BottomType.UNKNOWN)
            .map(type => (
              <View key={type} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    {backgroundColor: BOTTOM_TYPE_COLORS[type]},
                  ]}
                />
                <Text style={[styles.legendLabel, {color: colors.text}]}>
                  {getBottomTypeName(type, t)}
                </Text>
              </View>
            ))}
        </View>
      </View>
      )}
      
      {/* Safe area background */}
      {insets.bottom > 0 && (
        <View style={[styles.safeAreaBackground, {height: insets.bottom, backgroundColor: '#f5f5f5'}]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  toggleContainer: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  predictionPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  predictionInfo: {
    flex: 1,
  },
  predictionType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictionConfidence: {
    fontSize: 14,
    marginBottom: 2,
  },
  predictionDetails: {
    fontSize: 12,
  },
  statsPanel: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
  },
  statsTitle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  drawingModePanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
  },
  moveMarkerModePanel: {
    backgroundColor: '#FF6B00',
  },
  drawingModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  areaInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  areaInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  areaInfoHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaInfoColorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  areaInfoHeaderText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  areaInfoContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  areaInfoLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  areaInfoValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  areaInfoActions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteAreaButton: {
    marginTop: 4,
  },
  drawingControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  drawingButton: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
  legend: {
    position: 'absolute',
    left: 16,
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    zIndex: 1000,
    borderWidth: 1,
    // bottom is set dynamically in component to account for safe area
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendLabel: {
    fontSize: 11,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'left',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  drawingTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  drawingTypeOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawingTypeOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  circleControls: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  circleControlLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  radiusControls: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  radiusButton: {
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
});
