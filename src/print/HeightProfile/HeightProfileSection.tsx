import { Heading, Stack, Text } from '@kvib/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { profileEffect } from './atoms';
import {
  addDrawInteractionToMap,
  removeDrawInteractionFromMap,
} from './drawUtils';
import { HeightProfileChart } from './HeightProfileChart';
import { HeightProfileExport } from './HeightProfileExport';

export const HeightProfileSection = () => {
  useAtom(profileEffect);
  const { t } = useTranslation();
  useEffect(() => {
    addDrawInteractionToMap();
    return () => {
      removeDrawInteractionFromMap();
    };
  }, []);
  return (
    <Stack>
      <Heading size={'md'}>{t('printdialog.heightProfile.heading')}</Heading>
      <Text>{t('printdialog.heightProfile.infotext')}</Text>
      <HeightProfileChart />
      <HeightProfileExport />
    </Stack>
  );
};
