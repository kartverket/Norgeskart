import { KvibProvider, Toaster } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { projInit } from './projInit.ts';
import { StateObserver } from './StateObserver.tsx';

const queryClient = new QueryClient();
projInit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StateObserver>
      <QueryClientProvider client={queryClient}>
        <KvibProvider>
          <App />
          <Toaster />
        </KvibProvider>
      </QueryClientProvider>
    </StateObserver>
  </StrictMode>,
);
