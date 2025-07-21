import { IconButton } from '@kvib/react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarToggleButton = ({ isOpen, onToggle }: Props) => {
  const sidebarWidth = 400;

  return (
    <IconButton
      icon={isOpen ? 'chevron_left' : 'chevron_right'}
      aria-label={isOpen ? 'Skjul meny' : 'Vis meny'}
      position="absolute"
      left={isOpen ? `${sidebarWidth}px` : '20px'}
      top="50%"
      transform="translate(-50%, -50%)"
      zIndex="overlay"
      onClick={onToggle}
      variant="solid"
      {...(!isOpen && { bg: 'green' })}
    />
  );
};

export default SidebarToggleButton;
