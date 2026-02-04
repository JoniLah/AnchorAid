import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Location} from '../types';
import {haversineDistance, calculateBearing} from '../utils/haversine';
import {formatLength, convertLength} from '../utils/units';
import {UnitSystem} from '../types';
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

interface SwingCircleViewProps {
  anchorPoint?: Location;
  currentPosition?: Location;
  swingRadius: number;
  unitSystem: UnitSystem;
}

export const SwingCircleView: React.FC<SwingCircleViewProps> = ({
  anchorPoint,
  currentPosition,
  swingRadius,
  unitSystem,
}) => {
  const {colors, effectiveTheme} = useTheme();
  const isDark = effectiveTheme === 'dark';
  const [showInnerCircles, setShowInnerCircles] = useState(true);

  if (!anchorPoint) {
    return (
      <View style={[styles.container, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <View style={[styles.placeholder, {backgroundColor: isDark ? '#2C2C2C' : '#f5f5f5'}]}>
          <Text style={[styles.placeholderText, {color: colors.textSecondary}]}>
            Set anchor point to see swing circle
          </Text>
        </View>
      </View>
    );
  }

  const position = currentPosition || anchorPoint;
  const distance = haversineDistance(anchorPoint, position);
  const bearing = calculateBearing(anchorPoint, position);
  const isWithinRadius = distance <= swingRadius;

  // Calculate relative position (simplified visualization)
  const maxDisplayRadius = 100; // pixels
  // Scale so that swingRadius fits exactly in maxDisplayRadius
  const scale = maxDisplayRadius / swingRadius;
  const angle = (bearing * Math.PI) / 180;
  const displayDistance = Math.min(distance * scale, maxDisplayRadius);
  const x = Math.sin(angle) * displayDistance;
  const y = -Math.cos(angle) * displayDistance;

  // Generate inner circles every 5m (or appropriate unit interval)
  // Convert swingRadius to meters for calculation
  const swingRadiusM = unitSystem === UnitSystem.METRIC 
    ? swingRadius 
    : convertLength(swingRadius, UnitSystem.IMPERIAL, UnitSystem.METRIC);
  
  // Determine interval based on unit system (5m or ~16ft)
  const intervalM = 5; // Always use 5m intervals
  const innerCircles: number[] = [];
  for (let i = intervalM; i < swingRadiusM; i += intervalM) {
    innerCircles.push(i);
  }

  // Convert back to display units for labels
  const getDisplayRadius = (radiusM: number): number => {
    return unitSystem === UnitSystem.METRIC 
      ? radiusM 
      : convertLength(radiusM, UnitSystem.METRIC, UnitSystem.IMPERIAL);
  };


  return (
    <View style={[styles.container, {backgroundColor: colors.surface, borderColor: colors.border}]}>
      <View style={styles.headerRow}>
        <View style={styles.placeholder} />
        <TouchableOpacity
          style={[styles.toggleButton, {backgroundColor: colors.primary + '20', borderColor: colors.primary}]}
          onPress={() => setShowInnerCircles(!showInnerCircles)}
          activeOpacity={0.7}>
          <Text style={[styles.toggleButtonIcon, {color: colors.primary}]}>
            {showInnerCircles ? '◉' : '○'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.visualizationContainer}>
        <View style={styles.circleContainer}>
          {/* Inner circles */}
          {showInnerCircles && innerCircles.map((radiusM, index) => {
            const displayRadius = getDisplayRadius(radiusM);
            const circleRadius = radiusM * scale;
            const unit = unitSystem === UnitSystem.METRIC ? 'm' : 'ft';
            // Only render if circle is large enough to be visible (at least 2px radius)
            if (circleRadius < 2) return null;
            
            return (
              <View
                key={`inner-${index}`}
                style={[
                  styles.innerCircle,
                  {
                    width: circleRadius * 2,
                    height: circleRadius * 2,
                    borderRadius: circleRadius,
                    borderColor: isDark ? colors.border : '#999',
                    borderWidth: 1,
                    left: maxDisplayRadius - circleRadius,
                    top: maxDisplayRadius - circleRadius,
                  },
                ]}>
                {/* Label at top of circle */}
                {circleRadius > 10 && (
                  <View
                    style={[
                      styles.circleLabel,
                      {
                        top: -14,
                        left: circleRadius - 20,
                      },
                    ]}>
                    <Text style={[styles.circleLabelText, {color: colors.textSecondary, fontSize: 9}]}>
                      {displayRadius.toFixed(0)}{unit}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          
          {/* Swing radius circle (outermost) */}
          <View style={[styles.circle, {width: maxDisplayRadius * 2, height: maxDisplayRadius * 2, borderColor: colors.primary}]}>
            {/* Label for outer circle */}
            <View
              style={[
                styles.circleLabel,
                {
                  top: -12,
                  left: maxDisplayRadius - 20,
                },
              ]}>
              <Text style={[styles.circleLabelText, {color: colors.primary, fontWeight: '600'}]}>
                {formatLength(swingRadius, unitSystem, 0)}
              </Text>
            </View>
          </View>
          
          {/* Anchor point (center) */}
          <View style={[styles.anchorPoint, {left: maxDisplayRadius - 15, top: maxDisplayRadius - 15, backgroundColor: colors.error, borderColor: colors.surface}]}>
            <Text style={styles.anchorLabel}>A</Text>
          </View>
          
          {/* Current position */}
          {currentPosition && (
            <View
              style={[
                styles.currentPosition,
                {
                  left: maxDisplayRadius + x - 15,
                  top: maxDisplayRadius + y - 15,
                  backgroundColor: isWithinRadius ? colors.success : colors.error,
                  borderColor: colors.surface,
                },
              ]}>
              <Text style={styles.positionLabel}>B</Text>
            </View>
          )}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: colors.error}]} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>{t('anchorPoint')}</Text>
          </View>
          {currentPosition && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: isWithinRadius ? colors.success : colors.error}]} />
              <Text style={[styles.legendText, {color: colors.textSecondary}]}>{t('currentPosition')}</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.primary}]} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>{t('swingRadius')}</Text>
          </View>
        </View>
      </View>

      {/* Info overlay */}
      <View style={[styles.infoOverlay, {backgroundColor: isDark ? '#2C2C2C' : '#f9f9f9'}]}>
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('distanceFromAnchor')}:</Text>
          <Text style={[styles.infoValue, {color: colors.text}, !isWithinRadius && {color: colors.error}]}>
            {formatLength(distance, unitSystem)}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('swingRadius')}:</Text>
          <Text style={[styles.infoValue, {color: colors.text}]}>
            {formatLength(swingRadius, unitSystem)}
          </Text>
        </View>
        {currentPosition && (
          <>
            <View style={styles.infoBox}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('bearing')}:</Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>{bearing.toFixed(0)}°</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('status')}:</Text>
              <Text style={[styles.infoValue, {color: isWithinRadius ? colors.success : colors.error}]}>
                {isWithinRadius ? `${t('withinRadius')} ✓` : `${t('outsideRadius')} ⚠`}
              </Text>
            </View>
          </>
        )}
        {!currentPosition && (
          <Text style={[styles.hint, {color: colors.textTertiary}]}>
            Waiting for GPS position...
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
  },
  visualizationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circleContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  innerCircle: {
    position: 'absolute',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLabel: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  circleLabelText: {
    fontSize: 10,
    fontWeight: '500',
  },
  anchorPoint: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 10,
  },
  anchorLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentPosition: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 10,
  },
  positionLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  infoOverlay: {
    borderRadius: 8,
    padding: 12,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
