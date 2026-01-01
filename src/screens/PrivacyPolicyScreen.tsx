import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {useNavigation} from '@react-navigation/native';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={styles.section}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          Anchor Aid collects and uses location data to provide anchor monitoring
          functionality. Specifically:
        </Text>
        <Text style={styles.bulletPoint}>
          • Location data (GPS coordinates) to set anchor points and monitor
          boat position
        </Text>
        <Text style={styles.bulletPoint}>
          • Session data including depth, scope, and anchoring conditions that
          you enter
        </Text>
        <Text style={styles.bulletPoint}>
          • App settings and preferences
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Location data is used exclusively for:
        </Text>
        <Text style={styles.bulletPoint}>
          • Setting and monitoring anchor position
        </Text>
        <Text style={styles.bulletPoint}>
          • Triggering drag alarms when your boat moves beyond the threshold
        </Text>
        <Text style={styles.bulletPoint}>
          • Calculating swing radius and anchor watch parameters
        </Text>
        <Text style={styles.paragraph}>
          All location data is processed locally on your device. We do not
          transmit, share, or store your location data on external servers.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Data Storage</Text>
        <Text style={styles.paragraph}>
          All data is stored locally on your device using secure local storage:
        </Text>
        <Text style={styles.bulletPoint}>
          • Session data is stored on your device only
        </Text>
        <Text style={styles.bulletPoint}>
          • Location data is used in real-time and not permanently stored
        </Text>
        <Text style={styles.bulletPoint}>
          • You can delete session data at any time
        </Text>
        <Text style={styles.paragraph}>
          No data is transmitted to external servers or third parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Background Location</Text>
        <Text style={styles.paragraph}>
          Anchor Aid requires background location access to monitor your anchor
          position even when the app is minimized. This is essential for the
          anchor watch alarm functionality.
        </Text>
        <Text style={styles.paragraph}>
          Background location is only active when you explicitly start the
          anchor alarm. You can stop background location tracking at any time
          by stopping the alarm.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>5. Permissions</Text>
        <Text style={styles.paragraph}>
          Anchor Aid requires the following permissions:
        </Text>
        <Text style={styles.bulletPoint}>
          • Location (Foreground): To set anchor points and monitor position
          when app is active
        </Text>
        <Text style={styles.bulletPoint}>
          • Location (Background): To continue monitoring when app is minimized
        </Text>
        <Text style={styles.paragraph}>
          You can revoke these permissions at any time through your device
          settings, though this will disable anchor monitoring functionality.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>6. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Anchor Aid does not use third-party analytics, advertising, or data
          collection services. All functionality operates entirely on your
          device.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>7. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have full control over your data:
        </Text>
        <Text style={styles.bulletPoint}>
          • Delete session data at any time through the app
        </Text>
        <Text style={styles.bulletPoint}>
          • Revoke location permissions through device settings
        </Text>
        <Text style={styles.bulletPoint}>
          • Uninstall the app to remove all local data
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>8. Safety Disclaimer</Text>
        <Text style={styles.paragraph}>
          Anchor Aid is a tool to assist with anchoring. It is not a substitute
          for proper seamanship, watchkeeping, or navigation. Always maintain
          proper watch and use your judgment when anchoring.
        </Text>
        <Text style={styles.paragraph}>
          GPS accuracy can vary. The app uses smoothing algorithms to reduce
          false alarms, but environmental factors may affect accuracy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>9. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. The "Last
          updated" date at the top indicates when changes were made. Continued
          use of the app after changes constitutes acceptance of the updated
          policy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>10. Contact</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy or how Anchor Aid
          handles your data, please review the app settings or contact support
          through the app store listing.
        </Text>
      </View>

      <View style={styles.section}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
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
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginLeft: 16,
    marginBottom: 8,
  },
});

