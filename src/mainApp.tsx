import { KvibProvider, Toaster } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'material-symbols/rounded.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AtomWrapper } from './AtomWrapper.tsx';
import { CookieConsentDialog } from './CookieConsentDialog.tsx';
import './index.css';
import { projInit } from './map/projections/proj/projInit.ts';
import { Observers } from './Observers.tsx';
import { PostHogWrapper } from './PosthogWrapper.tsx';
projInit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AtomWrapper>
      <QueryClientProvider client={new QueryClient()}>
        <KvibProvider>
          <PostHogWrapper>
            <App />
            <Observers />
            <Toaster />
            <CookieConsentDialog />
          </PostHogWrapper>
        </KvibProvider>
      </QueryClientProvider>
    </AtomWrapper>
  </StrictMode>,
);
