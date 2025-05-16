import { HStack, Text } from '@kvib/react';
import { MapComponent } from './map/MapComponent.tsx';
import { Settings } from './settings/Settings.tsx';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';

function App() {
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
