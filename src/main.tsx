import { KvibProvider, Toaster } from '@kvib/react';
import { PostHogProvider } from '@posthog/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { disableCookies, enableCookies } from './cookieBlocker.ts';
import {
  CookieConsentDialog,
  LOCALSTORAGE_CONSENT_KEY,
} from './CookieConsentDialog.tsx';
import { addGA, removeGA } from './gaScript.ts';
import './index.css';
import { Observers } from './Observers.tsx';
import { projInit } from './projInit.ts';

const queryClient = new QueryClient();
projInit();
const previousCookieConsent = localStorage.getItem(LOCALSTORAGE_CONSENT_KEY);
if (previousCookieConsent === 'granted') {
  enableCookies();
  addGA();
} else {
  disableCookies();
  removeGA();
}
const posthogKey = 'phc_SSu8pWSYaJDpMXVIUGuCKfGaxRnfJEI8ZbhXe4FEsE4';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <KvibProvider>
        <PostHogProvider
          apiKey={posthogKey}
          options={{
            ui_host: 'https://eu.i.posthog.com',
            api_host: 'https://ph.kartverket.no',
            opt_out_capturing_by_default: true,
            cookieless_mode: 'on_reject',
          }}
        >
          <App />
          <Observers />
          <Toaster />
          <CookieConsentDialog />
        </PostHogProvider>
      </KvibProvider>
    </QueryClientProvider>
  </StrictMode>,
);
