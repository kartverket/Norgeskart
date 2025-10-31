import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Flex,
  Heading,
  Switch,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useThemeLayers } from '../../map/layers/themeLayers';
import { ThemeLayerName } from '../../map/layers/themeWMS';

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
  ];

  return (
    <>
      <Heading size="lg">Velg temakart </Heading>
      <Accordion collapsible multiple size="sm" variant="outline">
        {themeLayers.map((theme) => {
          return (
            <AccordionItem value={theme.name}>
              <AccordionItemTrigger>
                <Heading size="lg">{theme.heading}</Heading>
              </AccordionItemTrigger>
              <AccordionItemContent>
                {theme.subThemes.map((subTheme) => (
                  <>
                    <Heading size="md">{subTheme.heading}</Heading>
                    {subTheme.layers.map((layer) => (
                      <Flex
                        key={layer.name}
                        justifyContent="space-between"
                        paddingTop={2}
                      >
                        <Text>{layer.label}</Text>
                        <Switch
                          colorPalette="green"
                          size="sm"
                          variant="raised"
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
                  </>
                ))}
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};
