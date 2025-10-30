import { Box, Button, Show, Stack, Tooltip } from '@kvib/react';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { getUrlParameter } from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './atoms';

const getRettIKartetAppName = () => {
  const backgroundLayerId = getUrlParameter('backgroundLayer');

  switch (backgroundLayerId) {
    case 'sjokartraster':
    case 'oceanicelectronic':
      return 'sjo';
    default:
      return 'n50kartdata';
  }
};

const handleRettIKartetMenuClick = () => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const view = map.getView();
  const center = view.getCenter();
  const zoom = view.getZoom();
  if (!center || !zoom) {
    return;
  }
  const projection = view.getProjection();

  const rettIKartetCoords = transform(center, projection, 'EPSG:25833');
  const rettIKartetAppName = getRettIKartetAppName();
  const url = `https://rettikartet.no/app/${rettIKartetAppName}?lon=${rettIKartetCoords[0]}&lat=${rettIKartetCoords[1]}&zoom=${zoom}`;
  window.open(url, '_blank')?.focus();
};

export const MapContextMenu = () => {
  const [isOpen, setIsOpen] = useAtom(mapContextIsOpenAtom);
  const x = useAtomValue(mapContextXPosAtom);
  const y = useAtomValue(mapContextYPosAtom);
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top={y}
      left={x}
      zIndex={1000}
      onClick={() => {
        setIsOpen(false);
      }}
      bg="white"
      boxShadow="md"
      borderRadius="md"
      p={2}
    >
      <Stack>
        <MapContextMenuItem
          label={t('map.contextmenu.items.rettikartet.label')}
          onClick={handleRettIKartetMenuClick}
          isLink
          tooltip={t('map.contextmenu.items.rettikartet.tooltip')}
        />
      </Stack>
    </Box>
  );
};

interface MapContextMenuItemProps {
  label: string;
  onClick: () => void;
  isLink?: boolean;
  tooltip?: string;
}
const MapContextMenuItem = (props: MapContextMenuItemProps) => {
  return (
    <Show
      when={props.tooltip}
      fallback={
        <ContextMenuButton
          label={props.label}
          onClick={props.onClick}
          isLink={props.isLink}
        />
      }
    >
      <Tooltip content={props.tooltip}>
        <Box>
          <ContextMenuButton
            label={props.label}
            onClick={props.onClick}
            isLink={props.isLink}
          />
        </Box>
      </Tooltip>
    </Show>
  );
};

const ContextMenuButton = (props: MapContextMenuItemProps) => {
  return (
    <Button
      variant="plain"
      onClick={props.onClick}
      rightIcon={props.isLink == true ? 'open_in_new' : undefined}
    >
      {props.label}
    </Button>
  );
};
