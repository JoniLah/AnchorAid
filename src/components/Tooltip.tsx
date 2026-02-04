import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {t} from '../i18n';
import {useTheme} from '../theme/ThemeContext';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({content}) => {
  const [visible, setVisible] = useState(false);
  const {colors} = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.tooltipButton, {backgroundColor: colors.textSecondary}]}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={styles.tooltipIcon}>?</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={[styles.tooltipContainer, {backgroundColor: colors.surface}]}>
            <Text style={[styles.tooltipText, {color: colors.text}]}>{content}</Text>
            <TouchableOpacity
              style={[styles.closeButton, {backgroundColor: colors.primary}]}
              onPress={() => setVisible(false)}>
              <Text style={styles.closeButtonText}>{t('gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tooltipButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

