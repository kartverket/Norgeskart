import { HStack } from '@kvib/react';
import { MapComponent } from './map/MapComponent.tsx';
import { Settings } from './Settings.tsx';

function App() {
  return (
    <HStack>
    <Settings/>
      <MapComponent />
    </HStack>
  );
}

export default App;
