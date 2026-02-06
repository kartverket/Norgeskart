import { Flex, Heading, Link, Text, VStack } from '@kvib/react';

import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <Flex justifyContent="start" flexDirection="column" gap={4}>
      <VStack alignItems={'flex-start'} w={'100%'}>
        <Heading size="md">{t('privacyAndContact.contactUs')}</Heading>
        <Text>{t('privacyAndContact.dialogContent')}</Text>
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          gap={2}
          w={'100%'}
        >
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
            href="mailto:post@kartverket.no"
            size="lg"
            variant="underline"
          >
            {t('privacyAndContact.sendEmail')}
          </Link>
        </Flex>
        <Link
          href="https://forms.office.com/e/PPTcK53z83"
          target="_blank"
          external
        >
          {t('privacyAndContact.formsLinkText')}
        </Link>
      </VStack>
      <VStack alignItems={'flex-start'}>
        <Heading size="md">{t('privacyAndContact.privacy')}</Heading>
        <Text>
          {t('privacyAndContact.infoText')}
          <Link
            colorPalette="green"
            href="https://www.kartverket.no/om-kartverket/personvern"
            external
            target="_blank"
            variant="underline"
            ml={1}
          >
            {t('privacyAndContact.privacyPolicy')}
          </Link>
        </Text>
      </VStack>
      <VStack alignItems={'flex-start'}>
        <Heading size="md">{t('privacyAndContact.status.heading')}</Heading>
        <Text>{t('privacyAndContact.status.infoText')}</Text>
        <Link
          colorPalette="green"
          href="https://status.kartverket.no/"
          external={true}
          target="_blank"
          variant="underline"
          ml={1}
        >
          status.kartverket.no
        </Link>
      </VStack>
    </Flex>
  );
};

export default PrivacyPolicy;
