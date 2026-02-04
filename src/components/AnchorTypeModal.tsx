import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnchorType, BottomType} from '../types';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  isAnchorRecommendedForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorDescription} from '../utils/anchorDescription';
import {getBottomTypeName} from '../utils/bottomType';
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

interface AnchorTypeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedType?: AnchorType;
  onSelect: (type: AnchorType) => void;
  bottomType?: BottomType;
}

/**
 * Get the image source for an anchor type
 */
const getAnchorImageSource = (type: AnchorType) => {
  // Map anchor types to image file names
  // Some enum values use underscores, but image files use hyphens
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
    [AnchorType.NORTHILL]: require('../../assets/graphics/admiralty.png'), // Using admiralty as fallback
    [AnchorType.ULTRA]: require('../../assets/graphics/ultra.png'),
    [AnchorType.EXCEL]: require('../../assets/graphics/excel.png'),
    [AnchorType.VULCAN]: require('../../assets/graphics/vulcan.png'),
    [AnchorType.SUPREME]: require('../../assets/graphics/supreme.png'),
    [AnchorType.STOCKLESS]: require('../../assets/graphics/stockless.png'),
    [AnchorType.NAVY_STOCKLESS]: require('../../assets/graphics/navy-stockless.png'),
    [AnchorType.KEDGE]: require('../../assets/graphics/basic-anchor.png'), // Using basic-anchor as fallback
    [AnchorType.GRAPNEL]: require('../../assets/graphics/grapnel.png'),
    [AnchorType.MUSHROOM]: require('../../assets/graphics/mushroom.png'),
    [AnchorType.OTHER]: require('../../assets/graphics/other.png'),
  };

  return imageMap[type] || require('../../assets/graphics/other.png');
};

export const AnchorTypeModal: React.FC<AnchorTypeModalProps> = ({
  visible,
  onClose,
  selectedType,
  onSelect,
  bottomType,
}) => {
  const {colors, effectiveTheme} = useTheme();
  const insets = useSafeAreaInsets();
  const [infoAnchorType, setInfoAnchorType] = useState<AnchorType | null>(null);

  const isDark = effectiveTheme === 'dark';
  const closeButtonBg = isDark ? '#1C1C1E' : '#e0e0e0';

  const handleSelect = (type: AnchorType) => {
    onSelect(type);
    onClose();
  };

  const openInfo = (type: AnchorType) => {
    setInfoAnchorType(type);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, {backgroundColor: colors.surface}]}>
            <View style={[styles.header, {borderBottomColor: colors.border}]}>
              <Text style={[styles.title, {color: colors.text}]}>{t('selectAnchorType')}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, {backgroundColor: closeButtonBg}]}
                activeOpacity={0.8}>
                <Text style={[styles.closeButtonText, {color: colors.text}]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={{paddingBottom: insets.bottom + 20}}>
              {bottomType && bottomType !== BottomType.UNKNOWN && (
                <View style={[styles.recommendationBox, {backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'}]}>
                  <Text style={[styles.recommendationTitle, {color: isDark ? '#0A84FF' : '#004085'}]}>
                    Recommended for {getBottomTypeName(bottomType, t)}:
                  </Text>
                  <Text style={[styles.recommendationText, {color: isDark ? '#B0B0B0' : '#004085'}]}>
                    {getRecommendedAnchorsForBottom(bottomType)
                      .slice(0, 4)
                      .map(type => ANCHOR_TYPE_INFO[type].name)
                      .join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.anchorGrid}>
                {Object.values(AnchorType).map(type => {
                  const info = getAnchorTypeInfo(type);
                  const isRecommended =
                    bottomType &&
                    bottomType !== BottomType.UNKNOWN &&
                    isAnchorRecommendedForBottom(type, bottomType);
                  const isSelected = selectedType === type;

                  return (
                    <View key={type} style={styles.anchorCardWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.anchorCard,
                          {backgroundColor: isDark ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border},
                          isSelected && {borderColor: colors.primary, backgroundColor: colors.primary},
                          isRecommended && !isSelected && {borderColor: colors.primary, backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'},
                        ]}
                        onPress={() => handleSelect(type)}
                        activeOpacity={0.8}>
                        <View style={styles.anchorIconContainer}>
                          <Image
                            source={getAnchorImageSource(type)}
                            style={styles.anchorImage}
                            resizeMode="contain"
                          />
                        </View>
                        <Text
                          style={[
                            styles.anchorName,
                            {color: colors.text},
                            isSelected && {color: '#fff'},
                          ]}>
                          {info.name}
                        </Text>
                        {isRecommended && (
                          <Text style={[styles.recommendedBadge, {color: colors.primary}]}>✓ {t('recommended')}</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.anchorInfoButton, {backgroundColor: isDark ? '#3a3a3c' : 'rgba(0,0,0,0.08)'}]}
                        onPress={() => openInfo(type)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Text style={[styles.anchorInfoButtonText, {color: colors.textSecondary}]}>ℹ️</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {selectedType && (
                <View style={[styles.detailsBox, {backgroundColor: isDark ? '#2C2C2C' : '#f0f0f0'}]}>
                  <Text style={[styles.detailsTitle, {color: colors.text}]}>
                    {getAnchorTypeInfo(selectedType).name}
                  </Text>
                  <Text style={[styles.detailsText, {color: colors.textSecondary}]}>
                    {getAnchorDescription(selectedType, t)}
                  </Text>
                  <Text style={[styles.detailsCategory, {color: colors.textTertiary}]}>
                    {t('categoryLabel')}: {getAnchorTypeInfo(selectedType).category}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Anchor info modal: bigger image + explanation */}
      <Modal
        visible={infoAnchorType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoAnchorType(null)}>
        <TouchableOpacity
          style={styles.infoOverlay}
          activeOpacity={1}
          onPress={() => setInfoAnchorType(null)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[styles.infoModalCard, {backgroundColor: colors.surface}]}>
            {infoAnchorType !== null && (
              <>
                <View style={[styles.infoModalHeader, {borderBottomColor: colors.border}]}>
                  <Text style={[styles.infoModalTitle, {color: colors.text}]}>
                    {getAnchorTypeInfo(infoAnchorType).name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setInfoAnchorType(null)}
                    style={[styles.infoCloseButton, {backgroundColor: closeButtonBg}]}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={[styles.closeButtonText, {color: colors.text}]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.infoModalScroll} contentContainerStyle={styles.infoModalContent}>
                  <Image
                    source={getAnchorImageSource(infoAnchorType)}
                    style={styles.infoModalImage}
                    resizeMode="contain"
                  />
                  <Text style={[styles.infoModalDescription, {color: colors.textSecondary}]}>
                    {getAnchorDescription(infoAnchorType, t)}
                  </Text>
                  <Text style={[styles.infoModalCategory, {color: colors.textTertiary}]}>
                    {t('categoryLabel')}: {getAnchorTypeInfo(infoAnchorType).category}
                  </Text>
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  recommendationBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
  },
  anchorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  anchorCardWrapper: {
    width: '30%',
    position: 'relative',
  },
  anchorCard: {
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    width: '100%',
  },
  anchorInfoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  anchorInfoButtonText: {
    fontSize: 14,
  },
  anchorIconContainer: {
    marginBottom: 8,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorImage: {
    width: 40,
    height: 40,
  },
  anchorName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  recommendedBadge: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
  },
  detailsBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsCategory: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  infoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoModalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  infoCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalScroll: {
    maxHeight: 400,
  },
  infoModalContent: {
    padding: 20,
    alignItems: 'center',
  },
  infoModalImage: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  infoModalDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoModalCategory: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

