import {
  SimpleGrid,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  displayCompassOverlayAtom,
  useMagneticNorthAtom,
} from '../../map/atoms';

export const CompassSettings = () => {
  const { t } = useTranslation();
  const [displayCompassOverlay, setDisplayCompassOverlay] = useAtom(
    displayCompassOverlayAtom,
  );
  const [useMagneticNorth, setUseMagneticNorth] = useAtom(useMagneticNorthAtom);
  return (
    <SimpleGrid columns={2} gap="5">
      <SwitchRoot
        checked={displayCompassOverlay}
        onCheckedChange={(e) => setDisplayCompassOverlay(e.checked)}
      >
        <SwitchHiddenInput />
        <SwitchLabel>{t('map.settings.compass.enabled')}</SwitchLabel>
        <SwitchControl />
      </SwitchRoot>

      <SwitchRoot
        checked={useMagneticNorth}
        onCheckedChange={(e) => setUseMagneticNorth(e.checked)}
      >
        <SwitchHiddenInput />
        <SwitchLabel>{t('map.settings.compass.magneticNorth')}</SwitchLabel>
        <SwitchControl />
      </SwitchRoot>
    </SimpleGrid>
  );
};
