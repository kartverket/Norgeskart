import { ThemeLayerName } from '../../../map/layers/themeWMS';

export type Theme = {
  name: string;
  heading: string;
  subThemes: SubTheme[];
  directLayers: ThemeLayer[];
};

export type SubTheme = {
  name: string;
  heading: string;
  layers: ThemeLayer[];
  disableToggleAll?: boolean;
};

export type ThemeLayer = {
  name: ThemeLayerName;
  label: string;
};
