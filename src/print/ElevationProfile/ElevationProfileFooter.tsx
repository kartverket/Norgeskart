import { ButtonGroup } from '@kvib/react';
import { Chart } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { ElevationProfileExport } from './ElevationProfileExport';

export const ElevationProfileFooter = ({
  onReset,
  chartRef,
}: {
  onReset?: () => void;
  chartRef: React.RefObject<Chart<'line'> | null>;
}) => {
  const { t } = useTranslation();
  return (
    <ButtonGroup justify="space-around">
      {/* <Button onClick={onReset}>Reset zoom</Button> */}

      <ElevationProfileExport chartRef={chartRef} />
    </ButtonGroup>
  );
};
