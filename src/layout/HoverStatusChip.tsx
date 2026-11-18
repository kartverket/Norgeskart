import { Box, Button, Flex, Text, Tooltip } from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { activeThemeLayersAtom } from '../map/layers/atoms';
import {
  activeVectorEntries,
  entryColor,
} from '../map/layers/config/themeLayers/vectorData';
import { userStylesAtom } from '../map/layers/userStyles';
import {
  hoverAvailableAtom,
  hoverStatusAtom,
  mapToolAtom,
} from '../map/overlay/atoms';

// What can be pointed at right now. Replaces the old global hover switch: what's
// hoverable is chosen in Kartdetaljer, and this says what that choice gives.
export const HoverStatusChip = () => {
  const { t, i18n } = useTranslation();
  const available = useAtomValue(hoverAvailableAtom);
  const status = useAtomValue(hoverStatusAtom);
  const activeThemeLayers = useAtomValue(activeThemeLayersAtom);
  const userStyles = useAtomValue(userStylesAtom);
  const setMapTool = useSetAtom(mapToolAtom);
  if (!available) return null;

  const lang = (i18n.language as 'nb' | 'nn' | 'en') ?? 'nb';
  const entries = activeVectorEntries(activeThemeLayers);
  const openLayers = () => setMapTool('layers');

  if (entries.length === 0) {
    return (
      <Tooltip content={t('map.hover.chip.startDescription')}>
        <Button
          rightIcon="ads_click"
          variant="ghost"
          colorPalette="green"
          size="sm"
          onClick={openLayers}
        >
          {t('map.hover.chip.start')}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t('map.hover.chip.description')}>
      <Flex
        as="button"
        onClick={openLayers}
        alignItems="center"
        gap={2}
        px={2}
        py={1}
        borderRadius="md"
        cursor="pointer"
        _hover={{ backgroundColor: '#D0ECD6' }}
        aria-label={t('map.hover.chip.description')}
      >
        <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
          {t('map.hover.chip.label')}
        </Text>
        {entries.map((entry) => {
          const inZoom = entry.hoverGroups.some((group) => status[group]);
          return (
            <Flex
              key={entry.id}
              alignItems="center"
              gap={1}
              opacity={inZoom ? 1 : 0.45}
            >
              <Box
                width="10px"
                height="10px"
                borderRadius="full"
                backgroundColor={entryColor(entry, userStyles[entry.id])}
                flex="none"
              />
              <Text fontSize="sm" whiteSpace="nowrap">
                {entry.short[lang] || entry.short.nb}
                {!inZoom && ` (${t('map.hover.chip.zoomIn')})`}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Tooltip>
  );
};
