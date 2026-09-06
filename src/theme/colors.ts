// Blood/Energy theme — matches gym-journey-hub web app (globals.css)
export const Colors = {
  dark: {
    background: '#0D0D0D',       // hsl(0 0% 5%)
    foreground: '#FAFAFA',       // hsl(0 0% 98%)
    card: '#141414',             // hsl(0 0% 8%)
    cardForeground: '#FAFAFA',
    primary: '#FA1818',          // hsl(0 95% 55%)
    primaryForeground: '#FFFFFF',
    secondary: '#1F1F1F',        // hsl(0 0% 12%)
    secondaryForeground: '#FAFAFA',
    muted: '#262626',            // hsl(0 0% 15%)
    mutedForeground: '#8C8C8C',  // hsl(0 0% 55%)
    accent: '#FF6633',           // hsl(15 100% 60%)
    accentForeground: '#0D0D0D',
    destructive: '#7F1D1D',
    destructiveForeground: '#FAFAFA',
    border: '#2E2E2E',           // hsl(0 0% 18%)
    input: '#2E2E2E',
    gradients: {
      primary: ['#FA1818', '#FF6633'],
      fire: ['#FF6633', '#FA1818', '#C41E1E'],
      dark: ['#0D0D0D', '#050505'],
      card: ['#1A1A1A', '#0F0F0F'],
    },
  },

  light: {
    background: '#F5F2EF',       // hsl(30 20% 96%)
    foreground: '#1A1A1A',       // hsl(0 0% 10%)
    card: '#FAF9F7',             // hsl(30 15% 98%)
    cardForeground: '#1A1A1A',
    primary: '#F20D0D',          // hsl(0 90% 50%)
    primaryForeground: '#FFFFFF',
    secondary: '#E8E5E2',        // hsl(30 10% 90%)
    secondaryForeground: '#262626',
    muted: '#EBE8E5',            // hsl(30 10% 92%)
    mutedForeground: '#666666',  // hsl(0 0% 40%)
    accent: '#FF571A',           // hsl(15 100% 55%)
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FAFAFA',
    border: '#D9D5D0',           // hsl(30 10% 85%)
    input: '#D9D5D0',
    gradients: {
      primary: ['#F20D0D', '#FF571A'],
      fire: ['#FF571A', '#F20D0D', '#C41E1E'],
      dark: ['#F5F2EF', '#EBE8E5'],
      card: ['#FDFCFB', '#F5F2EF'],
    },
  },

  shadows: {
    glow: 'rgba(250, 24, 24, 0.45)',
    fire: 'rgba(250, 24, 24, 0.35)',
    card: 'rgba(0, 0, 0, 0.5)',
    red: 'rgba(250, 24, 24, 0.15)',
  },
};
