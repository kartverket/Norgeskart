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
import { profileResponseAtom } from './atoms';

export const HeightProfileChart = () => {
  const heightProfile = useAtomValue(profileResponseAtom);
  if (!heightProfile) {
    return null;
  }

  const labels: number[] = [];

  const plotData = heightProfile.value.features.map((feature, i) => {
    labels.push(i);
    return feature.attributes.Z as number | null;
  });

  console.log('plotData', plotData);

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
