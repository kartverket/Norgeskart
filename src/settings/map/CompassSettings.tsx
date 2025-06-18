import {
  Flex,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const CompassSettings = () => {
  const { t } = useTranslation();
  return (
    <Flex justifyContent={'space-between'} w={'100%'}>
      <SwitchRoot>
        <SwitchHiddenInput />
        <SwitchLabel>{t('map.settings.compass.enabled')}</SwitchLabel>
        <SwitchControl />
      </SwitchRoot>
      <SwitchRoot>
        <SwitchHiddenInput />

        <SwitchLabel>{t('map.settings.compass.magneticNorth')}</SwitchLabel>
        <SwitchControl />
      </SwitchRoot>
    </Flex>
  );
};
