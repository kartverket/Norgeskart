import { Heading, Stack } from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const InputForm = () => {
  const { t } = useTranslation();
  return (
    <Stack>
      <Heading size={'sm'}>
        {t('printdialog.emergencyPoster.inputform.heading')}
      </Heading>
    </Stack>
  );
};
