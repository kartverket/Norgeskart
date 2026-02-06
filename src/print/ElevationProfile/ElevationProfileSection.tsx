import { Heading, Stack, Text } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { Chart as ChartJS } from 'chart.js';
import { getDefaultStore, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
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
import { ElevationProfileChart } from './ElevationProfileChart';
import { ElevationProfileExport } from './ElevationProfileExport';

export const ElevationProfileSection = () => {
  useAtom(profileEffect);
  const { t } = useTranslation();
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const ph = usePostHog();
  useEffect(() => {
    addDrawInteractionToMap(() => {
      ph.capture('print_elevation_profile_generate_started');
    });
    return () => {
      removeDrawInteractionFromMap();
      const store = getDefaultStore();
      store.set(profileLineAtom, null);
      store.set(profileResponseAtom, null);
      store.set(profileJobStatusAtom, 'notStarted');
    };
  }, [ph]);
  return (
    <Stack>
      <Heading size={'md'}>{t('printdialog.elevationProfile.heading')}</Heading>
      <Text>{t('printdialog.elevationProfile.infotext')}</Text>
      <ElevationProfileChart chartRef={chartRef} />
      <ElevationProfileExport chartRef={chartRef} />
    </Stack>
  );
};
