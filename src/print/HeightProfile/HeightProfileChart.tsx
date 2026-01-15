import { Alert, Spinner } from '@kvib/react';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';
import { useAtomValue } from 'jotai';
import { Line } from 'react-chartjs-2';
import {
  profileJobStatusAtom,
  profileResponseAtom,
  profileSampleDistanceAtom,
} from './atoms';

export const HeightProfileChart = () => {
  const heightProfile = useAtomValue(profileResponseAtom);
  const profileJobStatus = useAtomValue(profileJobStatusAtom);
  const sampleDistance = useAtomValue(profileSampleDistanceAtom);
  if (profileJobStatus === 'notStarted') {
    return null;
  }
  if (profileJobStatus === 'running') {
    return <Spinner />;
  }

  if (profileJobStatus === 'failed') {
    return (
      <Alert status="error">
        <div>Failed to load height profile data. Please try again later.</div>
      </Alert>
    );
  }
  if (!heightProfile) {
    return null;
  }

  const labels: number[] = [];

  const plotData = heightProfile.value.features.map((feature, i) => {
    labels.push(i * sampleDistance);
    return feature.attributes.Z as number | null;
  });

  ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
  );
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Height Profile',
        data: plotData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={data}></Line>;
};
