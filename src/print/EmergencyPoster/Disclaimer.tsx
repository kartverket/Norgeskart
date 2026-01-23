import { Button, Flex, Heading, Stack, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const Disclaimer = ({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Stack>
      <Heading>{t('printdialog.emergencyPoster.disclaimer.heading')}</Heading>
      <Text>
        {t('printdialog.emergencyPoster.disclaimer.sections.section1')}
      </Text>
      <Text>
        {t('printdialog.emergencyPoster.disclaimer.sections.section2')}
      </Text>
      <Text>
        {t('printdialog.emergencyPoster.disclaimer.sections.section3')}
      </Text>
      <Flex justifyContent={'space-between'}>
        <Button onClick={onReject} variant="secondary">
          {t('printdialog.emergencyPoster.disclaimer.reject')}
        </Button>
        <Button onClick={onAccept}>
          {t('printdialog.emergencyPoster.disclaimer.accept')}
        </Button>
      </Flex>
    </Stack>
  );
};
