import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import {HomeScreen} from './screens/HomeScreen';
import {AnchoringSessionScreen} from './screens/AnchoringSessionScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {loadSettings} from './services/storage';
import {setLanguage} from './i18n';

export type RootStackParamList = {
  Home: undefined;
  AnchoringSession: {sessionId?: string} | undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  useEffect(() => {
    // Load language preference on app start
    loadSettings().then(settings => {
      if (settings.language) {
        setLanguage(settings.language);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Anchor Aid'}}
        />
        <Stack.Screen
          name="AnchoringSession"
          component={AnchoringSessionScreen}
          options={{title: 'Anchoring Session'}}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

