import { HStack, Text } from '@kvib/react';
import { useEffect } from 'react';
import { MapComponent } from './map/MapComponent.tsx';
import { projInit } from './projInit.ts';
import { Settings } from './settings/Settings.tsx';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';

function App() {
  useEffect(() => {
    projInit();
  }, []);
  return (
    <HStack alignItems={'flex-start'} height={'100%'} gap={0}>
      <Settings />
      <ErrorBoundary fallback={<Text>Noe gikk veldig galt med kartet</Text>}>
        <MapComponent />
      </ErrorBoundary>
    </HStack>
  );
}

export default App;
