import { Box, Button, Heading, HStack, Stack, Text } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { disableCookies, enableCookies } from './cookieBlocker';
import { addGA, removeGA } from './gaScript';

export const LOCALSTORAGE_CONSENT_KEY = 'cookie_consent';

export const CookieConsentDialog = () => {
  const posthog = usePostHog();
  const { t } = useTranslation();
  const previousConsent = localStorage.getItem(LOCALSTORAGE_CONSENT_KEY) as
    | 'granted'
    | 'denied'
    | null;

  const [consentStatus, setConsentStatus] = useState(
    previousConsent ?? posthog.get_explicit_consent_status(),
  );

  const handleEnableCookies = useCallback(() => {
    posthog.opt_in_capturing();
    localStorage.setItem(LOCALSTORAGE_CONSENT_KEY, 'granted');
    setConsentStatus('granted');
    enableCookies();
    addGA();
  }, [posthog]);

  const handleDisableCookies = useCallback(() => {
    posthog.opt_out_capturing();
    localStorage.setItem(LOCALSTORAGE_CONSENT_KEY, 'denied');
    setConsentStatus('denied');
    disableCookies();
    removeGA();
  }, [posthog]);

  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <Box
      position={'absolute'}
      bottom={{ base: '15%', lg: '10%' }}
      left={{ base: '50%', md: '32px' }}
      transform={{ base: 'translateX(-50%)', md: 'none' }}
      bg={'white'}
      maxW={'300px'}
      padding={4}
      boxShadow={'md'}
      borderRadius={'md'}
    >
      <Stack>
        <Heading as="h4" size="md">
          {t('cookieDialog.heading')} {consentStatus}
        </Heading>
        <Text>{t('cookieDialog.body')}</Text>
        <HStack justifyContent={'space-between'}>
          <Button colorPalette="red" onClick={handleDisableCookies}>
            {t('cookieDialog.buttons.reject')}
          </Button>
          <Button colorPalette="green" onClick={handleEnableCookies}>
            {t('cookieDialog.buttons.accept')}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};
