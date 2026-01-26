import { Box, Button, Heading, HStack, Link, Stack, Text } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { disableCookies, enableCookies } from './cookieBlocker';

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
  }, [posthog]);

  const handleDisableCookies = useCallback(() => {
    posthog.opt_out_capturing();
    localStorage.setItem(LOCALSTORAGE_CONSENT_KEY, 'denied');
    setConsentStatus('denied');
    disableCookies();
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
      maxW={{ base: '320px', md: '380px' }}
      padding={4}
      boxShadow={'md'}
      borderRadius={'md'}
      zIndex={'modal'}
    >
      <Stack gap={3}>
        <Heading as="h4" size="md">
          {t('cookieDialog.heading')}
        </Heading>
        <Text fontSize="sm">{t('cookieDialog.body')}</Text>
        
        <Box fontSize="xs" color="gray.600">
          <Text fontWeight="semibold" mb={1}>{t('cookieDialog.whatWeCollect')}</Text>
          <Text>• {t('cookieDialog.analytics')}</Text>
          <Text>• {t('cookieDialog.noPersonalData')}</Text>
          <Text mt={2}>{t('cookieDialog.rejectInfo')}</Text>
        </Box>
        
        <Link
          href="https://www.kartverket.no/om-kartverket/personvern"
          target="_blank"
          colorPalette="green"
          fontSize="xs"
          variant="underline"
        >
          {t('cookieDialog.privacyPolicy')}
        </Link>
        
        <HStack justifyContent={'space-between'} mt={2}>
          <Button 
            colorPalette="gray" 
            variant="outline"
            onClick={handleDisableCookies}
            size="sm"
          >
            {t('cookieDialog.buttons.reject')}
          </Button>
          <Button 
            colorPalette="green" 
            onClick={handleEnableCookies}
            size="sm"
          >
            {t('cookieDialog.buttons.accept')}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};
