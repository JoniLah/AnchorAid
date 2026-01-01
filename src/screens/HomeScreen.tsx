import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {loadSessions} from '../services/storage';
import {AnchoringSession} from '../types';
import {formatLength, getLengthUnit} from '../utils/units';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [recentSessions, setRecentSessions] = useState<AnchoringSession[]>([]);

  useEffect(() => {
    loadRecentSessions();
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={styles.header}>
        <Text style={styles.title}>⚓ Anchor Aid</Text>
        <Text style={styles.subtitle}>Anchoring Assistant</Text>
      </View>

      <SafetyDisclaimer />

      <View style={styles.section}>
        <Button
          title="Start New Anchoring Session"
          onPress={() => navigation.navigate('AnchoringSession' as never)}
          fullWidth
        />
      </View>

      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.map(session => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() =>
                navigation.navigate('AnchoringSession' as never, {
                  sessionId: session.id,
                } as never)
              }>
              <Text style={styles.sessionDate}>
                {formatDate(session.timestamp)}
              </Text>
              {session.recommendedRodeLength && (
                <Text style={styles.sessionInfo}>
                  Recommended: {formatLength(
                    session.recommendedRodeLength,
                    session.unitSystem,
                  )}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Button
          title="Settings"
          onPress={() => navigation.navigate('Settings' as never)}
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
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  },
});

