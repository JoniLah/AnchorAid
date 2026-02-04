import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, TouchableOpacity, Text, View, StyleSheet, AppState} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {clearLockScreenNotification} from './services/lockScreenNotification';
import {HomeScreen} from './screens/HomeScreen';
import {AnchoringSessionScreen} from './screens/AnchoringSessionScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {PrivacyPolicyScreen} from './screens/PrivacyPolicyScreen';
import {TermsOfServiceScreen} from './screens/TermsOfServiceScreen';
import {AnchorGuideScreen} from './screens/AnchorGuideScreen';
import {BottomTypeMapScreen} from './screens/BottomTypeMapScreen';
import {SessionHistoryScreen} from './screens/SessionHistoryScreen';
import {AnchoringTechniqueScreen} from './screens/AnchoringTechniqueScreen';
import {MonitorViewScreen} from './screens/MonitorViewScreen';
import {EmergencyContactsScreen} from './screens/EmergencyContactsScreen';
import {loadSettings} from './services/storage';
import {setLanguage, t, onLanguageChange} from './i18n';
import {ThemeProvider, useTheme} from './theme/ThemeContext';
// Import to register background location task
import './services/backgroundLocation';

export type RootStackParamList = {
  Home: undefined;
  AnchoringSession: {sessionId?: string} | undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  AnchorGuide: undefined;
  BottomTypeMap: undefined;
  SessionHistory: undefined;
  AnchoringTechnique: undefined;
  MonitorView: {
    anchorPoint: {latitude: number; longitude: number};
    swingRadius: number;
    unitSystem: 'metric' | 'imperial';
    dragThreshold: number;
    anchorStartTime?: number;
  };
  EmergencyContacts: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppContent: React.FC = () => {
  const [languageKey, setLanguageKey] = useState(0);
  const {colors} = useTheme();

  useEffect(() => {
    // Load language preference on app start
    loadSettings().then(settings => {
      if (settings.language) {
        setLanguage(settings.language);
        // Trigger initial re-render after language is loaded
        setLanguageKey(prev => prev + 1);
      }
    });

    // Listen for language changes and force re-render
    const unsubscribe = onLanguageChange(() => {
      setLanguageKey(prev => prev + 1);
    });

    // Clear notifications when app goes to background or closes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        clearLockScreenNotification();
      }
    });

    return () => {
      unsubscribe();
      subscription.remove();
      // Clear notifications on unmount
      clearLockScreenNotification();
    };
  }, []);
  
  // Custom header background with subtle gradient at bottom
  const HeaderBackground: React.FC = () => {
    return (
      <View style={styles.headerBackground}>
        <View style={[styles.headerBase, {backgroundColor: colors.header}]} />
        <LinearGradient
          colors={['transparent', colors.headerGradient]}
          style={styles.headerGradient}
          locations={[0.5, 1]}
        />
      </View>
    );
  };

  return (
    <NavigationContainer key={languageKey}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackground: () => <HeaderBackground />,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({navigation}) => ({
            title: t('appName'),
            headerRight: () => (
              <TouchableOpacity
                style={{marginRight: 16}}
                onPress={() => navigation.navigate('Settings' as never)}
                activeOpacity={0.7}>
                <Text style={{fontSize: 24}}>⚙️</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="AnchoringSession"
          component={AnchoringSessionScreen}
          options={({route}) => ({
            title: (route.params as {sessionId?: string} | undefined)?.sessionId
              ? t('savedSession')
              : t('startNewSession'),
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={() => ({title: t('settings')})}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={() => ({title: t('privacyPolicy')})}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={() => ({title: t('termsOfService')})}
        />
        <Stack.Screen
          name="AnchorGuide"
          component={AnchorGuideScreen}
          options={() => ({title: t('anchorGuide')})}
        />
        <Stack.Screen
          name="BottomTypeMap"
          component={BottomTypeMapScreen}
          options={() => ({title: t('bottomTypeMap')})}
        />
        <Stack.Screen
          name="SessionHistory"
          component={SessionHistoryScreen}
          options={() => ({title: t('sessionHistory')})}
        />
        <Stack.Screen
          name="AnchoringTechnique"
          component={AnchoringTechniqueScreen}
          options={() => ({title: t('anchoringTechnique')})}
        />
        <Stack.Screen
          name="MonitorView"
          component={MonitorViewScreen}
          options={() => ({title: t('anchorMonitor'), headerShown: false})}
        />
        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
          options={() => ({title: t('emergencyContacts')})}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  headerBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%', // Gradient covers bottom 60% starting from middle
  },
});

export default App;

