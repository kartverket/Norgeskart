import {
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
  VStack,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { hoverAvailableAtom, hoverEnabledAtom } from '../map/overlay/atoms';

export const HoverSettings = () => {
  const { t } = useTranslation();
  const [hoverEnabled, setHoverEnabled] = useAtom(hoverEnabledAtom);
  const hoverAvailable = useAtomValue(hoverAvailableAtom);
  if (!hoverAvailable) return null;

  return (
    <VStack alignItems="flex-start" gap="1">
      <SwitchRoot
        checked={hoverEnabled}
        colorPalette="green"
        onCheckedChange={(e) => setHoverEnabled(e.checked)}
      >
        <SwitchHiddenInput />
        <SwitchControl />
        <SwitchLabel>{t('map.settings.hover.enabled')}</SwitchLabel>
      </SwitchRoot>
      <Text fontSize="sm">{t('map.settings.hover.description')}</Text>
    </VStack>
  );
};
