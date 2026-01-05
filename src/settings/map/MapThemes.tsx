import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Alert,
  Box,
  Flex,
  Heading,
  Switch,
  Text,
  VStack,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getMainCategories,
  getSubcategories,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { MAX_THEME_LAYERS, useThemeLayers } from '../../map/layers/themeLayers';
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
export const MapThemes = () => {
  const { activeLayerSet, addThemeLayerToMap, removeThemeLayerFromMap } =
    useThemeLayers();
  const { t, i18n } = useTranslation();
  const configLoadable = useAtomValue(themeLayerConfigLoadableAtom);
  const activeCount = activeLayerSet.size;
  const showLimitWarning = activeCount >= MAX_THEME_LAYERS;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isLayerChecked = useCallback(
    (layerName: ThemeLayerName): boolean => {
      return activeLayerSet.has(layerName);
    },
    [activeLayerSet],
  );

  const configThemeLayers = useMemo((): Theme[] => {
    if (configLoadable.state !== 'hasData') {
      return [];
    }

    const config = configLoadable.data;
    const currentLang = i18n.language as 'nb' | 'nn' | 'en';
    const mainCategories = getMainCategories(config);
    const result: Theme[] = [];

    mainCategories.forEach((mainCategory) => {
      const subcategories = getSubcategories(config, mainCategory.id);

      if (subcategories.length > 0) {
        const subThemes: SubTheme[] = subcategories.map((subCategory) => {
          const layers = config.layers.filter(
            (layer) => layer.categoryId === subCategory.id,
          );
          return {
            name: subCategory.id,
            heading: subCategory.name[currentLang] || subCategory.name.nb,
            layers: layers.map((layer) => ({
              name: layer.id as ThemeLayerName,
              label: layer.name[currentLang] || layer.name.nb,
            })),
          };
        });

        result.push({
          name: mainCategory.id,
          heading: mainCategory.name[currentLang] || mainCategory.name.nb,
          subThemes,
        });
      } else {
        const layers = config.layers.filter(
          (layer) => layer.categoryId === mainCategory.id,
        );
        result.push({
          name: mainCategory.id,
          heading: mainCategory.name[currentLang] || mainCategory.name.nb,
          subThemes: [
            {
              name: mainCategory.id,
              heading: mainCategory.name[currentLang] || mainCategory.name.nb,
              layers: layers.map((layer) => ({
                name: layer.id as ThemeLayerName,
                label: layer.name[currentLang] || layer.name.nb,
              })),
            },
          ],
        });
      }
    });

    return result;
  }, [configLoadable, i18n.language]);

  const getActiveCategoryCount = useCallback(
    (theme: Theme): number => {
      return theme.subThemes.reduce((count, subTheme) => {
        return (
          count +
          subTheme.layers.filter((layer) => isLayerChecked(layer.name)).length
        );
      }, 0);
    },
    [isLayerChecked],
  );

  const getTotalCategoryLayers = useCallback((theme: Theme): number => {
    return theme.subThemes.reduce((count, subTheme) => {
      return count + subTheme.layers.length;
    }, 0);
  }, []);

  return (
    <VStack gap={0} align="stretch">
      <Box marginBottom={0}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text
            fontSize="sm"
            colorPalette={
              activeCount >= MAX_THEME_LAYERS
                ? 'red'
                : activeCount >= MAX_THEME_LAYERS * 0.8
                  ? 'orange'
                  : 'gray'
            }
          >
            {t('map.settings.layers.theme.activeLayersCount')}: {activeCount} /{' '}
            {MAX_THEME_LAYERS}
          </Text>
        </Flex>
        {showLimitWarning && (
          <Alert status="warning" marginTop={2}>
            <Text fontSize="sm">
              {t('map.settings.layers.theme.warningLimit')}
            </Text>
          </Alert>
        )}
        {activeCount >= MAX_THEME_LAYERS * 0.7 && !showLimitWarning && (
          <Alert status="info" marginTop={2}>
            <Text fontSize="sm">
              {t('map.settings.layers.theme.warningPerformance')}
            </Text>
          </Alert>
        )}
      </Box>

      <Accordion
        collapsible
        multiple
        size="sm"
        variant="outline"
        value={expandedItems}
        onValueChange={(details) => setExpandedItems(details.value)}
      >
        {configThemeLayers.map((theme) => {
          const activeInCategory = getActiveCategoryCount(theme);
          const totalInCategory = getTotalCategoryLayers(theme);
          const isExpanded = expandedItems.includes(theme.name);

          return (
            <AccordionItem key={theme.name} value={theme.name}>
              <AccordionItemTrigger>
                <Flex
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Heading size={{ base: 'sm', md: 'lg' }}>
                    {theme.heading}
                  </Heading>
                  {activeInCategory > 0 && (
                    <Text fontSize="sm" colorPalette="green" marginLeft={2}>
                      ({activeInCategory}/{totalInCategory})
                    </Text>
                  )}
                </Flex>
              </AccordionItemTrigger>
              <AccordionItemContent>
                {isExpanded &&
                  theme.subThemes.map((subTheme) => (
                    <Box key={subTheme.name} marginBottom={4}>
                      <Heading
                        fontWeight={'600'}
                        size={{ base: 'sm', md: 'md' }}
                      >
                        {subTheme.heading}
                      </Heading>
                      {subTheme.layers.map((layer) => (
                        <Flex
                          key={layer.name}
                          justifyContent="space-between"
                          paddingTop={2}
                        >
                          <Text fontSize={{ base: 'sm', md: 'md' }}>
                            {layer.label}
                          </Text>
                          <Switch
                            colorPalette="green"
                            size="sm"
                            variant="raised"
                            checked={isLayerChecked(layer.name)}
                            disabled={
                              !isLayerChecked(layer.name) &&
                              activeCount >= MAX_THEME_LAYERS
                            }
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
    </VStack>
  );
};
