import { Box, Button, Show, Stack, Tooltip } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import {
  mapContextIsOpenAtom,
  mapContextXPosAtom,
  mapContextYPosAtom,
} from './atoms';

export const MapContextMenu = () => {
  const [isOpen, setIsOpen] = useAtom(mapContextIsOpenAtom);
  const x = useAtomValue(mapContextXPosAtom);
  const y = useAtomValue(mapContextYPosAtom);

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
          label={'Rett i kartet'}
          onClick={() => {
            window.open('https://rettikartet.no', '_blank')?.focus();
          }}
          isLink
          tooltip="Gå til rett i kartet"
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
