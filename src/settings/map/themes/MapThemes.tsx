import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Alert,
  Flex,
  Heading,
  Text,
  VStack,
} from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { backgroundLayerAtom } from '../../../map/layers/config/backgroundLayers/atoms';
import {
  getDirectLayersForCategory,
  getMainCategories,
  getSubcategories,
  themeLayerConfig,
} from '../../../map/layers/themeLayerConfigApi';
import {
  WARNING_THRESHOLD,
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
  const showLimitWarning = activeCount >= WARNING_THRESHOLD;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isLayerChecked = useCallback(
    (layerName: ThemeLayerName): boolean => {
      return activeLayerSet.has(layerName);
    },
    [activeLayerSet],
  );

  const isSjoLayer = (layerName: ThemeLayerName): boolean => {
    const layerDef = themeLayerConfig.layers.find((l) => l.id === layerName);
    if (!layerDef) return false;
    const category = themeLayerConfig.categories.find(
      (c) => c.id === layerDef.categoryId,
    );
    return category?.id === 'sjo' || category?.parentId === 'sjo';
  };

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
        notReady: layer.notReady,
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
              notReady: layer.notReady,
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
        result.push({
          name: mainCategory.id,
          heading: mainCategory.name[currentLang] || mainCategory.name.nb,
          subThemes: [],
          directLayers,
        });
      }
    });

    return result;
  }, [i18n.language]);

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

  const toggleLayer = useCallback(
    (layerName: ThemeLayerName) => {
      const checked = isLayerChecked(layerName);
      if (!checked) {
        addThemeLayerToMap(layerName);

        if (isSjoLayer(layerName)) {
          const store = getDefaultStore();
          const currentBakground = store.get(backgroundLayerAtom);

          if (currentBakground !== 'nautical-background') {
            store.set(backgroundLayerAtom, 'nautical-background');
          }
        }
      } else {
        removeThemeLayerFromMap(layerName);
      }
    },
    [addThemeLayerToMap, removeThemeLayerFromMap, isLayerChecked],
  );

  return (
    <VStack gap={0} align="stretch">
      {showLimitWarning && (
        <Alert status="info" marginTop={2}>
          <Text fontSize="sm">
            {t('map.settings.layers.theme.warningPerformance')}
          </Text>
        </Alert>
      )}

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
                      activeCount >= WARNING_THRESHOLD
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
