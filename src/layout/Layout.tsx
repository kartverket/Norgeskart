import React from 'react';
import {
  Box,
  Flex,
  useBreakpointValue,
  IconButton,
  Drawer,
  DrawerTrigger,
  DrawerPositioner,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@kvib/react';
import { MapComponent } from '../map/MapComponent.tsx';
import { SidePanel

 } from '../sidePanel/SidePanel.tsx';
const Layout: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex height="100vh" width="100vw">
      {isMobile ? (
        <Drawer placement="start" size="sm" trapFocus>
          <DrawerTrigger asChild>
            <IconButton
              aria-label="Åpne meny"
              icon='menu'
              position="absolute"
              top="1rem"
              left="1rem"
              zIndex="overlay"
            />
          </DrawerTrigger>

          <DrawerPositioner>
            <DrawerContent>
              <DrawerCloseTrigger />
              <DrawerHeader>
                <DrawerTitle>Menytittel</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                {/* Her kan menyinnholdet ditt ligge */}
                <SidePanel/>
              </DrawerBody>
              <DrawerFooter>
                <Button variant="ghost">Lukk</Button>
              </DrawerFooter>
            </DrawerContent>
          </DrawerPositioner>
        </Drawer>
      ) : (
        <Box
          flexBasis="20%"
          flexGrow={0}
          flexShrink={0}
          height="100%"
          bg="hotpink"
          p={4}
        >
          <SidePanel/>
        </Box>
      )}

      <Box flex="1" height="100%" bg="gray.200">
       <MapComponent/>
      </Box>
    </Flex>
  );
};

export default Layout;


      