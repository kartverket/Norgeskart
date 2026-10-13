import {
  Box,
  Button,
  Flex,
  IconButton,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  Tooltip,
} from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  displayCompassOverlayAtom,
  mapAtom,
  useMagneticNorthAtom,
} from '../map/atoms';
import {
  isRettIKartetDialogOpenAtom,
  rettIKartetCoordinatesAtom,
} from '../map/menu/dialogs/atoms';
import { ProjectionSettings } from '../settings/map/ProjectionSettings';

export const BottomControls = () => {
  const { t } = useTranslation();
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);
  const map = useAtomValue(mapAtom);
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);

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
      <Flex alignItems="center">
        <Button
          variant="plain"
          size="xs"
          onClick={() => {
            const center = map.getView().getCenter();
            if (center) {
              setRettIKartetCoordinates(center);
              setRettIKartetDialogOpen(true);
            }
          }}
        >
          {t('toolbar.reportError.label')}
        </Button>
      </Flex>
    </Flex>
  );
};
