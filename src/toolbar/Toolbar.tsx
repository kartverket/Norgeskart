import {
  Button,
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
  Text,
  Tooltip,
} from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { displayCompassOverlayAtom, useMagneticNorthAtom } from '../map/atoms';
import { isRettIKartetDialogOpenAtom } from '../map/menu/dialogs/atoms';
import { ProjectionSettings } from '../settings/map/ProjectionSettings';

export const Toolbar = () => {
  const { t } = useTranslation();
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
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
      p={2}
      gap={3}
      alignItems="center"
    >
      <Flex alignItems="center" flex="1">
        <Tooltip content="Vis kompassrose">
          <IconButton
            icon="explore"
            variant="tertiary"
            color="white"
            onClick={() => setDisplayCompassOverlay(!displayCompassOverlay)}
          ></IconButton>
        </Tooltip>
        <PopoverRoot>
          <PopoverTrigger asChild>
            <IconButton
              icon="arrow_drop_down"
              variant="tertiary"
              color="white"
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
      <Flex justify="center" alignItems="center" gap={2} color="white">
        <Text>Koordinater her</Text>
        <Text>Målestokk her</Text>
      </Flex>
      <Flex flex="1" justify="flex-end" alignItems="center">
        <Button
          variant="plain"
          color="white"
          onClick={() => setRettIKartetDialogOpen(true)}
        >
          Feil i kartet?
        </Button>
      </Flex>
    </Flex>
  );
};
