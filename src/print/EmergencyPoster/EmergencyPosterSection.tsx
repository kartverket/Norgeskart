import { Link, Stack, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const EmergencyPosterSection = () => {
  const { t } = useTranslation();
  return (
    <Stack gap={4}>
      <Text>{t('printdialog.emergencyPoster.section1')}</Text>
      <Link href="https://norskluftambulanse.no/nodplakat/" target="_blank">
        {t('printdialog.emergencyPoster.link')}
      </Link>
      <Text>{t('printdialog.emergencyPoster.section2')}</Text>
    </Stack>
  );
};
