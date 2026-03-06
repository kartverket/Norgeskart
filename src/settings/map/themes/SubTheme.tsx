import { Box, Flex, Heading, Switch, Text, toaster } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { themeLayerConfigAtom } from '../../../api/themeLayerConfigApi';
import {
  activeBackgroundLayerAtom,
  preNauticalProjectionAtom,
} from '../../../map/layers/atoms';
import {
  MAX_THEME_LAYERS,
  useThemeLayers,
} from '../../../map/layers/themeLayers';
import { ThemeLayerName } from '../../../map/layers/themeWMS';
import { useMapSettings } from '../../../map/mapHooks';
import { SubTheme } from './types';

export const SubThemeSection = ({ subTheme }: { subTheme: SubTheme }) => {
  const { activeLayerSet, addThemeLayerToMap, removeThemeLayerFromMap } =
    useThemeLayers();
  const { t } = useTranslation();
  const themeConfig = useAtomValue(themeLayerConfigAtom);
  const activeCount = activeLayerSet.size;

  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const setActiveBackgroundLayer = useSetAtom(activeBackgroundLayerAtom);
  const [, setPreNauticalProjection] = useAtom(preNauticalProjectionAtom);
  const { setBackgroundLayer, setProjection, getMapProjectionCode } =
    useMapSettings();
  const ph = usePostHog();

  const activeInSubTheme = subTheme.layers.filter((layer) =>
    activeLayerSet.has(layer.name),
  ).length;
  const totalInSubTheme = subTheme.layers.length;
  const isLayerChecked = (layerName: ThemeLayerName) =>
    activeLayerSet.has(layerName);

  const isSjoLayer = useCallback(
    (layerName: ThemeLayerName): boolean => {
      const layerDef = themeConfig.layers.find((l) => l.id === layerName);
      if (!layerDef) return false;
      const category = themeConfig.categories.find(
        (c) => c.id === layerDef.categoryId,
      );
      return category?.id === 'sjo' || category?.parentId === 'sjo';
    },
    [themeConfig],
  );

  const toggleLayer = useCallback(
    async (layerName: ThemeLayerName) => {
      const checked = isLayerChecked(layerName);
      if (!checked) {
        addThemeLayerToMap(layerName);
        ph.capture('theme_layer_added', {
          layerName,
        });
        if (isSjoLayer(layerName)) {
          if (activeBackgroundLayer !== 'nautical-background') {
            if (getMapProjectionCode() !== 'EPSG:3857') {
              setPreNauticalProjection(getMapProjectionCode());
              await setProjection('EPSG:3857');
              toaster.create({
                title: t('map.settings.layers.projection.forcedWebMercator'),
                duration: 4000,
                type: 'info',
              });
            } else {
              toaster.create({
                title: t(
                  'map.settings.layers.theme.switchedToNauticalBackground',
                ),
                duration: 4000,
                type: 'info',
              });
            }
            setBackgroundLayer('nautical-background');
            setActiveBackgroundLayer('nautical-background');
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
      ph,
      isSjoLayer,
      activeBackgroundLayer,
      getMapProjectionCode,
      setPreNauticalProjection,
      setProjection,
      setBackgroundLayer,
      setActiveBackgroundLayer,
      t,
    ],
  );

  return (
    <Box key={subTheme.name} marginBottom={4}>
      <Flex>
        <Heading fontWeight={'600'} size={{ base: 'xs', md: 'sm' }}>
          {subTheme.heading}
        </Heading>
        <Switch //skjul denne hvis bare noen er valgt? egentlig hør hva som er tanken her....
          colorPalette="green"
          size="xs"
          checked={activeInSubTheme === totalInSubTheme}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(subTheme);
            const allLayerNames = subTheme.layers.map((layer) => layer.name);

            if (activeInSubTheme !== totalInSubTheme) {
              allLayerNames.forEach((name) => addThemeLayerToMap(name));
            } else {
              allLayerNames.filter(isLayerChecked).forEach(
                (name) => {
                  removeThemeLayerFromMap(name);
                }, // sjekk hvilke som er er på før de fjernes
              );
            }
          }}
        />
      </Flex>
      {subTheme.layers.map((layer) => (
        <Flex
          key={layer.name}
          justifyContent="space-between"
          paddingTop={2}
          onClick={() => toggleLayer(layer.name)}
          cursor="pointer"
        >
          <Text fontSize={{ base: 'xs', md: 'sm' }}>{layer.label}</Text>
          <Switch
            colorPalette="green"
            size="xs"
            checked={isLayerChecked(layer.name)}
            disabled={
              !isLayerChecked(layer.name) && activeCount >= MAX_THEME_LAYERS
            }
          />
        </Flex>
      ))}
    </Box>
  );
};
