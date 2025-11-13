import {
  Flex,
  IconButton,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Tooltip,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { displayCompassOverlayAtom, useMagneticNorthAtom } from '../map/atoms';
import { ProjectionSettings } from '../settings/map/ProjectionSettings';

export const Toolbar = () => {
  const { t } = useTranslation();
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);

  return (
    <Flex
      width="100%"
      height="25px"
      bg="#156630"
      bottom="0"
      position="absolute"
      alignItems="center"
      p={2}
    >
      <Tooltip content="Vis kompassrose">
        <IconButton
          icon="explore"
          size="XS"
          color="#D9D9D9"
          onClick={() => setDisplayCompassOverlay(!displayCompassOverlay)}
        ></IconButton>
      </Tooltip>
      <PopoverRoot>
        <PopoverTrigger asChild>
          <IconButton
            icon="arrow_drop_down"
            size="XS"
            color="#D9D9D9"
          ></IconButton>
        </PopoverTrigger>
        <PopoverContent width="230px">
          <PopoverBody>
            <SwitchRoot
              checked={useMagneticNorth}
              onCheckedChange={(e) => setUseMagneticNorth(e.checked)}
            >
              <SwitchHiddenInput />
              <SwitchLabel>
                {t('map.settings.compass.magneticNorth')}
              </SwitchLabel>
              <SwitchControl />
            </SwitchRoot>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
      <ProjectionSettings />
    </Flex>
  );
};
