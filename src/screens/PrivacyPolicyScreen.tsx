import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.title, {color: colors.text}]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, {color: colors.textSecondary}]}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid collects and uses location data to provide anchor monitoring
          functionality. Specifically:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Location data (GPS coordinates) to set anchor points and monitor
          boat position
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Session data including depth, scope, and anchoring conditions that
          you enter
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • App settings and preferences
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Location data is used exclusively for:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Setting and monitoring anchor position
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Triggering drag alarms when your boat moves beyond the threshold
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Calculating swing radius and anchor watch parameters
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          All location data is processed locally on your device. We do not
          transmit, share, or store your location data on external servers.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>3. Data Storage</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          All data is stored locally on your device using secure local storage:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Session data is stored on your device only
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Location data is used in real-time and not permanently stored
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • You can delete session data at any time
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          No data is transmitted to external servers or third parties.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>4. Background Location</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid requires background location access to monitor your anchor
          position even when the app is minimized. This is essential for the
          anchor watch alarm functionality.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Background location is only active when you explicitly start the
          anchor alarm. You can stop background location tracking at any time
          by stopping the alarm.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>5. Permissions</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid requires the following permissions:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Location (Foreground): To set anchor points and monitor position
          when app is active
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Location (Background): To continue monitoring when app is minimized
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You can revoke these permissions at any time through your device
          settings, though this will disable anchor monitoring functionality.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>6. Advertising</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid may display advertisements provided by third-party
          advertising networks. These advertisements help support the development
          and maintenance of the App.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          When advertisements are displayed:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Third-party advertisers may collect information about your device
          (such as device type, operating system, and general location)
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Advertisers may use cookies, device identifiers, or similar
          technologies to deliver personalized ads
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • We do not control the content of advertisements or the data
          collection practices of third-party advertisers
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You can learn more about how advertisers use your data by reviewing
          their privacy policies. Many advertising networks provide opt-out
          mechanisms through their websites or device settings.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Our core functionality (anchor monitoring, session data) operates
          independently of advertising and does not share your personal
          anchoring data with advertisers.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>7. Third-Party Services</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid may use third-party services for:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Advertising (as described above)
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • App analytics and crash reporting (if implemented)
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          These services may collect information about your device and usage
          patterns. We do not share your personal anchoring session data with
          these services.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>8. Your Rights</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You have full control over your data:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Delete session data at any time through the app
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Revoke location permissions through device settings
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Uninstall the app to remove all local data
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>9. Safety Disclaimer</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid is a tool to assist with anchoring. It is not a substitute
          for proper seamanship, watchkeeping, or navigation. Always maintain
          proper watch and use your judgment when anchoring.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          GPS accuracy can vary. The app uses smoothing algorithms to reduce
          false alarms, but environmental factors may affect accuracy.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>10. Changes to This Policy</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          We may update this privacy policy from time to time. The "Last
          updated" date at the top indicates when changes were made. Continued
          use of the app after changes constitutes acceptance of the updated
          policy.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>11. Contact</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          If you have questions about this privacy policy or how Anchor Aid
          handles your data, please review the app settings or contact support
          through the app store listing.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.copyright, {color: colors.textSecondary}]}>
          Copyright © {new Date().getFullYear()} Feleroid. All rights reserved.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 16,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

