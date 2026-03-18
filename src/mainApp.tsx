import { KvibProvider, Toaster } from '@kvib/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHydrateAtoms } from 'jotai/utils';
import 'material-symbols/rounded.css';
import { ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CookieConsentDialog } from './CookieConsentDialog.tsx';
import './index.css';
import { activeThemeLayersAtom } from './map/layers/atoms.ts';
import { BackgroundLayerName } from './map/layers/backgroundLayers.ts';
import { backgroundLayerAtom } from './map/layers/config/backgroundLayers/atoms.ts';
import { ThemeLayerName } from './map/layers/themeWMS.ts';
import { projInit } from './map/projections/proj/projInit.ts';
import { Observers } from './Observers.tsx';
import { PostHogWrapper } from './PosthogWrapper.tsx';
import {
  getListUrlParameter,
  getUrlParameter,
} from './shared/utils/urlUtils.ts';
const queryClient = new QueryClient();
projInit();

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
  const initialThemeLayersList = getListUrlParameter('themeLayers') || [];
  const initialThemeLayers = new Set(
    initialThemeLayersList as ThemeLayerName[],
  );
  const layerNameFromUrl = getUrlParameter('backgroundLayer');
  const finalLayerName = (layerNameFromUrl || 'topo') as BackgroundLayerName;

  useHydrateAtoms([
    [activeThemeLayersAtom, initialThemeLayers],
    [backgroundLayerAtom, finalLayerName],
  ]);
  return children;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HydrateAtoms>
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
    </HydrateAtoms>
  </StrictMode>,
);
