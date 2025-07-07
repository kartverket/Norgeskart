import transition from '../theme/transitions';

export const sidebarStyle = (isOpen: boolean) => ({
  width: isOpen ? '400px' : '0',
  transform: isOpen ? 'translateX(0)' : 'translateX(-400px)',
  transition: `width ${transition.duration.normal} ${transition.easing['ease-in-out']}, transform ${transition.duration.normal} ${transition.easing['ease-in-out']}`,
  overflow: 'hidden',
  height: '100%',
  bg: 'white',
  boxShadow: 'sm',
  flexShrink: 0,
});

export const menuWrapperStyle = (isOpen: boolean) => ({
  my: '3rem',
  opacity: isOpen ? 1 : 0,
  pointerEvents: isOpen ? 'auto' : 'none',
  transition: `opacity ${transition.duration.fast} ${transition.easing['ease-in']}`,
});
