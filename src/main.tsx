import { KvibProvider } from '@kvib/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KvibProvider>
      <App />
    </KvibProvider>
  </StrictMode>,
);
