import { KvibProvider, Toaster } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'material-symbols/rounded.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AtomWrapper } from './AtomWrapper.tsx';
import { CookieConsentDialog } from './CookieConsentDialog.tsx';
import './index.css';
import { initDynamicThemeLayers } from './map/layers/themeLayerConfigApi.ts';
import { projInit } from './map/projections/proj/projInit.ts';
import { PostHogWrapper } from './PosthogWrapper.tsx';
projInit();
initDynamicThemeLayers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AtomWrapper>
        <QueryClientProvider client={new QueryClient()}>
          <KvibProvider>
            <PostHogWrapper>
              <App />
              <Toaster />
              <CookieConsentDialog />
            </PostHogWrapper>
          </KvibProvider>
        </QueryClientProvider>
      </AtomWrapper>
    </BrowserRouter>
  </StrictMode>,
);
