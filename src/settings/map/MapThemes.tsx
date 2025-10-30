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

type ThemeCategory = {
  name: string;
  heading: string;
  subHeading: string;
  layers: {
    name: ThemeLayerName;
    label: string;
  }[];
};

export const MapThemes = () => {
  const { addThemeLayersToMap, removeThemeLayerFromMap } = useThemeLayers();
  const { t } = useTranslation();
  const createThemeCategory = (themeName: string, layers: ThemeLayerName[]) => {
    return {
      name: themeName,
      heading: t(
        `map.settings.layers.mapNames.themeMaps.${themeName}.categoryName`,
      ),
      subHeading: t(
        `map.settings.layers.mapNames.themeMaps.${themeName}.heading`,
      ),
      layers: layers.map((layer) => ({
        name: layer,
        label: t(
          `map.settings.layers.mapNames.themeMaps.${themeName}.layers.${layer}`,
        ),
      })),
    };
  };
  const themeLayers: ThemeCategory[] = [
    createThemeCategory('property', ['adresses', 'buildings', 'parcels']),
    //createThemeCategory('outdoors', ['adresses', 'buildings', 'parcels']), Legge til senere
  ];

  return (
    <>
      <Heading size="lg">Velg temakart </Heading>
      <Accordion collapsible multiple size="sm" variant="outline">
        {themeLayers.map((category) => {
          return (
            <AccordionItem value={category.name}>
              <AccordionItemTrigger>
                <Heading size="lg">{category.heading}</Heading>
              </AccordionItemTrigger>
              <AccordionItemContent>
                <Heading size="md">{category.subHeading}</Heading>
                {category.layers.map((layer) => (
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
                          addThemeLayersToMap(layer.name);
                        } else {
                          removeThemeLayerFromMap(layer.name);
                        }
                      }}
                    />
                  </Flex>
                ))}
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};
