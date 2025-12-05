import { KvibProvider, Toaster } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CookieConsentDialog } from './CookieConsentDialog.tsx';
import './index.css';
import { Observers } from './Observers.tsx';
import { PostHogWrapper } from './PosthogWrapper.tsx';
import { projInit } from './projInit.ts';
const queryClient = new QueryClient();
projInit();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <KvibProvider>
        <PostHogWrapper>
          <App />
          <Observers />
          <Toaster />
          <CookieConsentDialog />
        </PostHogWrapper>
      </KvibProvider>
    </QueryClientProvider>
  </StrictMode>,
);
