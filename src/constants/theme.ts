import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const VERDE_CAMPO = '#1B5E20';
const VERDE_CAMPO_CLARO = '#66BB6A';
const DOURADO = '#F9A825';

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: VERDE_CAMPO,
    secondary: DOURADO,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: VERDE_CAMPO_CLARO,
    secondary: DOURADO,
  },
};
