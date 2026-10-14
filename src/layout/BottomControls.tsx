import {
  Box,
  Flex,
  IconButton,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  Tooltip,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { displayCompassOverlayAtom, useMagneticNorthAtom } from '../map/atoms';
import { ProjectionSettings } from '../settings/map/ProjectionSettings';

export const BottomControls = () => {
  const { t } = useTranslation();
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);

  return (
    <Flex alignItems="center" justifyContent="center" gap={2}>
      <Flex
        alignItems="center"
        gap={1}
        pr={2}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Tooltip content={t('map.settings.compass.enabled')}>
          <IconButton
            icon="explore"
            variant="ghost"
            colorPalette="green"
            size="xs"
            aria-label={t('map.settings.compass.enabled')}
            onClick={() => setDisplayCompassOverlay(!displayCompassOverlay)}
          />
        </Tooltip>
        <Tooltip content={t('map.settings.compass.magneticNorth')}>
          <Box>
            <SwitchRoot
              checked={useMagneticNorth}
              size="xs"
              colorPalette="green"
              onCheckedChange={(e) => setUseMagneticNorth(e.checked)}
              disabled={!displayCompassOverlay}
            >
              <SwitchHiddenInput />
              <SwitchControl />
            </SwitchRoot>
          </Box>
        </Tooltip>
      </Flex>
      <Flex
        alignItems="center"
        gap={1}
        pr={2}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <ProjectionSettings />
      </Flex>
    </Flex>
  );
};
