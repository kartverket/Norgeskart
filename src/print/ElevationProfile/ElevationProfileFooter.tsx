import { Button, ButtonGroup } from '@kvib/react';
import { Chart } from 'chart.js';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  clearProfileFilesAtom,
  profileJobStatusAtom,
  profileLineAtom,
  profileResponseAtom,
} from './atoms';
import { ElevationProfileExport } from './ElevationProfileExport';

export const ElevationProfileFooter = ({
  chartRef,
}: {
  chartRef: React.RefObject<Chart<'line'> | null>;
}) => {
  const [profileLine, setProfileLine] = useAtom(profileLineAtom);
  const clearFiles = useAtomValue(clearProfileFilesAtom);
  const setElevationProfileResponse = useSetAtom(profileResponseAtom);
  const setStatus = useSetAtom(profileJobStatusAtom);
  const { t } = useTranslation();

  const onReset = () => {
    setProfileLine(null);
    setElevationProfileResponse(null);
    setStatus('cancelled');
    if (clearFiles != null) {
      clearFiles();
    }
  };
  if (profileLine == null) {
    return;
  }
  return (
    <ButtonGroup justify="space-between" mt={4}>
      <Button onClick={onReset}>
        {t('printdialog.elevationProfile.buttons.reset.label')}
      </Button>

      <ElevationProfileExport chartRef={chartRef} />
    </ButtonGroup>
  );
};
