import { Button, ButtonGroup } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { profileResponseAtom } from './atoms';

export const HeightProfileExport = () => {
  const profileData = useAtomValue(profileResponseAtom);
  const { t } = useTranslation();
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
  return (
    <ButtonGroup>
      <Button onClick={() => exportAsCSV()}>
        {t('printdialog.heightProfile.buttons.exportCsv.label')}
      </Button>
    </ButtonGroup>
  );
};
