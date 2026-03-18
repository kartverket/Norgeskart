import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  toaster,
  VStack,
} from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom } from '../../../map/atoms';
import {
  activeThemeLayersAtom,
  preNauticalProjectionAtom,
} from '../../../map/layers/atoms';
import { backgroundLayerAtom } from '../../../map/layers/config/backgroundLayers/atoms';
import {
  getDirectLayersForCategory,
  getMainCategories,
  getSubcategories,
  themeLayerConfig,
} from '../../../map/layers/themeLayerConfigApi';
import {
  MAX_THEME_LAYERS,
  useThemeLayers,
} from '../../../map/layers/themeLayers';
import { ThemeLayerName } from '../../../map/layers/themeWMS';
import { LayerLine, SubThemeSection } from './SubTheme';
import { SubTheme, Theme } from './types';

export const MapThemes = () => {
  const { activeLayerSet, addThemeLayerToMap, removeThemeLayerFromMap } =
    useThemeLayers();
  const { t, i18n } = useTranslation();

  const activeCount = activeLayerSet.size;
  const showLimitWarning = activeCount >= MAX_THEME_LAYERS;

  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);

  const [, setPreNauticalProjection] = useAtom(preNauticalProjectionAtom);

  const currentProjection = useAtomValue(currentProjectionAtom);
  const setCurrentProjection = useSetAtom(currentProjectionAtom);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeThemeLayers, setActiveThemeLayers] = useAtom(
    activeThemeLayersAtom,
  );

  const isLayerChecked = useCallback(
    (layerName: ThemeLayerName): boolean => {
      return activeLayerSet.has(layerName);
    },
    [activeLayerSet],
  );

  const configThemeLayers = useMemo((): Theme[] => {
    const currentLang = i18n.language as 'nb' | 'nn' | 'en';
    const mainCategories = getMainCategories(themeLayerConfig);
    const result: Theme[] = [];

    mainCategories.forEach((mainCategory) => {
      const subcategories = getSubcategories(themeLayerConfig, mainCategory.id);
      const directLayers = getDirectLayersForCategory(
        themeLayerConfig,
        mainCategory.id,
      ).map((layer) => ({
        name: layer.id as ThemeLayerName,
        label: layer.name[currentLang] || layer.name.nb,
      }));

      if (subcategories.length > 0) {
        const subThemes: SubTheme[] = subcategories.map((subCategory) => {
          const layers = themeLayerConfig.layers.filter(
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
          directLayers,
        });
      } else {
        const layers = themeLayerConfig.layers.filter(
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
          directLayers,
        });
      }
    });

    return result;
  }, [themeLayerConfig, i18n.language]);

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

  const isSjoLayer = useCallback(
    (layerName: ThemeLayerName): boolean => {
      const layerDef = themeLayerConfig.layers.find((l) => l.id === layerName);
      if (!layerDef) return false;
      const category = themeLayerConfig.categories.find(
        (c) => c.id === layerDef.categoryId,
      );
      return category?.id === 'sjo' || category?.parentId === 'sjo';
    },
    [themeLayerConfig],
  );

  const toggleLayer = useCallback(
    (layerName: ThemeLayerName) => {
      const checked = isLayerChecked(layerName);
      if (!checked) {
        addThemeLayerToMap(layerName);
        if (isSjoLayer(layerName)) {
          if (backgroundLayer !== 'nautical-background') {
            if (currentProjection !== 'EPSG:3857') {
              setPreNauticalProjection(currentProjection);
              setBackgroundLayer('nautical-background'); // Set bg BEFORE projection so effect loads correct layer
              setCurrentProjection('EPSG:3857');
              toaster.create({
                title: t('map.settings.layers.projection.forcedWebMercator'),
                duration: 4000,
                type: 'info',
              });
            } else {
              setBackgroundLayer('nautical-background');

              toaster.create({
                title: t(
                  'map.settings.layers.theme.switchedToNauticalBackground',
                ),
                duration: 4000,
                type: 'info',
              });
            }
          } else {
            toaster.create({
              title: t(
                'map.settings.layers.theme.nauticalBackgroundAlreadyActive',
              ),
              duration: 4000,
              type: 'info',
            });
          }
        }
      } else {
        removeThemeLayerFromMap(layerName);
      }
    },
    [
      addThemeLayerToMap,
      removeThemeLayerFromMap,
      isLayerChecked,
      isSjoLayer,
      backgroundLayer,
      currentProjection,
      setPreNauticalProjection,
      setCurrentProjection,
      setBackgroundLayer,
      t,
    ],
  );

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
          <Button
            size={'sm'}
            visibility={activeThemeLayers.size > 0 ? 'visible' : 'hidden'}
            onClick={() => {
              setActiveThemeLayers(new Set());
            }}
          >
            {t('map.settings.layers.theme.resetbutton.text')}
          </Button>
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
        lazyMount
        unmountOnExit
      >
        {configThemeLayers.map((theme) => {
          const activeInCategory = getActiveCategoryCount(theme);
          const totalInCategory = getTotalCategoryLayers(theme);
          const defaultOpen =
            theme.subThemes.length === 1 && theme.directLayers.length === 0;

          return (
            <AccordionItem key={theme.name} value={theme.name}>
              <AccordionItemTrigger>
                <Flex
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Heading size={{ base: 'sm', md: 'md' }}>
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
                {theme.subThemes.map((subTheme) => (
                  <SubThemeSection
                    key={subTheme.name}
                    subTheme={subTheme}
                    toggleLayer={toggleLayer}
                    defaultOpen={defaultOpen}
                  />
                ))}
                {theme.directLayers.map((layer) => (
                  <LayerLine
                    key={layer.name}
                    toggleLayer={toggleLayer}
                    layer={layer}
                    checked={isLayerChecked(layer.name)}
                    disabled={
                      !isLayerChecked(layer.name) &&
                      activeCount >= MAX_THEME_LAYERS
                    }
                  />
                ))}
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VStack>
  );
};
