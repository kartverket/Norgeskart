import { Alert, Flex, Spinner, Text } from '@kvib/react';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { ElevationProfileFeature } from '../../api/heightData/types';
import {
  profileJobStatusAtom,
  profileResponseAtom,
  profileSampleDistanceAtom,
} from './atoms';

export type ElevationProfilePrintFormat = 'jpg' | 'png';
ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

export const ElevationProfileChart = ({
  chartRef,
}: {
  chartRef: React.RefObject<ChartJS<'line'> | null>;
}) => {
  const elevationProfile = useAtomValue(profileResponseAtom);
  const profileJobStatus = useAtomValue(profileJobStatusAtom);
  const sampleDistance = useAtomValue(profileSampleDistanceAtom);
  const { t } = useTranslation();

  const { data, options } = useMemo(() => {
    const labels: number[] = [];
    if (!elevationProfile) {
      return {
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      };
    }
    const plotData = elevationProfile.value.features.map(
      (feature: ElevationProfileFeature, i: number) => {
        labels.push(i * sampleDistance);
        return feature?.attributes?.Z ?? null;
      },
    );

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Elevation Profile',
            data: plotData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: t('printdialog.elevationProfile.chartLabels.title'),
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: t('printdialog.elevationProfile.chartLabels.xAxis'),
            },
          },
          y: {
            title: {
              display: true,
              text: t('printdialog.elevationProfile.chartLabels.yAxis'),
            },
          },
        },
      } as const,
    };
  }, [elevationProfile, sampleDistance, t]);

  if (profileJobStatus === 'notStarted') {
    return null;
  }
  if (profileJobStatus === 'running') {
    return (
      <Flex>
        <Spinner />
        <Text ml="2">{t('printdialog.elevationProfile.jobRunning')}</Text>
      </Flex>
    );
  }

  if (profileJobStatus === 'failed') {
    return (
      <Alert status="error">
        <Text>{t('printdialog.elevationProfile.jobError ')}</Text>
      </Alert>
    );
  }
  if (!elevationProfile) {
    return null;
  }

  return (
    <Line
      data={data}
      options={options}
      ref={(c) => {
        chartRef.current = c as unknown as ChartJS<'line'> | null;
      }}
    />
  );
};
