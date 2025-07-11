export type Theme = 'light' | 'dark' | 'high-contrast';

export interface ThemeConfig {
  name: string;
  value: Theme;
  icon: string;
}