import { KvibProvider } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { projInit } from './projInit.ts';

const queryClient = new QueryClient();
projInit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <KvibProvider>
          <App />
        </KvibProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
