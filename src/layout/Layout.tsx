import { Flex } from '@kvib/react';
import { Debug } from '../debug/Debug';
import { MapLegendWrapper } from '../map/legend/MapLegendWrapper';
import { MapComponent } from '../map/MapComponent';
import { RettIKartetDialog } from '../map/menu/dialogs/RettIKartetDialog';
import { MapOverlay } from '../map/overlay/MapOverlay';
import { MessageBox } from '../messages/MessageBox';

const Layout: React.FC = () => {
  return (
    <Flex height="100vh" width="100vw" bg="gray.200">
      <MessageBox />
      <RettIKartetDialog />
      <MapLegendWrapper />
      <Debug />
      <MapComponent />
      <MapOverlay />
    </Flex>
  );
};

export default Layout;
