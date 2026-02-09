import { Flex, useBreakpointValue } from '@kvib/react';
import { Debug } from '../debug/Debug';
import { MapComponent } from '../map/MapComponent';
import { MapLegendDialog } from '../map/menu/dialogs/MapLegendDialog';
import { RettIKartetDialog } from '../map/menu/dialogs/RettIKartetDialog';
import { MapOverlay } from '../map/overlay/MapOverlay';
import { MessageBox } from '../messages/MessageBox';

const Layout: React.FC = () => {
  const displayDialog = useBreakpointValue({
    base: true,
    lg: false,
  });

  return (
    <Flex height="100vh" width="100vw" bg="gray.200">
      <MessageBox />
      <RettIKartetDialog />
      {displayDialog && <MapLegendDialog />}
      <Debug />
      <MapComponent />
      <MapOverlay />
    </Flex>
  );
};

export default Layout;
