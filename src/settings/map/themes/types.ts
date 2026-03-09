import { ThemeLayerName } from '../../../map/layers/themeWMS';

export type Theme = {
  name: string;
  heading: string;
  subThemes: SubTheme[];
};

export type SubTheme = {
  name: string;
  heading: string;
  layers: {
    name: ThemeLayerName;
    label: string;
  }[];
  disableToggleAll?: boolean;
};
