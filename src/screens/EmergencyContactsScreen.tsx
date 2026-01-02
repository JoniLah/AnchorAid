import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {t} from '../i18n';

export const EmergencyContactsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log('Phone calls not supported');
        }
      })
      .catch(err => console.error('Error making phone call:', err));
  };

  const openWebsite = (url: string) => {
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      })
      .catch(err => console.error('Error opening URL:', err));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      {/* Emergency Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 {t('emergencyServices')}</Text>
        
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => makePhoneCall('911')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{t('emergencyServicesNumber')}</Text>
              <Text style={styles.contactNumber}>911</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => makePhoneCall('1-800-424-8888')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{t('usCoastGuard')}</Text>
              <Text style={styles.contactNumber}>1-800-424-8888</Text>
              <Text style={styles.contactDescription}>{t('nationalResponseCenter')}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => makePhoneCall('*16')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📻</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{t('coastGuardVHF')}</Text>
              <Text style={styles.contactNumber}>{t('channel16')}</Text>
              <Text style={styles.contactDescription}>{t('emergencyDistress')}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* VHF Radio Channels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📻 {t('vhfRadioChannels')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.channelRow}>
            <Text style={styles.channelNumber}>16</Text>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{t('emergencyDistress')}</Text>
              <Text style={styles.channelDescription}>{t('internationalHailing')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={styles.channelNumber}>9</Text>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{t('hailingSafety')}</Text>
              <Text style={styles.channelDescription}>{t('alternativeHailing')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={styles.channelNumber}>22A</Text>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{t('coastGuardWorking')}</Text>
              <Text style={styles.channelDescription}>{t('coastGuardWorking')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={styles.channelNumber}>13</Text>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{t('bridgeToBridge')}</Text>
              <Text style={styles.channelDescription}>{t('navigationSafety')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={styles.channelNumber}>68, 69, 71, 72</Text>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{t('recreational')}</Text>
              <Text style={styles.channelDescription}>{t('nonCommercial')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mayday Checklist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆘 {t('maydayChecklist')}</Text>
        
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>{t('ifInDistress')}</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>1.</Text>
            <Text style={styles.checklistText}>{t('maydayStep1')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>2.</Text>
            <Text style={styles.checklistText}>{t('maydayStep2')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>3.</Text>
            <Text style={styles.checklistText}>{t('maydayStep3')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>4.</Text>
            <Text style={styles.checklistText}>{t('maydayStep4')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>5.</Text>
            <Text style={styles.checklistText}>{t('maydayStep5')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>6.</Text>
            <Text style={styles.checklistText}>{t('maydayStep6')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistBullet}>7.</Text>
            <Text style={styles.checklistText}>{t('maydayStep7')}</Text>
          </View>
        </View>
      </View>

      {/* Additional Resources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ {t('additionalResources')}</Text>
        
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => openWebsite('https://www.uscg.mil')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>🌐</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{t('usCoastGuardWebsite')}</Text>
              <Text style={styles.contactDescription}>{t('officialUSCG')}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>{t('emergencyNote')}</Text>
          </Text>
        </View>
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contactArrow: {
    fontSize: 24,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  channelRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  channelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 60,
    textAlign: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 13,
    color: '#666',
  },
  checklistCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  checklistBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginRight: 8,
    width: 20,
  },
  checklistText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
    color: '#333',
  },
});

