import { ButtonGroup } from '@kvib/react';
import { Chart } from 'chart.js';
import { ElevationProfileExport } from './ElevationProfileExport';

export const ElevationProfileFooter = ({
  chartRef,
}: {
  onReset?: () => void;
  chartRef: React.RefObject<Chart<'line'> | null>;
}) => {
  return (
    <ButtonGroup justify="space-around">
      {/* <Button onClick={onReset}>Reset zoom</Button> */}

      <ElevationProfileExport chartRef={chartRef} />
    </ButtonGroup>
  );
};
