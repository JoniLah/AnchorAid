import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';

const currentYear = new Date().getFullYear();

export const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.title, {color: colors.text}]}>Terms of Service</Text>
        <Text style={[styles.lastUpdated, {color: colors.textSecondary}]}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          By downloading, installing, or using Anchor Aid ("the App"), you agree to be bound by
          these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          We reserve the right to modify these Terms at any time. Continued use of the App after
          changes constitutes acceptance of the modified Terms.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid is a mobile application designed to assist boaters with anchoring operations,
          including:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Calculating recommended anchor scope based on depth and conditions
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Monitoring anchor position and alerting users to potential dragging
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Providing information about anchor types and bottom conditions
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Storing anchoring session history locally on your device
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>3. Use of the App</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You agree to use the App only for lawful purposes and in accordance with these Terms. You
          agree not to:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Use the App in any way that violates applicable laws or regulations
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Attempt to reverse engineer, decompile, or disassemble the App
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Interfere with or disrupt the App's functionality
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Use the App for any commercial purpose without authorization
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>4. Safety and Disclaimer</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          <Text style={[styles.bold, {color: colors.text}]}>IMPORTANT SAFETY NOTICE:</Text> Anchor Aid is a tool to assist
          with anchoring operations. It is NOT a substitute for:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Proper seamanship and navigation skills
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Maintaining a proper watch while anchored
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Understanding local conditions, weather, and regulations
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Professional judgment and experience
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          GPS accuracy can vary and may be affected by environmental factors. The App uses
          algorithms to reduce false alarms, but you should always verify your position using
          multiple methods and maintain proper watch.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          <Text style={[styles.bold, {color: colors.text}]}>YOU ARE SOLELY RESPONSIBLE</Text> for the safety of your vessel
          and crew. The App is provided "as is" without warranties of any kind. We are not
          responsible for any damage, injury, or loss resulting from the use or inability to use
          the App.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>5. Location Services</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          The App requires access to your device's location services to function. By using the App,
          you consent to the collection and use of location data as described in our Privacy Policy.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Location data is processed locally on your device. We do not transmit or store your
          location data on external servers, except as necessary for the App's core functionality
          (e.g., bottom type predictions based on crowdsourced data).
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>6. Advertising</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Anchor Aid may display advertisements within the App. These advertisements may be
          provided by third-party advertising networks. We do not control the content of these
          advertisements.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          By using the App, you acknowledge that:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Advertisements may be displayed while using the App
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Third-party advertisers may collect information about your device and usage patterns
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • We are not responsible for the content or practices of third-party advertisers
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          Please review our Privacy Policy for more information about how advertising may affect
          your data.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>7. Intellectual Property</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          The App, including its design, features, functionality, and content, is owned by Feleroid
          and protected by copyright, trademark, and other intellectual property laws.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You are granted a limited, non-exclusive, non-transferable license to use the App for
          personal, non-commercial purposes. This license does not include the right to:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Copy, modify, or create derivative works of the App
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Redistribute, sublicense, or sell the App
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Remove or alter any copyright, trademark, or proprietary notices
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>8. User Content</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          The App allows you to store session data, notes, and bottom type observations locally on
          your device. You retain ownership of this data.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          By submitting bottom type observations (which may be used for crowdsourced predictions),
          you grant us a non-exclusive license to use this data to improve the App's prediction
          features. This data is anonymized and aggregated.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>9. Limitation of Liability</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, FELEROID AND ITS AFFILIATES SHALL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT
          NOT LIMITED TO:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Loss of property or equipment
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Personal injury or death
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Loss of data or business opportunities
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Errors or inaccuracies in App calculations or predictions
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          The App is provided "as is" without warranties of any kind, express or implied,
          including but not limited to warranties of merchantability, fitness for a particular
          purpose, or non-infringement.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>10. Indemnification</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You agree to indemnify, defend, and hold harmless Feleroid and its affiliates from any
          claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Your use of the App
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Your violation of these Terms
        </Text>
        <Text style={[styles.bulletPoint, {color: colors.text}]}>
          • Your violation of any rights of another party
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>11. Termination</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          We reserve the right to terminate or suspend your access to the App at any time, with or
          without cause or notice, for any reason, including violation of these Terms.
        </Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          You may stop using the App at any time by uninstalling it from your device. Upon
          termination, your right to use the App will immediately cease.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>12. Governing Law</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          These Terms shall be governed by and construed in accordance with applicable laws,
          without regard to conflict of law principles.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>13. Contact Information</Text>
        <Text style={[styles.paragraph, {color: colors.text}]}>
          If you have questions about these Terms of Service, please contact us through the app
          store listing or visit our website.
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.copyright, {color: colors.textSecondary}]}>
          Copyright © {currentYear} Feleroid. All rights reserved.
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
  bold: {
    fontWeight: '600',
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

