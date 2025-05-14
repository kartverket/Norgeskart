import { KvibProvider } from '@kvib/react';
import { Provider } from 'jotai';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <KvibProvider>
        <App />
      </KvibProvider>
    </Provider>
  </StrictMode>,
);
