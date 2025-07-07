import { Box } from '@kvib/react';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { Menu } from '../sidePanel/Menu';
import PrivacyPolicyAndContact from '../sidePanel/PrivacyPolicyAndContact';
import ShareOrPrintMap from '../sidePanel/ShareOrPrintMap';
import { menuWrapperStyle, sidebarStyle } from './LayoutStyles';

const DesktopSidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <Box {...sidebarStyle(isOpen)}>
      <Box {...menuWrapperStyle(isOpen)}>
        <Menu />
        <ShareOrPrintMap />
        <LanguageSwitcher />
        <PrivacyPolicyAndContact />
      </Box>
    </Box>
  );
};

export default DesktopSidebar;
