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
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

export const EmergencyContactsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();

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
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      {/* Emergency Services - USA */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>🚨 {t('emergencyServices')} - {t('usa')}</Text>
        
        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('911')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('emergencyServicesNumber')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>911</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('1-800-424-8888')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('usCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>1-800-424-8888</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('nationalResponseCenter')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('*16')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📻</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('coastGuardVHF')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>{t('channel16')}</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('emergencyDistress')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Emergency Services - Europe */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>🚨 {t('emergencyServices')} - {t('europe')}</Text>
        
        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('112')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('europeanEmergencyNumber')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>112</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('worksAcrossEU')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('+44 20 7928 5200')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('ukCoastguard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>+44 20 7928 5200</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('maritimeRescueCoordinationCentre')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('196')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('frenchCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>196</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('crossDescription')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('1530')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('germanCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>1530</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('dgzrsDescription')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('1530')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('italianCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>1530</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('guardiaCostiera')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('112')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('spanishCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>112</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('salvamentoMaritimo')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('112')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('swedishCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>112</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('kustbevakningen')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('112')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>⚓</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('finnishCoastGuard')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>112</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('merivartiosto')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => makePhoneCall('112')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>📻</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('vhfChannel16')}</Text>
              <Text style={[styles.contactNumber, {color: colors.primary}]}>{t('channel16')}</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('internationalDistressCalling')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* VHF Radio Channels */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>📻 {t('vhfRadioChannels')}</Text>
        
        <View style={[styles.infoCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <View style={styles.channelRow}>
            <Text style={[styles.channelNumber, {color: colors.primary}]}>16</Text>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, {color: colors.text}]}>{t('emergencyDistress')}</Text>
              <Text style={[styles.channelDescription, {color: colors.textSecondary}]}>{t('internationalHailing')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={[styles.channelNumber, {color: colors.primary}]}>9</Text>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, {color: colors.text}]}>{t('hailingSafety')}</Text>
              <Text style={[styles.channelDescription, {color: colors.textSecondary}]}>{t('alternativeHailing')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={[styles.channelNumber, {color: colors.primary}]}>22A</Text>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, {color: colors.text}]}>{t('coastGuardWorking')}</Text>
              <Text style={[styles.channelDescription, {color: colors.textSecondary}]}>{t('coastGuardWorking')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={[styles.channelNumber, {color: colors.primary}]}>13</Text>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, {color: colors.text}]}>{t('bridgeToBridge')}</Text>
              <Text style={[styles.channelDescription, {color: colors.textSecondary}]}>{t('navigationSafety')}</Text>
            </View>
          </View>
          
          <View style={styles.channelRow}>
            <Text style={[styles.channelNumber, {color: colors.primary}]}>68, 69, 71, 72</Text>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, {color: colors.text}]}>{t('recreational')}</Text>
              <Text style={[styles.channelDescription, {color: colors.textSecondary}]}>{t('nonCommercial')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mayday Checklist */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>🆘 {t('maydayChecklist')}</Text>
        
        <View style={[styles.checklistCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderColor: colors.warning}]}>
          <Text style={[styles.checklistTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('ifInDistress')}</Text>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>1.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep1')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>2.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep2')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>3.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep3')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>4.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep4')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>5.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep5')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>6.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep6')}</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={[styles.checklistBullet, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>7.</Text>
            <Text style={[styles.checklistText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('maydayStep7')}</Text>
          </View>
        </View>
      </View>

      {/* Additional Resources */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>ℹ️ {t('additionalResources')}</Text>
        
        <TouchableOpacity
          style={[styles.contactCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => openWebsite('https://www.uscg.mil')}>
          <View style={styles.contactContent}>
            <Text style={styles.contactIcon}>🌐</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, {color: colors.text}]}>{t('usCoastGuardWebsite')}</Text>
              <Text style={[styles.contactDescription, {color: colors.textSecondary}]}>{t('officialUSCG')}</Text>
            </View>
            <Text style={[styles.contactArrow, {color: colors.textSecondary}]}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.infoCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <Text style={[styles.infoText, {color: colors.text}]}>
            <Text style={[styles.infoBold, {color: colors.text}]}>{t('emergencyNote')}</Text>
          </Text>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  contactArrow: {
    fontSize: 24,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  channelRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  channelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 13,
  },
  checklistCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '600',
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
    marginRight: 8,
    width: 20,
  },
  checklistText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
});

