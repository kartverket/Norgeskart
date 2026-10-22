import {
  Box,
  Button,
  Flex,
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
        <Button
          rightIcon="explore"
          variant="ghost"
          colorPalette="green"
          size="sm"
          backgroundColor={displayCompassOverlay ? '#D0ECD6' : 'transparent'}
          _hover={{ backgroundColor: '#D0ECD6' }}
          aria-pressed={displayCompassOverlay}
          onClick={() => setDisplayCompassOverlay(!displayCompassOverlay)}
        >
          {t('map.settings.compass.enabled')}
        </Button>
        <Tooltip content={t('map.settings.compass.magneticNorth')}>
          <Box display="flex" alignItems="center">
            <SwitchRoot
              checked={useMagneticNorth}
              size="sm"
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
      >
        <ProjectionSettings />
      </Flex>
    </Flex>
  );
};
