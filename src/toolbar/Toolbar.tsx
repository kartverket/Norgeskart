import {
  Box,
  Button,
  Flex,
  IconButton,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  Text,
  Tooltip,
} from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { MapBrowserEvent } from 'ol';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  displayCompassOverlayAtom,
  displayMapLegendAtom,
  displayMapLegendControlAtom,
  mapAtom,
  scaleToResolutionEffect,
  useMagneticNorthAtom,
} from '../map/atoms';
import { isRettIKartetDialogOpenAtom } from '../map/menu/dialogs/atoms';
import { ProjectionSettings } from '../settings/map/ProjectionSettings';
import { ScaleSelector } from './ScaleSelector';

const formatCoords = (coord: [number, number] | null, crsCode: string) => {
  if (!coord) return '';
  if (crsCode === 'EPSG:3857') {
    return `${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}`;
  } else {
    return `N: ${coord[1].toFixed(2)}, Ø: ${coord[0].toFixed(2)}`;
  }
};

export const Toolbar = () => {
  const { t } = useTranslation();
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const setDisplayMapLegend = useSetAtom(displayMapLegendAtom);
  const displayMapLegendControl = useAtomValue(displayMapLegendControlAtom);
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);
  const [mousePositionCoords, setMousePositionCoords] = useState<
    [number, number] | null
  >(null);
  const map = useAtomValue(mapAtom);
  useAtom(scaleToResolutionEffect);

  const crsCode = map.getView().getProjection().getCode();

  useEffect(() => {
    if (!map) return;
    const handler = (evt: MapBrowserEvent) => {
      if (evt.coordinate) {
        setMousePositionCoords([evt.coordinate[0], evt.coordinate[1]]);
      }
    };
    map.on('pointermove', handler);
    return () => {
      map.un('pointermove', handler);
    };
  }, [map]);

  return (
    <Flex
      width="100%"
      height={10}
      bg="#156630"
      w={'100%'}
      p={2}
      zIndex={10}
      pointerEvents={'auto'}
    >
      <Flex alignItems="center" flex="1">
        <Tooltip content={t('map.settings.compass.enabled')}>
          <IconButton
            icon="explore"
            variant="tertiary"
            color="white"
            onClick={() => setDisplayCompassOverlay(!displayCompassOverlay)}
          ></IconButton>
        </Tooltip>
        <Tooltip content={t('map.settings.compass.magneticNorth')}>
          <Box pr={2}>
            <SwitchRoot
              checked={useMagneticNorth}
              size="xs"
              colorPalette="gray"
              onCheckedChange={(e) => setUseMagneticNorth(e.checked)}
              disabled={!displayCompassOverlay}
            >
              <SwitchHiddenInput />
              <SwitchControl />
            </SwitchRoot>
          </Box>
        </Tooltip>
        <ProjectionSettings />
      </Flex>
      <Flex justify="center" alignItems="center" gap={4} color="white">
        <Tooltip content={t('toolbar.coordinates.tooltip')}>
          <Text fontSize="sm">
            {mousePositionCoords
              ? formatCoords(mousePositionCoords, crsCode)
              : ''}
          </Text>
        </Tooltip>
        <ScaleSelector />
      </Flex>
      <Flex flex="1" justify="flex-end" alignItems="center">
        {displayMapLegendControl && (
          <Tooltip content={t('toolbar.legend.tooltip')}>
            <Button
              variant="plain"
              color="white"
              size="sm"
              onClick={() => setDisplayMapLegend(true)}
            >
              {t('toolbar.legend.label')}
            </Button>
          </Tooltip>
        )}
        <Tooltip content={t('toolbar.reportError.tooltip')}>
          <Button
            variant="plain"
            color="white"
            size="sm"
            onClick={() => setRettIKartetDialogOpen(true)}
          >
            {t('toolbar.reportError.label')}
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
