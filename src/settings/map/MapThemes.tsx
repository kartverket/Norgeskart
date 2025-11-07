import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  useBreakpointValue,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useThemeLayers } from '../../map/layers/themeLayers';
import { ThemeLayerName } from '../../map/layers/themeWMS';
import { getListUrlParameter } from '../../shared/utils/urlUtils';

const BASE_THEME_MAP_KEY = 'map.settings.layers.mapNames.themeMaps';

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
export const MapThemes = () => {
  const { addThemeLayerToMap, removeThemeLayerFromMap } = useThemeLayers();
  const { t } = useTranslation();
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

  const isLayerChecked = (layerName: ThemeLayerName): boolean => {
    const urlLayers = getListUrlParameter('themeLayers');
    return urlLayers != null && urlLayers.includes(layerName);
  };

  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'horizontal',
    md: 'vertical',
  });

  return (
    <>
      <SimpleGrid>
        <Tabs
          colorPalette="green"
          defaultValue={themeLayers[0].name}
          orientation={orientation}
          size="md"
        >
          <TabsList>
            {themeLayers.map((theme) => (
              <TabsTrigger key={theme.name} value={theme.name}>
                {theme.heading}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Tabs content (subthemes and layers*/}
          <Box flex="1">
            {themeLayers.map((theme) => (
              <TabsContent key={theme.name} value={theme.name}>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  gap={{ base: 0, md: 8 }}
                >
                  {theme.subThemes.map((subTheme) => (
                    <Box key={subTheme.name} marginBottom={6}>
                      <Heading size="md" marginBottom={2}>
                        {subTheme.heading}
                      </Heading>
                      {subTheme.layers.map((layer) => (
                        <Flex
                          key={layer.name}
                          justifyContent="space-between"
                          alignItems="center"
                          paddingY={2}
                        >
                          <Text>{layer.label}</Text>
                          <Switch
                            colorPalette="green"
                            size="sm"
                            marginLeft={3}
                            variant="solid"
                            defaultChecked={isLayerChecked(layer.name)}
                            onCheckedChange={(e) => {
                              if (e.checked) {
                                addThemeLayerToMap(layer.name);
                              } else {
                                removeThemeLayerFromMap(layer.name);
                              }
                            }}
                          />
                        </Flex>
                      ))}
                    </Box>
                  ))}
                </SimpleGrid>
              </TabsContent>
            ))}
          </Box>
        </Tabs>
      </SimpleGrid>
    </>
  );
};
