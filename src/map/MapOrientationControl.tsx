import {
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@kvib/react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useIsMobileScreen } from '../shared/hooks';
import { mapOrientationDegreesAtom } from './atoms';
import { useMapSettings } from './mapHooks';

export const MapOrientationControl = () => {
  const isMobile = useIsMobileScreen();

  const [open, setOpen] = useState(false);
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const { rotateSnappy, setMapAngle } = useMapSettings();

  if (isMobile) {
    return (
      <Tooltip content={t('map.controls.orientation.label')}>
        <IconButton
          variant="ghost"
          size="xs"
          icon="navigation"
          aria-label={t('map.controls.orientation.label')}
          onClick={() => setMapAngle(0)}
          style={{
            transform: `rotate(${mapOrientation}deg)`,
            transition: 'none',
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      positioning={{ placement: 'left' }}
    >
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          size="xs"
          icon="more_horiz"
          aria-label={t('map.controls.more.label')}
        />
      </PopoverTrigger>

      <PopoverContent maxW="113px">
        <HStack>
          <Tooltip content={t('map.controls.rotateLeft.label')}>
            <IconButton
              variant="ghost"
              icon="rotate_left"
              size="xs"
              aria-label={t('map.controls.rotateLeft.label')}
              onClick={() => rotateSnappy('left')}
            />
          </Tooltip>

          <Tooltip content={t('map.controls.orientation.label')}>
            <IconButton
              variant="ghost"
              icon="navigation"
              size="xs"
              aria-label={t('map.controls.orientation.label')}
              onClick={() => setMapAngle(0)}
              style={{
                transform: `rotate(${mapOrientation}deg)`,
                transition: 'none',
              }}
            />
          </Tooltip>

          <Tooltip content={t('map.controls.rotateRight.label')}>
            <IconButton
              variant="ghost"
              icon="rotate_right"
              size="xs"
              aria-label={t('map.controls.rotateRight.label')}
              onClick={() => rotateSnappy('right')}
            />
          </Tooltip>
        </HStack>
      </PopoverContent>
    </Popover>
  );
};
