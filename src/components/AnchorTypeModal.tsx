import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {AnchorType, BottomType} from '../types';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  isAnchorRecommendedForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorIcon} from '../utils/anchorIcons';
import {BOTTOM_TYPE_INFO} from '../utils/bottomType';

interface AnchorTypeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedType?: AnchorType;
  onSelect: (type: AnchorType) => void;
  bottomType?: BottomType;
}

export const AnchorTypeModal: React.FC<AnchorTypeModalProps> = ({
  visible,
  onClose,
  selectedType,
  onSelect,
  bottomType,
}) => {
  const handleSelect = (type: AnchorType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Anchor Type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {bottomType && bottomType !== BottomType.UNKNOWN && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>
                  Recommended for {BOTTOM_TYPE_INFO[bottomType].name}:
                </Text>
                <Text style={styles.recommendationText}>
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
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.anchorCard,
                      isSelected && styles.anchorCardSelected,
                      isRecommended && !isSelected && styles.anchorCardRecommended,
                    ]}
                    onPress={() => handleSelect(type)}>
                    <View style={styles.anchorIconContainer}>
                      <Text style={styles.anchorIcon}>
                        {getAnchorIcon(type)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.anchorName,
                        isSelected && styles.anchorNameSelected,
                      ]}>
                      {info.name}
                    </Text>
                    {isRecommended && (
                      <Text style={styles.recommendedBadge}>✓ Recommended</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedType && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailsTitle}>
                  {getAnchorTypeInfo(selectedType).name}
                </Text>
                <Text style={styles.detailsText}>
                  {getAnchorTypeInfo(selectedType).description}
                </Text>
                <Text style={styles.detailsCategory}>
                  Category: {getAnchorTypeInfo(selectedType).category}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  recommendationBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#004085',
  },
  anchorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  anchorCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  anchorCardRecommended: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  anchorCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  anchorIconContainer: {
    marginBottom: 8,
  },
  anchorIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  anchorName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  anchorNameSelected: {
    color: '#fff',
  },
  recommendedBadge: {
    fontSize: 9,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

