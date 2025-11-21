import { useTranslation } from 'react-i18next';
import { ThemeLayerName } from '../../map/layers/themeWMS';

type Theme = {
  name: string;
  heading: string;
  subThemes: SubTheme[];
};

type SubTheme = {
  name: string;
  heading: string;
  layers: {
    name: ThemeLayerName;
    label: string;
  }[];
};

export const useMapThemes = () => {
  const { t } = useTranslation();
  const BASE_THEME_MAP_KEY = 'map.settings.layers.mapNames.themeMaps';
  const createTheme = (
    themeName: string,
    subCategories: { name: string; layerNames: string[] }[],
  ): Theme => {
    return {
      name: themeName,
      heading: t(`${BASE_THEME_MAP_KEY}.${themeName}.themeName`),
      subThemes: subCategories.map((subTheme) => ({
        name: subTheme.name,
        heading: t(
          `${BASE_THEME_MAP_KEY}.${themeName}.subThemes.${subTheme.name}.heading`,
        ),
        layers: subTheme.layerNames.map((layerName) => ({
          name: layerName as ThemeLayerName,
          label: t(
            `${BASE_THEME_MAP_KEY}.${themeName}.subThemes.${subTheme.name}.layers.${layerName}`,
          ),
        })),
      })),
    };
  };

  const themeLayers = [
    createTheme('property', [
      {
        name: 'matrikkeldata',
        layerNames: ['adresses', 'buildings', 'parcels'],
      },
    ]),
    createTheme('outdoorsLife', [
      { name: 'norwayFacts', layerNames: ['osloMarkaBorder'] },
      {
        name: 'trails',
        layerNames: [
          'hikingTrails',
          'skiingTrails',
          'routeInfoPoints',
          'bikeTrails',
          'waterTrails',
        ],
      },
    ]),
    createTheme('locations', [
      {
        name: 'historicalMaps',
        layerNames: ['economicMapFirstEdition', 'amtMap'],
      },
    ]),
  ];
  return { themeLayers };
};
