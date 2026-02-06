import { Flex } from '@kvib/react';
import { Debug } from '../debug/Debug';
import { MapComponent } from '../map/MapComponent';
import { RettIKartetDialog } from '../map/menu/dialogs/RettIKartetDialog';
import { MapLegendDrawer } from '../map/menu/drawers/MapLegendDrawer';
import { MapOverlay } from '../map/overlay/MapOverlay';
import { MessageBox } from '../messages/MessageBox';

const Layout: React.FC = () => {
  return (
    <Flex height="100vh" width="100vw" bg="gray.200">
      <MessageBox />
      <RettIKartetDialog />
      <MapLegendDrawer />
      <Debug />
      <MapComponent />
      <MapOverlay />
    </Flex>
  );
};

export default Layout;
