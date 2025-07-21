import {
  Drawer,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerPositioner,
  DrawerTrigger,
  IconButton,
} from '@kvib/react';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { SearchComponent } from '../search/SearchComponent';
import { Menu } from '../sidePanel/Menu';
import PrivacyPolicyAndContact from '../sidePanel/PrivacyPolicyAndContact';
import ShareOrPrintMap from '../sidePanel/ShareOrPrintMap';

const MobileSidebar = () => (
  <Drawer placement="start" trapFocus>
    <DrawerTrigger asChild>
      <IconButton
        aria-label="Åpne meny"
        icon="menu"
        position="absolute"
        top="1rem"
        left="1rem"
        zIndex="overlay"
      />
    </DrawerTrigger>
    <DrawerPositioner>
      <DrawerContent maxWidth="none">
        <DrawerCloseTrigger />
        <DrawerBody>
          <SearchComponent />
          <Menu />
          <ShareOrPrintMap />
          <LanguageSwitcher />
          <PrivacyPolicyAndContact />
        </DrawerBody>
      </DrawerContent>
    </DrawerPositioner>
  </Drawer>
);

export default MobileSidebar;
