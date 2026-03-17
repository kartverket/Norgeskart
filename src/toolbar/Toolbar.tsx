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
import { usePostHog } from '@posthog/react';
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { MapBrowserEvent } from 'ol';
import { transform } from 'ol/proj';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
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
import { getUrlParameter } from '../shared/utils/urlUtils';
import { ScaleSelector } from './ScaleSelector';

const formatCoords = (
  coord: [number, number] | null,
  crsCode: string,
  translate: (key: string) => string,
) => {
  if (!coord) return '';
  if (crsCode === 'EPSG:3857') {
    return `${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}`;
  } else {
    return `${translate('toolbar.coordinates.east')}: ${coord[0].toFixed(2)}, ${translate('toolbar.coordinates.north')}: ${coord[1].toFixed(2)}`;
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
  const ph = usePostHog();

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
      overflow={'hidden'}
      justify={'space-between'}
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
              ? formatCoords(mousePositionCoords, crsCode, t)
              : ''}
          </Text>
        </Tooltip>
        <ScaleSelector />
      </Flex>
      <Flex justify="flex-end" alignItems="center" h={'100%'} flex={1}>
        {displayMapLegendControl && (
          <Tooltip content={t('toolbar.legend.tooltip')}>
            <Button
              variant="plain"
              color="white"
              size="sm"
              onClick={() => {
                ph.capture('toolbar_legend_clicked');
                setDisplayMapLegend(true);
              }}
            >
              {t('toolbar.legend.label')}
            </Button>
          </Tooltip>
        )}
        <Tooltip content={t('toolbar.oldnorgeskartbutton.tooltip')}>
          <Button
            leftIcon="open_in_new"
            variant="plain"
            color="white"
            size="sm"
            onClick={() => {
              const x = Number.parseFloat(
                getUrlParameter('lon') || '396722.00',
              );
              const y = Number.parseFloat(
                getUrlParameter('lat') || '7197864.00',
              );
              const z = Number.parseFloat(getUrlParameter('zoom') || '3');
              const store = getDefaultStore();
              const currentProjection = store
                .get(mapAtom)
                .getView()
                .getProjection()
                .getCode();
              const transformedCoords = transform(
                [x, y],
                currentProjection,
                'EPSG:25833',
              );
              const url = `https://arkiv.norgeskart.no/#!?project=norgeskart&zoom=${z}&lat=${transformedCoords[1]}&lon=${transformedCoords[0]}`;
              window.open(url, '_blank');
            }}
          >
            {t('toolbar.oldnorgeskartbutton.content')}
          </Button>
        </Tooltip>
        <Tooltip content={t('toolbar.reportError.tooltip')}>
          <Button
            variant="plain"
            color="white"
            size="sm"
            onClick={() => {
              ph.capture('toolbar_report_error_clicked');
              setRettIKartetDialogOpen(true);
            }}
          >
            {t('toolbar.reportError.label')}
          </Button>
        </Tooltip>

        <LanguageSwitcher variant="icon" />
      </Flex>
    </Flex>
  );
};
