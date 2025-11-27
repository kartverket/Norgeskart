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
  Alert,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getMainCategories,
  getSubcategories,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import {
  MAX_THEME_LAYERS,
  useThemeLayers,
} from '../../map/layers/themeLayers';
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
  const { addThemeLayerToMap, removeThemeLayerFromMap, getActiveThemeLayerCount } =
    useThemeLayers();
  const { t, i18n } = useTranslation();
  const configLoadable = useAtomValue(themeLayerConfigLoadableAtom);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const count = getActiveThemeLayerCount();
    setActiveCount(count);
    setShowLimitWarning(count >= MAX_THEME_LAYERS);
  }, [getActiveThemeLayerCount]);

  const updateActiveCount = () => {
    const count = getActiveThemeLayerCount();
    setActiveCount(count);
    setShowLimitWarning(count >= MAX_THEME_LAYERS);
  };

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

  const hardcodedThemeLayers = [
    createTheme('property', [
      {
        name: 'matrikkeldata',
        layerNames: ['adresses', 'buildings', 'parcels'],
      },
    ]),
    createTheme('locations', [
      {
        name: 'historicalMaps',
        layerNames: ['economicMapFirstEdition', 'amtMap'],
      },
    ]),
  ];

  const configThemeLayers: Theme[] = [];
  if (configLoadable.state === 'hasData') {
    const config = configLoadable.data;
    const currentLang = i18n.language as 'nb' | 'nn' | 'en';
    const mainCategories = getMainCategories(config);

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

        configThemeLayers.push({
          name: mainCategory.id,
          heading: mainCategory.name[currentLang] || mainCategory.name.nb,
          subThemes,
        });
      } else {
        const layers = config.layers.filter(
          (layer) => layer.categoryId === mainCategory.id,
        );
        configThemeLayers.push({
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
  }

  const themeLayers = [...hardcodedThemeLayers, ...configThemeLayers];

  const isLayerChecked = (layerName: ThemeLayerName): boolean => {
    const urlLayers = getListUrlParameter('themeLayers');
    return urlLayers != null && urlLayers.includes(layerName);
  };

  const getActiveCategoryCount = (theme: Theme): number => {
    return theme.subThemes.reduce((count, subTheme) => {
      return count + subTheme.layers.filter(layer => isLayerChecked(layer.name)).length;
    }, 0);
  };

  const getTotalCategoryLayers = (theme: Theme): number => {
    return theme.subThemes.reduce((count, subTheme) => {
      return count + subTheme.layers.length;
    }, 0);
  };

  return (
    <>
      <Heading size="lg">{t('map.settings.layers.theme.label')} </Heading>
      <Box marginBottom={4} marginTop={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" colorPalette={activeCount >= MAX_THEME_LAYERS ? 'red' : activeCount >= MAX_THEME_LAYERS * 0.8 ? 'orange' : 'gray'}>
            {t('map.settings.layers.theme.activeLayersCount')}: {activeCount} / {MAX_THEME_LAYERS}
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
      
      <Accordion collapsible multiple size="sm" variant="outline">
        {themeLayers.map((theme) => {
          const activeInCategory = getActiveCategoryCount(theme);
          const totalInCategory = getTotalCategoryLayers(theme);
          
          return (
            <AccordionItem key={theme.name} value={theme.name}>
              <AccordionItemTrigger>
                <Flex justifyContent="space-between" width="100%" alignItems="center">
                  <Heading size="lg">{theme.heading}</Heading>
                  {activeInCategory > 0 && (
                    <Text fontSize="sm" colorPalette="green" marginLeft={2}>
                      ({activeInCategory}/{totalInCategory})
                    </Text>
                  )}
                </Flex>
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
                          disabled={!isLayerChecked(layer.name) && activeCount >= MAX_THEME_LAYERS}
                          onCheckedChange={(e) => {
                            if (e.checked) {
                              const success = addThemeLayerToMap(layer.name);
                              if (success) {
                                updateActiveCount();
                              } else {
                                e.checked = false;
                              }
                            } else {
                              removeThemeLayerFromMap(layer.name);
                              updateActiveCount();
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
