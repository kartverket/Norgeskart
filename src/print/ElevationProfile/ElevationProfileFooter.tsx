import { Button, ButtonGroup } from '@kvib/react';
import { Chart } from 'chart.js';
import { useAtom } from 'jotai';
import { profileLineAtom } from './atoms';
import { ElevationProfileExport } from './ElevationProfileExport';

export const ElevationProfileFooter = ({
  chartRef,
}: {
  chartRef: React.RefObject<Chart<'line'> | null>;
}) => {
  const [profileLine, setProfileLine] = useAtom(profileLineAtom);

  const onReset = () => {
    setProfileLine(null);
  };
  return (
    <ButtonGroup justify="space-between" mt={4}>
      {profileLine != null && <Button onClick={onReset}>Reset zoom</Button>}

      <ElevationProfileExport chartRef={chartRef} />
    </ButtonGroup>
  );
};
