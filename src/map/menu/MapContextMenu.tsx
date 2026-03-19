import { Box, Button, Show, Stack, Tooltip } from '@kvib/react';
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../atoms';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './atoms';
import {
  isRettIKartetDialogOpenAtom,
  rettIKartetCoordinatesAtom,
} from './dialogs/atoms';

export const MapContextMenu = () => {
  const [isOpen, setIsOpen] = useAtom(mapContextIsOpenAtom);
  const setIsModalOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);
  const x = useAtomValue(mapContextXPosAtom);
  const y = useAtomValue(mapContextYPosAtom);
  const { t } = useTranslation();

  return (
    <>
      {isOpen && (
        <Box
          position="absolute"
          top={y}
          left={x}
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
              onClick={() => {
                const store = getDefaultStore();
                const map = store.get(mapAtom);

                const clickPos = map.getCoordinateFromPixel([x, y]);
                setRettIKartetCoordinates(clickPos);

                setIsModalOpen(true);
              }}
              isLink
              tooltip={t('map.contextmenu.items.rettikartet.tooltip')}
            />
          </Stack>
        </Box>
      )}
    </>
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
          <ContextMenuButton label={props.label} onClick={props.onClick} />
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
