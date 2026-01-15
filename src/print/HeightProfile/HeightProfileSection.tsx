import { Heading, Stack, Text } from '@kvib/react';
import { getDefaultStore, useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  profileEffect,
  profileJobStatusAtom,
  profileLineAtom,
  profileResponseAtom,
} from './atoms';
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
      const store = getDefaultStore();
      store.set(profileLineAtom, null);
      store.set(profileResponseAtom, null);
      store.set(profileJobStatusAtom, 'notStarted');
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
