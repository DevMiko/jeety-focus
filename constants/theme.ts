// ─── Jeety Focus Design Tokens ────────────────────────────────────────────────

export const Colors = {
  // Brand
  blue: '#003D7A',
  blueDark: '#002d5c',
  pink: '#E6007E',
  green: '#00965E',
  orange: '#FFA459',

  // Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',

  // Semantic
  white: '#ffffff',
  black: '#000000',
  error: '#dc3545',

  // Badge colors
  pacBg: '#e0f2fe',
  pacText: '#0369a1',
  ballonBg: '#fce7f3',
  ballonText: '#be185d',
  isolationBg: '#fef3c7',
  isolationText: '#b45309',
  chaudiereBg: '#dcfce7',
  chaudiereText: '#15803d',
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const Radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  round: 50,
};

export const FontSize = {
  xs: 9,
  sm: 10,
  base: 11,
  md: 12,
  lg: 13,
  xl: 14,
  '2xl': 16,
  '3xl': 18,
  '4xl': 20,
  '5xl': 26,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Compatibility shim for Expo starter template files
export const Fonts = {
  SpaceMono: 'SpaceMono',
  mono: 'SpaceMono',
  rounded: undefined as string | undefined,
};
