import { Box, Flex, Heading, Link, Text } from '@kvib/react';

import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <Flex justifyContent="start" flexDirection="column">
      <Heading size="md">{t('privacyAndContact.contactUs')}</Heading>
      <Box>{t('privacyAndContact.dialogContent')}</Box>
      <Flex flexDirection="row" justifyContent="space-between" paddingTop={4}>
        <Link
          colorPalette="green"
          href="tel:+4732118000"
          size="lg"
          variant="underline"
        >
          +47 32 11 80 00
        </Link>
        <Link
          colorPalette="green"
          href="mailto:kontakt@firma.no"
          size="lg"
          variant="underline"
        >
          {t('privacyAndContact.sendEmail')}
        </Link>
      </Flex>
      <Box my={5}></Box>
      <Text>
        {t('privacyAndContact.infoText')}
        <Link colorPalette="green" href="/?path=/" external variant="underline">
          {t('privacyAndContact.privacyPolicy')}
        </Link>
      </Text>
    </Flex>
  );
};

export default PrivacyPolicy;
