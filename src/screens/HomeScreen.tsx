import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {AdBanner} from '../components/AdBanner';
import {loadSessions} from '../services/storage';
import {AnchoringSession} from '../types';
import {formatLength, getLengthUnit} from '../utils/units';
import {loadInterstitialAd} from '../services/adMob';
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const [recentSessions, setRecentSessions] = useState<AnchoringSession[]>([]);

  useEffect(() => {
    loadRecentSessions();
    // Preload interstitial ad for better user experience
    loadInterstitialAd().catch(() => {
      // Silently fail if ad can't be loaded
    });
  }, []);

  const loadRecentSessions = async () => {
    const sessions = await loadSessions();
    setRecentSessions(sessions.slice(0, 5)); // Show last 5
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 80}}>
      <ImageBackground
        source={require('../../assets/graphics/wallpaper.png')}
        style={styles.header}
        resizeMode="cover">
        <View style={styles.headerOverlay}>
          <View style={styles.titleContainer}>
            <Image
              source={require('../../assets/graphics/basic-anchor.png')}
              style={styles.anchorIcon}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('appName')}</Text>
          </View>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0, 52, 107, 0.8)']}
          style={styles.headerGradient}
          locations={[0.5, 1]}
        />
      </ImageBackground>

      <SafetyDisclaimer />

      <View style={styles.sectionButtons}>
        <TouchableOpacity
          style={[styles.primaryActionButton, {backgroundColor: colors.primary}]}
          onPress={async () => {
            // Show interstitial ad before navigating
            try {
              const {showInterstitialAd} = await import('../services/adMob');
              await showInterstitialAd();
            } catch (error) {
              console.log('Ad not available, continuing navigation');
            }
            navigation.navigate('AnchoringSession' as never);
          }}
          activeOpacity={0.8}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>⚓</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.primaryButtonTitle}>{t('startNewSession')}</Text>
              <Text style={styles.primaryButtonSubtitle}>{t('startNewSessionSubtitle')}</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('recentSessions')}</Text>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('SessionHistory')}
              activeOpacity={0.7}>
              <Text style={[styles.viewAllText, {color: colors.primary}]}>{t('viewAll')} →</Text>
            </TouchableOpacity>
          </View>
          {recentSessions.map(session => (
            <TouchableOpacity
              key={session.id}
              style={[styles.sessionCard, {backgroundColor: colors.card, borderColor: colors.border}]}
              onPress={() =>
                (navigation as any).navigate('AnchoringSession', {
                  sessionId: session.id,
                })
              }>
              <Text style={[styles.sessionDate, {color: colors.text}]}>
                {formatDate(session.timestamp)}
              </Text>
              {session.recommendedRodeLength && (
                <Text style={[styles.sessionInfo, {color: colors.textSecondary}]}>
                  {t('recommended')}: {formatLength(
                    session.recommendedRodeLength,
                    session.unitSystem,
                  )}
                </Text>
              )}
              {session.location && (
                <Text style={[styles.sessionLocation, {color: colors.textTertiary}]}>
                  📍 {session.location.latitude.toFixed(4)}, {session.location.longitude.toFixed(4)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.sectionButtons}>
        <TouchableOpacity
          style={[styles.mapButton, {backgroundColor: colors.card, borderColor: colors.primary}]}
          onPress={() => (navigation as any).navigate('BottomTypeMap')}
          activeOpacity={0.8}>
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapButtonIcon}>🗺️</Text>
            <View style={styles.mapButtonTextContainer}>
              <Text style={[styles.mapButtonTitle, {color: colors.primary}]}>{t('bottomTypeMap')}</Text>
              <Text style={[styles.mapButtonSubtitle, {color: colors.textSecondary}]}>{t('bottomTypeMapSubtitle')}</Text>
            </View>
            <Text style={[styles.buttonArrow, {color: colors.primary, opacity: 0.7}]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionButtons}>
        <TouchableOpacity
          style={[styles.guideButton, {backgroundColor: colors.card, borderColor: colors.success}]}
          onPress={() => (navigation as any).navigate('AnchoringTechnique')}
          activeOpacity={0.8}>
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapButtonIcon}>📚</Text>
            <View style={styles.mapButtonTextContainer}>
              <Text style={[styles.guideButtonTitle, {color: colors.success}]}>{t('anchoringTechnique')}</Text>
              <Text style={[styles.mapButtonSubtitle, {color: colors.textSecondary}]}>{t('howToAnchorSubtitle')}</Text>
            </View>
            <Text style={[styles.buttonArrow, {color: colors.success, opacity: 0.7}]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionButtons}>
        <TouchableOpacity
          style={[styles.guideButton, {backgroundColor: colors.card, borderColor: colors.primary}]}
          onPress={() => (navigation as any).navigate('AnchorGuide')}
          activeOpacity={0.8}>
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapButtonIcon}>⚓</Text>
            <View style={styles.mapButtonTextContainer}>
              <Text style={[styles.guideButtonTitle, {color: colors.primary}]}>{t('anchorGuide')}</Text>
              <Text style={[styles.mapButtonSubtitle, {color: colors.textSecondary}]}>{t('anchorTypeGuide')}</Text>
            </View>
            <Text style={[styles.buttonArrow, {color: colors.primary, opacity: 0.7}]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    {/* Sticky Ad Banner at bottom - above navigation buttons */}
    <View style={[styles.adSection, {paddingBottom: insets.bottom}]}>
      <AdBanner />
    </View>
    
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
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay to darken the background
    padding: 24,
    paddingTop: 16,
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Fixed height for gradient at bottom
    zIndex: 3, // Above the overlay but below text
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  anchorIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    tintColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  sessionLocation: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  primaryActionButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 2,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  primaryButtonSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  buttonArrow: {
    fontSize: 32,
    color: '#fff',
    opacity: 0.7,
  },
  mapButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 2,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  mapButtonTextContainer: {
    flex: 1,
  },
  mapButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mapButtonSubtitle: {
    fontSize: 14,
  },
  guideButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 2,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guideButtonArrow: {
    fontSize: 32,
    opacity: 0.7,
  },
  adSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
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

