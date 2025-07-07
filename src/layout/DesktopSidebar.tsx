import { Box } from '@kvib/react';
import { Menu } from '../sidePanel/Menu';
import ShareOrPrintMap from '../sidePanel/ShareOrPrintMap';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import PrivacyPolicyAndContact from '../sidePanel/PrivacyPolicyAndContact';
import { sidebarStyle, menuWrapperStyle } from './styles'

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
