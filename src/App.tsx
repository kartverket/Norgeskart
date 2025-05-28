import { HStack, Text } from '@kvib/react';
import { useEffect } from 'react';
import { MapComponent } from './map/MapComponent.tsx';
import { projInit } from './projInit.ts';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';
import { SidePanel } from './sidePanel/SidePanel.tsx';

function App() {
  useEffect(() => {
    projInit();
  }, []);
  return (
    <HStack alignItems={'flex-start'} height={'100%'} gap={0}>
      <SidePanel />

      <ErrorBoundary fallback={<Text>Noe gikk veldig galt med kartet</Text>}>
        <MapComponent />
        {/*Må fikse plassering av søk etter hvert, men gjør sånn her inntil videre*/}
      </ErrorBoundary>
    </HStack>
  );
}

export default App;
