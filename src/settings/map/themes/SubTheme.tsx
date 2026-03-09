import { Box, Flex, Heading, Switch, Text, Tooltip } from '@kvib/react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MAX_THEME_LAYERS,
  useThemeLayers,
} from '../../../map/layers/themeLayers';
import { ThemeLayerName } from '../../../map/layers/themeWMS';
import { SubTheme } from './types';

export const SubThemeSection = ({
  subTheme,
  toggleLayer,
}: {
  subTheme: SubTheme;
  toggleLayer: (layerName: ThemeLayerName) => void;
}) => {
  const { activeLayerSet, addThemeLayerToMap, removeThemeLayerFromMap } =
    useThemeLayers();

  const { t } = useTranslation();
  const id = useId();
  const subthemeLayerNames = subTheme.layers.map((layer) => layer.name);
  const activeCount = activeLayerSet.size;

  const activeInSubTheme = Array.from(activeLayerSet.values()).filter(
    (layerName) => subTheme.layers.some((layer) => layer.name === layerName),
  ).length;
  const totalInSubTheme = subTheme.layers.length;
  const isLayerChecked = (layerName: ThemeLayerName) =>
    activeLayerSet.has(layerName);

  return (
    <Box key={subTheme.name} marginBottom={4}>
      <Flex justify={'space-between'}>
        <Heading fontWeight={'600'} size={{ base: 'xs', md: 'sm' }}>
          {subTheme.heading}
        </Heading>
        {subTheme.disableToggleAll || totalInSubTheme === 1 ? null : (
          <Tooltip
            content={
              activeInSubTheme === totalInSubTheme
                ? t('map.settings.layers.theme.subtheme.toggleall.removeall')
                : t('map.settings.layers.theme.subtheme.toggleall.addall')
            }
            ids={{ trigger: id }}
          >
            <Switch
              colorPalette="green"
              size="xs"
              checked={activeInSubTheme === totalInSubTheme}
              ids={{ root: id }}
              onCheckedChange={(e) => {
                if (e.checked) {
                  addThemeLayerToMap(subthemeLayerNames);
                } else {
                  removeThemeLayerFromMap(subthemeLayerNames);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Tooltip>
        )}
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
