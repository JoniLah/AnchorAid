import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnchorType, BottomType} from '../types';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorIconDetailed} from '../utils/anchorIcons';
import {BOTTOM_TYPE_INFO} from '../utils/bottomType';
import {Button} from '../components/Button';

export const AnchorGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorType | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<BottomType | null>(null);

  const getSuitabilityForBottom = (anchorType: AnchorType, bottomType: BottomType): string => {
    const recommended = getRecommendedAnchorsForBottom(bottomType);
    if (recommended.includes(anchorType)) {
      return 'Excellent';
    }
    // Check if it's a reasonable alternative
    const info = getAnchorTypeInfo(anchorType);
    if (info.category === 'fluke' && (bottomType === BottomType.SAND || bottomType === BottomType.MUD)) {
      return 'Good';
    }
    if (info.category === 'plow' && (bottomType === BottomType.MUD || bottomType === BottomType.CLAY)) {
      return 'Good';
    }
    if (info.category === 'claw' && bottomType === BottomType.ROCK) {
      return 'Good';
    }
    return 'Fair';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={styles.section}>
        <Text style={styles.title}>Anchor Type Guide</Text>
        <Text style={styles.subtitle}>
          Learn about different anchor types and their best uses
        </Text>
      </View>

      {/* Quick Reference by Bottom Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Reference by Bottom Type</Text>
        <Text style={styles.sectionDescription}>
          Tap a bottom type to see recommended anchors
        </Text>
        
        <View style={styles.bottomTypeGrid}>
          {Object.values(BottomType).map(bottom => (
            <TouchableOpacity
              key={bottom}
              style={[
                styles.bottomTypeCard,
                selectedBottom === bottom && styles.bottomTypeCardSelected,
              ]}
              onPress={() => setSelectedBottom(selectedBottom === bottom ? null : bottom)}>
              <Text style={styles.bottomTypeName}>
                {BOTTOM_TYPE_INFO[bottom].name}
              </Text>
              <Text style={styles.bottomTypeSuitability}>
                {BOTTOM_TYPE_INFO[bottom].suitability}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedBottom && (
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>
              Best Anchors for {BOTTOM_TYPE_INFO[selectedBottom].name}
            </Text>
            <View style={styles.recommendedAnchorsList}>
              {getRecommendedAnchorsForBottom(selectedBottom).map((anchorType, index) => {
                const info = getAnchorTypeInfo(anchorType);
                return (
                  <View key={anchorType} style={styles.recommendedAnchorItem}>
                    <Text style={styles.recommendedAnchorIcon}>
                      {getAnchorIconDetailed(anchorType)}
                    </Text>
                    <View style={styles.recommendedAnchorInfo}>
                      <Text style={styles.recommendedAnchorName}>{info.name}</Text>
                      <Text style={styles.recommendedAnchorDesc}>{info.description}</Text>
                    </View>
                    <Text style={styles.recommendedRank}>#{index + 1}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.bottomTypeNotes}>
              {BOTTOM_TYPE_INFO[selectedBottom].notes}
            </Text>
          </View>
        )}
      </View>

      {/* Anchor Types by Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anchor Types by Category</Text>
        
        {['fluke', 'plow', 'claw', 'modern', 'traditional', 'other'].map(category => {
          const anchorsInCategory = Object.values(AnchorType).filter(
            type => getAnchorTypeInfo(type).category === category,
          );
          
          if (anchorsInCategory.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} Anchors
              </Text>
              <View style={styles.anchorList}>
                {anchorsInCategory.map(anchorType => {
                  const info = getAnchorTypeInfo(anchorType);
                  const isSelected = selectedAnchor === anchorType;
                  
                  return (
                    <TouchableOpacity
                      key={anchorType}
                      style={[
                        styles.anchorCard,
                        isSelected && styles.anchorCardSelected,
                      ]}
                      onPress={() => setSelectedAnchor(isSelected ? null : anchorType)}>
                      <View style={styles.anchorCardHeader}>
                        <Text style={styles.anchorIcon}>
                          {getAnchorIconDetailed(anchorType)}
                        </Text>
                        <View style={styles.anchorCardTitle}>
                          <Text style={styles.anchorName}>{info.name}</Text>
                          <Text style={styles.anchorCategory}>{info.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.anchorDescription}>{info.description}</Text>
                      
                      {isSelected && info.detailedInfo && (
                        <View style={styles.anchorDetails}>
                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Price Range:</Text>
                            <Text style={styles.priceRange}>
                              {info.detailedInfo.priceRange === 'budget' && '💰 Budget - Affordable'}
                              {info.detailedInfo.priceRange === 'moderate' && '💵 Moderate - Mid-range pricing'}
                              {info.detailedInfo.priceRange === 'premium' && '💎 Premium - Higher cost, excellent performance'}
                              {info.detailedInfo.priceRange === 'very-premium' && '👑 Very Premium - Expensive, commercial grade'}
                            </Text>
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Best For:</Text>
                            {info.detailedInfo.bestFor.map((use, idx) => (
                              <Text key={idx} style={styles.bestForItem}>• {use}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Pros:</Text>
                            {info.detailedInfo.pros.map((pro, idx) => (
                              <Text key={idx} style={styles.proItem}>✓ {pro}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Cons:</Text>
                            {info.detailedInfo.cons.map((con, idx) => (
                              <Text key={idx} style={styles.conItem}>✗ {con}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Characteristics:</Text>
                            <Text style={styles.characteristicItem}>
                              Weight: {info.detailedInfo.weight}
                            </Text>
                            <Text style={styles.characteristicItem}>
                              Setting: {info.detailedInfo.setting}
                            </Text>
                            <Text style={styles.characteristicItem}>
                              Holding: {info.detailedInfo.holding}
                            </Text>
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={styles.detailsTitle}>Suitability by Bottom Type:</Text>
                            <View style={styles.suitabilityGrid}>
                              {Object.values(BottomType)
                                .filter(bt => bt !== BottomType.UNKNOWN)
                                .map(bottomType => {
                                  const suitability = getSuitabilityForBottom(anchorType, bottomType);
                                  return (
                                    <View key={bottomType} style={styles.suitabilityItem}>
                                      <Text style={styles.suitabilityBottom}>
                                        {BOTTOM_TYPE_INFO[bottomType].name}:
                                      </Text>
                                      <Text
                                        style={[
                                          styles.suitabilityRating,
                                          suitability === 'Excellent' && styles.suitabilityExcellent,
                                          suitability === 'Good' && styles.suitabilityGood,
                                          suitability === 'Fair' && styles.suitabilityFair,
                                        ]}>
                                        {suitability}
                                      </Text>
                                    </View>
                                  );
                                })}
                            </View>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* General Anchoring Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Anchoring Tips</Text>
        
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>1. Scope Ratio</Text>
          <Text style={styles.tipText}>
            Use appropriate scope (rode length to depth ratio):
            • Calm conditions: 3:1 minimum
            • Normal conditions: 5:1 recommended
            • Windy conditions: 7:1 or more
            • Storm conditions: 10:1 or more
          </Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>2. Setting the Anchor</Text>
          <Text style={styles.tipText}>
            • Lower anchor slowly, don't drop it
            • Back down gently to set the anchor
            • Use reverse power to test the set
            • Watch for anchor drag during setting
            • Mark your position and monitor
          </Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>3. Bottom Type Considerations</Text>
          <Text style={styles.tipText}>
            • Sand: Excellent holding, most anchors work well
            • Mud: Good holding, may need more scope
            • Clay: Good holding once set, harder to set initially
            • Grass/Weeds: Variable, anchor may not penetrate
            • Rock: Poor holding, risk of fouling
            • Coral: Poor holding, risk of damage to anchor and reef
          </Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>4. Anchor Selection</Text>
          <Text style={styles.tipText}>
            • Choose anchor based on your primary cruising grounds
            • Consider carrying a secondary anchor for different conditions
            • Modern anchors (Rocna, Mantus) offer excellent all-around performance
            • Fluke anchors (Danforth, Fortress) excel in sand and mud
            • Claw anchors (Bruce) work well in rocky bottoms
          </Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>5. Safety</Text>
          <Text style={styles.tipText}>
            • Always maintain proper watch
            • Use anchor alarm to monitor position
            • Check weather forecasts before anchoring
            • Have an escape plan if conditions deteriorate
            • Never rely solely on technology - use your judgment
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  bottomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bottomTypeCard: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  bottomTypeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  bottomTypeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bottomTypeSuitability: {
    fontSize: 10,
    color: '#666',
  },
  recommendationBox: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 12,
  },
  recommendedAnchorsList: {
    marginBottom: 12,
  },
  recommendedAnchorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  recommendedAnchorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recommendedAnchorInfo: {
    flex: 1,
  },
  recommendedAnchorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendedAnchorDesc: {
    fontSize: 12,
    color: '#666',
  },
  recommendedRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  bottomTypeNotes: {
    fontSize: 12,
    color: '#004085',
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#b3d9ff',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  anchorList: {
    gap: 12,
  },
  anchorCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  anchorCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  anchorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anchorIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  anchorCardTitle: {
    flex: 1,
  },
  anchorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  anchorCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  anchorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  anchorDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suitabilityGrid: {
    gap: 8,
  },
  suitabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  suitabilityBottom: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  suitabilityRating: {
    fontSize: 13,
    fontWeight: '600',
  },
  suitabilityExcellent: {
    color: '#28a745',
  },
  suitabilityGood: {
    color: '#007AFF',
  },
  suitabilityFair: {
    color: '#ffc107',
  },
  detailSection: {
    marginBottom: 16,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  bestForItem: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  proItem: {
    fontSize: 13,
    color: '#28a745',
    marginTop: 4,
    lineHeight: 20,
  },
  conItem: {
    fontSize: 13,
    color: '#dc3545',
    marginTop: 4,
    lineHeight: 20,
  },
  characteristicItem: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  tipBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

