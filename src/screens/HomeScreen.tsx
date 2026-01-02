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
import {t} from '../i18n';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
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

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.primaryActionButton}
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
            <Text style={styles.sectionTitle}>{t('recentSessions')}</Text>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('SessionHistory')}
              activeOpacity={0.7}>
              <Text style={styles.viewAllText}>{t('viewAll')} →</Text>
            </TouchableOpacity>
          </View>
          {recentSessions.map(session => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() =>
                (navigation as any).navigate('AnchoringSession', {
                  sessionId: session.id,
                })
              }>
              <Text style={styles.sessionDate}>
                {formatDate(session.timestamp)}
              </Text>
              {session.recommendedRodeLength && (
                <Text style={styles.sessionInfo}>
                  {t('recommended')}: {formatLength(
                    session.recommendedRodeLength,
                    session.unitSystem,
                  )}
                </Text>
              )}
              {session.location && (
                <Text style={styles.sessionLocation}>
                  📍 {session.location.latitude.toFixed(4)}, {session.location.longitude.toFixed(4)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => (navigation as any).navigate('BottomTypeMap')}
          activeOpacity={0.8}>
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapButtonIcon}>🗺️</Text>
            <View style={styles.mapButtonTextContainer}>
              <Text style={styles.mapButtonTitle}>{t('bottomTypeMap')}</Text>
              <Text style={styles.mapButtonSubtitle}>{t('bottomTypeMapSubtitle')}</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.guideButton}
          onPress={() => (navigation as any).navigate('AnchoringTechnique')}
          activeOpacity={0.8}>
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapButtonIcon}>📚</Text>
            <View style={styles.mapButtonTextContainer}>
              <Text style={styles.guideButtonTitle}>{t('anchoringTechnique')}</Text>
              <Text style={styles.mapButtonSubtitle}>{t('howToAnchorSubtitle')}</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    {/* Sticky Ad Banner at bottom - above navigation buttons */}
    <View style={[styles.adSection, {paddingBottom: insets.bottom}]}>
      <AdBanner />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 16,
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
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sessionLocation: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  primaryActionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
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
    color: '#007AFF',
    marginBottom: 4,
  },
  mapButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  guideButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  guideButtonArrow: {
    fontSize: 32,
    color: '#28a745',
    opacity: 0.7,
  },
  adSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 1000,
  },
});

