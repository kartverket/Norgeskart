import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  Flex,
  Heading,
  Switch,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { useThemeLayers } from '../../map/layers/themeLayers';
import { ThemeLayerName } from '../../map/layers/themeWMS';
import { getListUrlParameter } from '../../shared/utils/urlUtils';
import { useMapThemes } from './mapThemeHooks';

export const MapThemes = () => {
  const { addThemeLayerToMap, removeThemeLayerFromMap } = useThemeLayers();
  const { t } = useTranslation();

  const isLayerChecked = (layerName: ThemeLayerName): boolean => {
    const urlLayers = getListUrlParameter('themeLayers');
    return urlLayers != null && urlLayers.includes(layerName);
  };

  const themeLayers = useMapThemes().themeLayers;

  return (
    <>
      <Heading size="lg">{t('map.settings.layers.theme.label')} </Heading>
      <Accordion collapsible multiple size="sm" variant="outline">
        {themeLayers.map((theme) => {
          return (
            <AccordionItem key={theme.name} value={theme.name}>
              <AccordionItemTrigger>
                <Heading size="lg">{theme.heading}</Heading>
              </AccordionItemTrigger>
              <AccordionItemContent>
                {theme.subThemes.map((subTheme) => (
                  <Box key={subTheme.name} marginBottom={4}>
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
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};
