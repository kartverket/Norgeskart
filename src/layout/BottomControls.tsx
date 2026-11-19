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
import { HoverStatusChip } from './HoverStatusChip';

export const BottomControls = () => {
  const { t } = useTranslation();
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);

  return (
    <Flex alignItems="center" justifyContent="center" gap={1}>
      <Flex
        alignItems="center"
        gap={0.5}
        pr={1}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Button
          variant="ghost"
          colorPalette="green"
          size="xs"
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
        pr={1}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <HoverStatusChip />
      </Flex>
      <Flex alignItems="center" gap={0.5} pr={1}>
        <ProjectionSettings />
      </Flex>
    </Flex>
  );
};
