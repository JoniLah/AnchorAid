import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnchorType, BottomType} from '../types';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorDescription} from '../utils/anchorDescription';
import {BOTTOM_TYPE_INFO, getBottomTypeName, getSuitabilityRating} from '../utils/bottomType';
import {Button} from '../components/Button';
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

/**
 * Get the image source for an anchor type
 */
const getAnchorImageSource = (type: AnchorType) => {
  const imageMap: Record<AnchorType, any> = {
    [AnchorType.DANFORTH]: require('../../assets/graphics/danforth.png'),
    [AnchorType.BRUCE]: require('../../assets/graphics/bruce.png'),
    [AnchorType.PLOW]: require('../../assets/graphics/plow.png'),
    [AnchorType.DELTA]: require('../../assets/graphics/delta.png'),
    [AnchorType.ROCNA]: require('../../assets/graphics/rocna.png'),
    [AnchorType.MANTUS]: require('../../assets/graphics/mantus.png'),
    [AnchorType.FORTRESS]: require('../../assets/graphics/fortress.png'),
    [AnchorType.AC14]: require('../../assets/graphics/ac14.png'),
    [AnchorType.SPADE]: require('../../assets/graphics/spade.png'),
    [AnchorType.COBRA]: require('../../assets/graphics/cobra.png'),
    [AnchorType.HERRESHOFF]: require('../../assets/graphics/herreshoff.png'),
    [AnchorType.NORTHILL]: require('../../assets/graphics/admiralty.png'),
    [AnchorType.ULTRA]: require('../../assets/graphics/ultra.png'),
    [AnchorType.EXCEL]: require('../../assets/graphics/excel.png'),
    [AnchorType.VULCAN]: require('../../assets/graphics/vulcan.png'),
    [AnchorType.SUPREME]: require('../../assets/graphics/supreme.png'),
    [AnchorType.STOCKLESS]: require('../../assets/graphics/stockless.png'),
    [AnchorType.NAVY_STOCKLESS]: require('../../assets/graphics/navy-stockless.png'),
    [AnchorType.KEDGE]: require('../../assets/graphics/basic-anchor.png'),
    [AnchorType.GRAPNEL]: require('../../assets/graphics/grapnel.png'),
    [AnchorType.MUSHROOM]: require('../../assets/graphics/mushroom.png'),
    [AnchorType.OTHER]: require('../../assets/graphics/other.png'),
  };
  return imageMap[type] || require('../../assets/graphics/other.png');
};

export const AnchorGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorType | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<BottomType | null>(null);

  const getSuitabilityForBottom = (anchorType: AnchorType, bottomType: BottomType): string => {
    const recommended = getRecommendedAnchorsForBottom(bottomType);
    if (recommended.includes(anchorType)) {
      return t('excellent');
    }
    // Check if it's a reasonable alternative
    const info = getAnchorTypeInfo(anchorType);
    if (info.category === 'fluke' && (bottomType === BottomType.SAND || bottomType === BottomType.MUD)) {
      return t('good');
    }
    if (info.category === 'plow' && (bottomType === BottomType.MUD || bottomType === BottomType.CLAY)) {
      return t('good');
    }
    if (info.category === 'claw' && bottomType === BottomType.ROCK) {
      return t('good');
    }
    return t('fair');
  };

  const getCategoryName = (category: string): string => {
    try {
      switch (category) {
        case 'fluke':
          return t('categoryFluke');
        case 'plow':
          return t('categoryPlow');
        case 'claw':
          return t('categoryClaw');
        case 'modern':
          return t('categoryModern');
        case 'traditional':
          return t('categoryTraditional');
        case 'other':
          return t('categoryOther');
        default:
          return category;
      }
    } catch (error) {
      console.error('Error translating category:', error);
      return category;
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.title, {color: colors.text}]}>{t('anchorTypeGuide')}</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('learnAboutAnchors')}
        </Text>
      </View>

      {/* Quick Reference by Bottom Type */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('quickReferenceByBottom')}</Text>
        <Text style={[styles.sectionDescription, {color: colors.textSecondary}]}>
          {t('tapBottomTypeToSee')}
        </Text>
        
        <View style={styles.bottomTypeGrid}>
          {Object.values(BottomType).map(bottom => (
            <TouchableOpacity
              key={bottom}
              style={[
                styles.bottomTypeCard,
                {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border},
                selectedBottom === bottom && {borderColor: colors.primary, backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'},
              ]}
              onPress={() => setSelectedBottom(selectedBottom === bottom ? null : bottom)}>
              <Text style={[styles.bottomTypeName, {color: colors.text}]}>
                {getBottomTypeName(bottom, t)}
              </Text>
              <Text style={[styles.bottomTypeSuitability, {color: colors.textSecondary}]}>
                {getSuitabilityRating(BOTTOM_TYPE_INFO[bottom].suitability, t)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedBottom && (
          <View style={[styles.recommendationBox, {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'}]}>
            <Text style={[styles.recommendationTitle, {color: effectiveTheme === 'dark' ? '#0A84FF' : '#004085'}]}>
              {t('bestAnchorsFor')} {getBottomTypeName(selectedBottom)}
            </Text>
            <View style={styles.recommendedAnchorsList}>
              {getRecommendedAnchorsForBottom(selectedBottom).map((anchorType, index) => {
                const info = getAnchorTypeInfo(anchorType);
                return (
                  <View key={anchorType} style={[styles.recommendedAnchorItem, {backgroundColor: colors.surface}]}>
                    <Image
                      source={getAnchorImageSource(anchorType)}
                      style={styles.recommendedAnchorImage}
                      resizeMode="contain"
                    />
                    <View style={styles.recommendedAnchorInfo}>
                      <Text style={[styles.recommendedAnchorName, {color: colors.text}]}>{info.name}</Text>
                      <Text style={[styles.recommendedAnchorDesc, {color: colors.textSecondary}]}>{getAnchorDescription(anchorType, t)}</Text>
                    </View>
                    <Text style={[styles.recommendedRank, {color: colors.primary}]}>#{index + 1}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.bottomTypeNotes, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085', borderTopColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.3)' : '#b3d9ff'}]}>
              {BOTTOM_TYPE_INFO[selectedBottom].notes}
            </Text>
          </View>
        )}
      </View>

      {/* Anchor Types by Category */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('anchorTypesByCategory')}</Text>
        
        {['fluke', 'plow', 'claw', 'modern', 'traditional', 'other'].map(category => {
          const anchorsInCategory = Object.values(AnchorType).filter(
            type => getAnchorTypeInfo(type).category === category,
          );
          
          if (anchorsInCategory.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, {color: colors.text}]}>
                {category === 'fluke' ? t('flukeAnchors') :
                 category === 'plow' ? t('plowAnchors') :
                 category === 'claw' ? t('clawAnchors') :
                 category === 'modern' ? t('modernAnchors') :
                 category === 'traditional' ? t('traditionalAnchors') :
                 t('otherAnchors')}
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
                        {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border},
                        isSelected && {borderColor: colors.primary, backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'},
                      ]}
                      onPress={() => setSelectedAnchor(isSelected ? null : anchorType)}>
                      <View style={styles.anchorCardHeader}>
                        <Image
                          source={getAnchorImageSource(anchorType)}
                          style={styles.anchorImage}
                          resizeMode="contain"
                        />
                        <View style={styles.anchorCardTitle}>
                          <Text style={[styles.anchorName, {color: colors.text}]}>{info.name}</Text>
                          <Text style={[styles.anchorCategory, {color: colors.textSecondary}]}>{getCategoryName(info.category)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.anchorDescription, {color: colors.textSecondary}]}>{getAnchorDescription(anchorType, t)}</Text>
                      
                      {isSelected && info.detailedInfo && (
                        <View style={[styles.anchorDetails, {borderTopColor: colors.border}]}>
                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('priceRange')}</Text>
                            <Text style={[styles.priceRange, {color: colors.primary}]}>
                              {info.detailedInfo.priceRange === 'budget' && t('budgetAffordable')}
                              {info.detailedInfo.priceRange === 'moderate' && t('moderateMidRange')}
                              {info.detailedInfo.priceRange === 'premium' && t('premiumHigherCost')}
                              {info.detailedInfo.priceRange === 'very-premium' && t('veryPremiumExpensive')}
                            </Text>
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('bestFor')}</Text>
                            {info.detailedInfo.bestFor.map((use, idx) => (
                              <Text key={idx} style={[styles.bestForItem, {color: colors.text}]}>• {use}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('pros')}</Text>
                            {info.detailedInfo.pros.map((pro, idx) => (
                              <Text key={idx} style={[styles.proItem, {color: colors.success}]}>✓ {pro}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('cons')}</Text>
                            {info.detailedInfo.cons.map((con, idx) => (
                              <Text key={idx} style={[styles.conItem, {color: colors.error}]}>✗ {con}</Text>
                            ))}
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('characteristics')}</Text>
                            <Text style={[styles.characteristicItem, {color: colors.textSecondary}]}>
                              {t('weight')} {info.detailedInfo.weight}
                            </Text>
                            <Text style={[styles.characteristicItem, {color: colors.textSecondary}]}>
                              {t('setting')} {info.detailedInfo.setting}
                            </Text>
                            <Text style={[styles.characteristicItem, {color: colors.textSecondary}]}>
                              {t('holding')} {info.detailedInfo.holding}
                            </Text>
                          </View>

                          <View style={styles.detailSection}>
                            <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('suitabilityByBottomType')}</Text>
                            <View style={styles.suitabilityGrid}>
                              {Object.values(BottomType)
                                .filter(bt => bt !== BottomType.UNKNOWN)
                                .map(bottomType => {
                                  const suitability = getSuitabilityForBottom(anchorType, bottomType);
                                  return (
                                    <View key={bottomType} style={styles.suitabilityItem}>
                                      <Text style={[styles.suitabilityBottom, {color: colors.textSecondary}]}>
                                        {getBottomTypeName(bottomType)}:
                                      </Text>
                                      <Text
                                        style={[
                                          styles.suitabilityRating,
                                          suitability === t('excellent') && {color: colors.success},
                                          suitability === t('good') && {color: colors.primary},
                                          suitability === t('fair') && {color: colors.warning},
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
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('generalAnchoringTips')}</Text>
        
        <View style={[styles.tipBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.tipTitle, {color: colors.text}]}>1. {t('scopeRatioTip')}</Text>
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            {t('scopeRatioTipText')}
          </Text>
        </View>

        <View style={[styles.tipBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.tipTitle, {color: colors.text}]}>2. {t('settingTheAnchor')}</Text>
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            {t('settingTheAnchorText')}
          </Text>
        </View>

        <View style={[styles.tipBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.tipTitle, {color: colors.text}]}>3. {t('bottomTypeConsiderations')}</Text>
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            {t('bottomTypeConsiderationsText')}
          </Text>
        </View>

        <View style={[styles.tipBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.tipTitle, {color: colors.text}]}>4. {t('anchorSelection')}</Text>
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            {t('anchorSelectionText')}
          </Text>
        </View>

        <View style={[styles.tipBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.tipTitle, {color: colors.text}]}>5. {t('safetyTips')}</Text>
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            {t('safetyTipsText')}
          </Text>
        </View>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('howToAnchorStepByStep')}
          onPress={() => (navigation as any).navigate('AnchoringTechnique')}
          fullWidth
        />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('back')}
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
    
    {/* Safe area background to prevent content showing through */}
    {insets.bottom > 0 && (
      <View style={[styles.safeAreaBackground, {height: insets.bottom, backgroundColor: colors.background}]} />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
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
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  bottomTypeName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  bottomTypeSuitability: {
    fontSize: 10,
  },
  recommendationBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendedAnchorsList: {
    marginBottom: 12,
  },
  recommendedAnchorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  recommendedAnchorImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  recommendedAnchorInfo: {
    flex: 1,
  },
  recommendedAnchorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedAnchorDesc: {
    fontSize: 12,
  },
  recommendedRank: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomTypeNotes: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  anchorList: {
    gap: 12,
  },
  anchorCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  anchorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anchorImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  anchorCardTitle: {
    flex: 1,
  },
  anchorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  anchorCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  anchorDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  anchorDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    flex: 1,
  },
  suitabilityRating: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 16,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  bestForItem: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
  },
  proItem: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
  },
  conItem: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
  },
  characteristicItem: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
  },
  tipBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

