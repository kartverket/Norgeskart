import { ThemeLayerName } from '../../../map/layers/themeWMS';

export type Theme = {
  name: string;
  heading: string;
  subThemes: SubTheme[];
};

export type SubTheme = {
  name: string;
  heading: string;
  layers: SubThemeLayer[];
  disableToggleAll?: boolean;
};

export type SubThemeLayer = {
  name: ThemeLayerName;
  label: string;
};
