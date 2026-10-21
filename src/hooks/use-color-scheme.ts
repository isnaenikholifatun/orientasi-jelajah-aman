import { useState, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type Listener = (mode: ThemeMode) => void;
let currentMode: ThemeMode = 'system';
const listeners = new Set<Listener>();

export function setAppThemeMode(mode: ThemeMode) {
  currentMode = mode;
  listeners.forEach((listener) => listener(mode));
}

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const [mode, setMode] = useState<ThemeMode>(currentMode);

  useEffect(() => {
    const listener: Listener = (newMode) => setMode(newMode);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (mode === 'system') {
    return colorScheme ?? 'light';
  }
  return mode;
}

export function useCurrentThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(currentMode);

  useEffect(() => {
    const listener: Listener = (newMode) => setMode(newMode);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return mode;
}