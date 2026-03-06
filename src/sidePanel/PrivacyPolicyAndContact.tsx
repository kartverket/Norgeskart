import { Button, HStack, Link, Text, VStack } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALSTORAGE_CONSENT_KEY } from '../CookieConsentDialog';
import { disableCookies, enableCookies } from '../cookieBlocker';

export const Contact = () => {
  const { t } = useTranslation();
  return (
    <VStack alignItems="start" gap={4}>
      <Text>{t('privacyAndContact.dialogContent')}</Text>
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
      <Link
        href="https://forms.office.com/e/PPTcK53z83"
        target="_blank"
        external
      >
        {t('privacyAndContact.formsLinkText')}
      </Link>
    </VStack>
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
      <Text>
        {t('privacyAndContact.cookieConsent.currentStatus')}{' '}
        {t(
          consentStatusKey[consentStatus] ??
            'privacyAndContact.cookieConsent.pending',
        )}
        <HStack>
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
      </Text>
    </VStack>
  );
};
