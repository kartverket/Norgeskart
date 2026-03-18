import { Box } from '@kvib/react';
import { PostHogErrorBoundary } from '@posthog/react';
import { useEffect } from 'react';
import { Debug } from './debug/Debug.tsx';
import './i18n';
import { Layout } from './Layout.tsx';
import { useMapSettings } from './map/mapHooks.ts';
import { RettIKartetDialog } from './map/menu/dialogs/RettIKartetDialog.tsx';
import { MapLegendDrawer } from './map/menu/drawers/MapLegendDrawer.tsx';
import { MessageBox } from './messages/MessageBox.tsx';

export const App = () => {
  const { setMapFullScreen } = useMapSettings();

  const fullscreenClickHandler = (event: KeyboardEvent) => {
    if (event.key === 'F11') {
      event.preventDefault();
      setMapFullScreen(true);
      event.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', fullscreenClickHandler);
    return () => {
      document.removeEventListener('keydown', fullscreenClickHandler);
    };
  });

  return (
    <PostHogErrorBoundary fallback={ErrorFallback}>
      <MessageBox />
      <RettIKartetDialog />
      <MapLegendDrawer />
      <Debug />
      <Layout />
    </PostHogErrorBoundary>
  );
};

export default App;

const ErrorFallback = () => {
  return (
    <Box>Noe gikk veldig galt med Norgeskart. Prøv å laste siden på nytt.</Box>
  );
};
