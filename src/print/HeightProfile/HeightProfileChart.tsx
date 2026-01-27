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
import {
  profileJobStatusAtom,
  profileResponseAtom,
  profileSampleDistanceAtom,
} from './atoms';

export type HeightProfilePrintFormat = 'jpg' | 'png';
ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

export const HeightProfileChart = ({
  chartRef,
}: {
  chartRef: React.RefObject<ChartJS<'line'> | null>;
}) => {
  const heightProfile = useAtomValue(profileResponseAtom);
  const profileJobStatus = useAtomValue(profileJobStatusAtom);
  const sampleDistance = useAtomValue(profileSampleDistanceAtom);
  const { t } = useTranslation();

  const { data, options } = useMemo(() => {
    const labels: number[] = [];
    if (!heightProfile) {
      return {
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      };
    }
    const plotData = heightProfile.value.features.map(
      (feature: any, i: number) => {
        labels.push(i * sampleDistance);
        return feature?.attributes?.Z ?? null;
      },
    );

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Height Profile',
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
            text: t('printdialog.heightProfile.title') || 'Height Profile',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: t('printdialog.heightProfile.distance') || 'Distance (m)',
            },
          },
          y: {
            title: {
              display: true,
              text: t('printdialog.heightProfile.elevation') || 'Elevation (m)',
            },
          },
        },
      } as const,
    };
  }, [heightProfile, sampleDistance, t]);

  if (profileJobStatus === 'notStarted') {
    return null;
  }
  if (profileJobStatus === 'running') {
    return (
      <Flex>
        <Spinner />
        <Text ml="2">{t('printdialog.heightProfile.jobRunning')}</Text>
      </Flex>
    );
  }

  if (profileJobStatus === 'failed') {
    return (
      <Alert status="error">
        <Text>{t('printdialog.heightProfile.jobError ')}</Text>
      </Alert>
    );
  }
  if (!heightProfile) {
    return null;
  }

  // Build labels & data only when inputs change

  return (
    <Line
      data={data}
      ref={(c) => {
        chartRef.current = c as unknown as ChartJS<'line'> | null;
      }}
    />
  );
};
