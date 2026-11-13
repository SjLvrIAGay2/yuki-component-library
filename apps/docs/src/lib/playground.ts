import { useEffect, useState } from 'react';
import { useMediaQuery, type Density, type ThemeMode } from '@yuki-ui/react';

export const brandPalettes = {
  iris: { label: '鸢尾紫', light: '#6464d4', dark: '#8f8ff2' },
  blue: { label: '蓝色', light: '#426bc4', dark: '#91b3ff' },
  green: { label: '绿色', light: '#357b61', dark: '#85d1ae' },
  rose: { label: '玫瑰色', light: '#b14f77', dark: '#f1a1c0' },
  amber: { label: '琥珀色', light: '#a26d29', dark: '#e9bc7d' },
} as const;

export interface PlaygroundPreferences {
  palette: keyof typeof brandPalettes;
  radius: 4 | 8 | 12;
  density: Density;
  motion: boolean;
}

export const defaultPlayground: PlaygroundPreferences = {
  palette: 'iris', radius: 8, density: 'comfortable', motion: true,
};

const storageKey = 'yuki-docs-playground';

function loadPreferences(): PlaygroundPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}') ?? {};
    return {
      palette: Object.hasOwn(brandPalettes, saved.palette) ? saved.palette : 'iris',
      radius: [4, 8, 12].includes(saved.radius) ? saved.radius : 8,
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      motion: saved.motion !== false,
    };
  } catch {
    return defaultPlayground;
  }
}

export function usePlaygroundPreferences(mode: ThemeMode) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const dark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolved = mode === 'system' ? (dark ? 'dark' : 'light') : mode;
  const primaryColor = preferences.palette === 'iris' ? undefined : brandPalettes[preferences.palette][resolved];
  const radius = preferences.radius;
  const theme = {
    mode, primaryColor,
    tokens: radius === 8 ? undefined : {
      'radius-sm': `${radius - 2}px`, 'radius-md': `${radius}px`, 'radius-lg': `${radius + 4}px`,
    },
  };
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); }
    catch { /* Embedded browsers can disable persistence. */ }
  }, [preferences]);
  return { preferences, setPreferences, theme };
}
