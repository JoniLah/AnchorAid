import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import {Theme} from '../types';
import {loadSettings, saveSettings} from '../services/storage';
import {lightColors, darkColors, ColorScheme} from './colors';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  colors: ColorScheme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setSystemTheme(colorScheme);
    });

    // Load theme preference on mount
    loadSettings().then(settings => {
      if (settings.theme) {
        setThemeState(settings.theme);
      } else {
        // Default to system if not set
        setThemeState('system');
      }
    });

    return () => subscription.remove();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    // Save to storage
    const settings = await loadSettings();
    await saveSettings({...settings, theme: newTheme});
  };

  // Determine effective theme (actual theme to use)
  const effectiveTheme: 'light' | 'dark' = 
    theme === 'system' 
      ? (systemTheme === 'dark' ? 'dark' : 'light')
      : theme;

  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{theme, effectiveTheme, colors, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

