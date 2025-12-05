import { PostHogProvider } from '@posthog/react';
import { ReactNode } from 'react';
import { LOCALSTORAGE_CONSENT_KEY } from './CookieConsentDialog';
import { disableCookies, enableCookies } from './cookieBlocker';
import { getEnv } from './env';

const ENV = getEnv();
export const PostHogWrapper = ({
  children,
}: {
  children: ReactNode | ReactNode[] | string;
}) => {
  const previousCookieConsent = localStorage.getItem(LOCALSTORAGE_CONSENT_KEY);
  if (previousCookieConsent === 'granted') {
    enableCookies();
  } else {
    disableCookies();
  }
  const posthogKey = 'phc_SSu8pWSYaJDpMXVIUGuCKfGaxRnfJEI8ZbhXe4FEsE4';
  return ENV.usePostHog ? (
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        ui_host: 'https://eu.i.posthog.com',
        api_host: 'https://ph.kartverket.no',
        opt_out_capturing_by_default: true,
        cookieless_mode: 'on_reject',
      }}
    >
      {children}
    </PostHogProvider>
  ) : (
    <>{children}</>
  );
};
