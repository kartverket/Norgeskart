import { Button, ButtonGroup } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { Chart as ChartJS } from 'chart.js';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { profileResponseAtom } from './atoms';

export const ElevationProfileExport = ({
  chartRef,
}: {
  chartRef: React.RefObject<ChartJS<'line'> | null>;
}) => {
  const profileData = useAtomValue(profileResponseAtom);
  const { t } = useTranslation();
  const ph = usePostHog();
  if (profileData === null) {
    return null;
  }

  const exportAsCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'x,y,z\n';

    profileData.value.features.forEach((feature) => {
      const elevation = feature.attributes.Z;
      csvContent += `${feature.geometry.x},${feature.geometry.y},${elevation}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'height_profile.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadChart = (format: 'png' | 'jpeg' = 'png') => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpeg' ? 0.92 : undefined; // JPEG quality
    const url = chart.toBase64Image(mime, quality);

    const link = document.createElement('a');
    link.href = url;
    link.download = `height-profile.${format}`;
    link.click();
  };

  return (
    <ButtonGroup justify="space-around">
      <Button
        onClick={() => {
          ph.capture('print_elevation_profile_export_csv');

          exportAsCSV();
        }}
      >
        {t('printdialog.elevationProfile.buttons.exportCsv.label')}
      </Button>
      <Button
        onClick={() => {
          ph.capture('print_elevation_profile_export_png');
          downloadChart('png');
        }}
      >
        {t('printdialog.elevationProfile.buttons.exportPng.label')}
      </Button>
    </ButtonGroup>
  );
};
