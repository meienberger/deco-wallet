import { Dimensions, PixelRatio, Platform } from 'react-native';
import { defaultTheme } from 'react-native-picasso';

const SMALLEST_DEVICE = 414;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / SMALLEST_DEVICE;

const fontSizes = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
};

const spacings = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const ANDROID_NORMALIZE_OFFSET = 2;

const normalize = (size: number): number => {
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - ANDROID_NORMALIZE_OFFSET;
};

const theme = {
  colors: {
    background: '#ffffff',
    primary: '#006bff',
    secondary: '#dedede',
    white: '#ffffff',
    border: '#333',
    card: '#efefef',
  },
  textColors: {
    accent: '#006bff',
    primary: '#333',
    placeholder: '#666666',
  },
  font: {
    family: 'Inter',
    sizes: {
      sm: normalize(fontSizes.sm),
      md: normalize(fontSizes.md),
      lg: normalize(fontSizes.lg),
      xl: normalize(fontSizes.xl),
      xxl: normalize(fontSizes.xxl),
    },
  },
  spacing: {
    sm: normalize(spacings.sm),
    md: normalize(spacings.md),
    lg: normalize(spacings.lg),
    xl: normalize(spacings.xl),
    xxl: normalize(spacings.xxl),
  },
  elevated: {
    ...defaultTheme.elevated,
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 6,
      width: 0,
    },
  },
  cell: {
    marginTop: -1,
  },
};

export { theme, normalize };
