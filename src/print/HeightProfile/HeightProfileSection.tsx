import { Heading, Stack, Text } from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
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
  const setprofileLine = useSetAtom(profileLineAtom);
  const setprofileResponse = useSetAtom(profileResponseAtom);
  const setprofileJobStatus = useSetAtom(profileJobStatusAtom);
  const { t } = useTranslation();
  useEffect(() => {
    addDrawInteractionToMap();
    return () => {
      removeDrawInteractionFromMap();
      setprofileLine(null);
      setprofileResponse(null);
      setprofileJobStatus('notStarted');
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
