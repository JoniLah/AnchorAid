import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loadSessions, deleteSession} from '../services/storage';
import {AnchoringSession, BottomType, AnchorType} from '../types';
import {formatLength, getLengthUnit} from '../utils/units';
import {haversineDistance} from '../utils/haversine';
import {BOTTOM_TYPE_INFO, getBottomTypeName} from '../utils/bottomType';
import {getAnchorTypeInfo} from '../utils/anchorType';
import {t, getLanguage} from '../i18n';

export const SessionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<AnchoringSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessionsData = async () => {
    try {
      const loadedSessions = await loadSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessionsData();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessionsData();
    setRefreshing(false);
  };

  const handleDelete = (session: AnchoringSession) => {
    Alert.alert(
      t('deleteSession'),
      `${t('areYouSureDelete')} ${formatDate(session.timestamp)}?`,
      [
        {text: t('cancel'), style: 'cancel'},
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteSession(session.id);
            await loadSessionsData();
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: number) => {
    const localeMap = { en: 'en-US', fi: 'fi-FI', sv: 'sv-SE' } as const;
    const locale = localeMap[getLanguage()] ?? 'en-US';
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days === 1 ? t('timeAgoDay') : t('timeAgoDays').replace('{count}', String(days));
    if (hours > 0) return hours === 1 ? t('timeAgoHour') : t('timeAgoHours').replace('{count}', String(hours));
    if (minutes > 0) return minutes === 1 ? t('timeAgoMinute') : t('timeAgoMinutes').replace('{count}', String(minutes));
    return t('justNow');
  };

  const calculateMovement = (session: AnchoringSession): number | null => {
    if (!session.anchorPoint || !session.currentPosition) {
      return null;
    }
    return haversineDistance(session.anchorPoint, session.currentPosition);
  };

  const getLocationString = (location?: {latitude: number; longitude: number}) => {
    if (!location) return t('noLocation');
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const openSessionOnMap = (session: AnchoringSession) => {
    const point = session.anchorPoint ?? session.location;
    if (!point) return;
    const {latitude, longitude} = point;
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}`
        : `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t('noSessions')}</Text>
          <Text style={styles.emptyText}>
            {t('noSessions')}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('sessionHistory')}</Text>
            <Text style={styles.headerSubtitle}>
              {sessions.length === 1 ? t('oneSessionSaved') : t('sessionsSaved').replace('{count}', String(sessions.length))}
            </Text>
          </View>

          {sessions.map(session => {
            const movement = calculateMovement(session);
            const unitSystem = session.unitSystem;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionHeaderLeft}>
                    <Text style={styles.sessionDate}>{formatDate(session.timestamp)}</Text>
                    <Text style={styles.sessionTimeAgo}>{formatTimeAgo(session.timestamp)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(session)}
                    activeOpacity={0.7}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Location Info */}
                {session.location && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>📍 {t('location')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>{getLocationString(session.location)}</Text>
                    </View>
                  </View>
                )}

                {/* Movement */}
                {movement !== null && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>📏 {t('movement')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={[styles.infoValue, movement > (session.dragThreshold || 30) && styles.warningValue]}>
                        {formatLength(movement, unitSystem)}
                        {session.dragThreshold && movement > session.dragThreshold && ' ⚠️'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Depth & Scope */}
                {(session.depth || session.recommendedRodeLength) && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>🌊 {t('depth')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {session.depth
                          ? formatLength(session.depth, unitSystem)
                          : t('notRecorded')}
                      </Text>
                    </View>
                  </View>
                )}

                {session.recommendedRodeLength && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>📐 {t('recommendedRode')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {formatLength(session.recommendedRodeLength, unitSystem)}
                      </Text>
                    </View>
                  </View>
                )}

                {session.actualRodeDeployed && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>🔗 {t('actualRode')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {formatLength(session.actualRodeDeployed, unitSystem)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Bottom Type & Anchor Type */}
                {session.bottomType && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>🌍 {t('bottomType')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {getBottomTypeName(session.bottomType, t)}
                      </Text>
                    </View>
                  </View>
                )}

                {session.anchorType && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>⚓ {t('anchorType')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {getAnchorTypeInfo(session.anchorType).name}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Wind Conditions */}
                {(session.windSpeed || session.gustSpeed) && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>💨 {t('wind')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {session.windSpeed
                          ? `${session.windSpeed} ${unitSystem === 'metric' ? 'm/s' : 'knots'}`
                          : t('na')}
                        {session.gustSpeed && ` (${t('gusts')}: ${session.gustSpeed} ${unitSystem === 'metric' ? 'm/s' : 'knots'})`}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Swing Radius */}
                {session.swingRadius && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <Text style={styles.infoLabel}>🔄 {t('swingRadius')}:</Text>
                    </View>
                    <View style={styles.infoValueContainer}>
                      <Text style={styles.infoValue}>
                        {formatLength(session.swingRadius, unitSystem)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Notes */}
                {session.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>📝 {t('notes')}:</Text>
                    <Text style={styles.notesText}>{session.notes}</Text>
                  </View>
                )}

                {/* View on map & View Details */}
                {(session.anchorPoint || session.location) && (
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => openSessionOnMap(session)}
                    activeOpacity={0.7}>
                    <Text style={styles.mapButtonText}>📍 {t('viewOnMap')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    (navigation as any).navigate('AnchoringSession', {
                      sessionId: session.id,
                    })
                  }
                  activeOpacity={0.7}>
                  <Text style={styles.viewButtonText}>{t('viewDetails')} →</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
    
    {/* Safe area background to prevent content showing through */}
    {insets.bottom > 0 && (
      <View style={[styles.safeAreaBackground, {height: insets.bottom, backgroundColor: '#f5f5f5'}]} />
    )}
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
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  sessionCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionHeaderLeft: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionTimeAgo: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabelContainer: {
    width: '50%',
    paddingRight: 6,
  },
  infoValueContainer: {
    width: '50%',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flexWrap: 'wrap',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
  },
  warningValue: {
    color: '#dc3545',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mapButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  viewButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

