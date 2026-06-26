import { Button, Card, CardBody, CardTitle, Flex, Grid, Heading, HStack, Icon, Link, SimpleGrid, Text, VStack } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALSTORAGE_CONSENT_KEY } from '../CookieConsentDialog';
import { disableCookies, enableCookies } from '../cookieBlocker';

export const Contact = () => {
  const { t } = useTranslation();
  return (
   <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} alignItems="start">
  <VStack align="start">
    <Heading size="3xl" fontWeight="bold">
      {t('privacyAndContact.contactUs')}
    </Heading>

    <Text fontSize="md">
      {t('privacyAndContact.dialogContent')}
    </Text>
  </VStack>

   <SimpleGrid columns={{ base: 1, md: 1, lg: 3}} gap={4} mt={2}>
      <Card borderRadius={10} boxShadow="lg">
      <CardBody>
        <Flex align="center" gap={2}>
          <Icon icon="rate_review" />
          <CardTitle>Tilbakemeldingsskjema</CardTitle>
        </Flex>
        <Text mt={2} fontSize="sm">Rapporter feil eller foreslå forbedringer</Text>
          <Link
          mt={2}
        href="https://forms.office.com/e/PPTcK53z83"
        target="_blank"
        external
        textStyle="sm"
      >
        {t('privacyAndContact.formsLinkText')}
      </Link>
      </CardBody>
    </Card>
    <Card borderRadius={10} boxShadow="lg">
      <CardBody>
        <Flex align="center" gap={2}>
        <Icon icon="mail" />
        <CardTitle>E-post</CardTitle>
        </Flex>
        <Text mt={2}fontSize="sm">Kontakt oss på e-post, så svarer vi så fort vi kan.</Text>
        <Link
        mt={2}
        colorPalette="green"
        href="mailto:post@kartverket.no"
        textStyle="sm"
        variant="underline"
      >
        {t('privacyAndContact.sendEmail')}
      </Link>
      </CardBody>
    </Card>
    <Card borderRadius={10} boxShadow="lg">
      <CardBody>
        <Flex align="center" gap={2}>
          <Icon icon="phone_enabled" />
          <CardTitle>Telefon</CardTitle>
        </Flex>
          <Link
        colorPalette="green"
        href="tel:+4732118000"
        textStyle="sm"
        variant="underline"
        mt={2}
      >
        +47 32 11 80 00
      </Link>
      </CardBody>
    </Card>
  </SimpleGrid>
</Grid>
    // <VStack alignItems="start" gap={4}>
    //   <Text textStyle="md">{t('privacyAndContact.dialogContent')}</Text>
    //   <Link
    //     colorPalette="green"
    //     href="tel:+4732118000"
    //     textStyle="md"
    //     variant="underline"
    //   >
    //     +47 32 11 80 00
    //   </Link>
    //   <Link
    //     colorPalette="green"
    //     href="mailto:post@kartverket.no"
    //     textStyle="md"
    //     variant="underline"
    //   >
    //     {t('privacyAndContact.sendEmail')}
    //   </Link>
    //   <Link
    //     href="https://forms.office.com/e/PPTcK53z83"
    //     target="_blank"
    //     external
    //     textStyle="md"
    //   >
    //     {t('privacyAndContact.formsLinkText')}
    //   </Link>
    // </VStack>
  );
};

export const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const ph = usePostHog();
  const previousConsent = localStorage.getItem(LOCALSTORAGE_CONSENT_KEY) as
    | 'granted'
    | 'denied'
    | null;
  const [consentStatus, setConsentStatus] = useState(
    previousConsent ?? ph.get_explicit_consent_status(),
  );

  const consentStatusKey: Record<string, string> = {
    granted: 'privacyAndContact.cookieConsent.granted',
    denied: 'privacyAndContact.cookieConsent.denied',
  };

  const handleEnableCookies = useCallback(() => {
    ph.opt_in_capturing();
    localStorage.setItem(LOCALSTORAGE_CONSENT_KEY, 'granted');
    setConsentStatus('granted');
    enableCookies();
  }, [ph]);

  const handleDisableCookies = useCallback(() => {
    ph.opt_out_capturing();
    localStorage.setItem(LOCALSTORAGE_CONSENT_KEY, 'denied');
    setConsentStatus('denied');
    disableCookies();
  }, [ph]);

  return (
    <VStack alignItems="start" gap={4}>
      <Text textStyle="md">
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
      <Text textStyle="md">
        {t('privacyAndContact.cookieConsent.currentStatus')}{' '}
        {t(
          consentStatusKey[consentStatus] ??
            'privacyAndContact.cookieConsent.pending',
        )}
      </Text>

      <HStack mt={2}>
        <Button
          colorPalette="green"
          size="sm"
          onClick={handleEnableCookies}
          disabled={consentStatus === 'granted'}
        >
          {t('cookieDialog.buttons.accept')}
        </Button>
        <Button
          colorPalette="red"
          variant="outline"
          size="sm"
          onClick={handleDisableCookies}
          disabled={consentStatus === 'denied'}
        >
          {t('cookieDialog.buttons.reject')}
        </Button>
      </HStack>
    </VStack>
  );
};
