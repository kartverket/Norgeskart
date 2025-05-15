import { HStack, Text } from '@kvib/react';
import { MapComponent } from './map/MapComponent.tsx';
import { Settings } from './Settings.tsx';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';

function App() {
  return (
    <HStack>
      <Settings />
      <ErrorBoundary fallback={<Text>Noe gikk veldig galt med kartet</Text>}>
        <MapComponent />
      </ErrorBoundary>
    </HStack>
  );
}

export default App;
