import {
  getBreakpointCondition,
  useKvibContext,
  useMediaQuery,
} from '@kvib/react';

const useIsMobileScreen = () => {
  const system = useKvibContext();
  const isMobile = !useMediaQuery(getBreakpointCondition(system, 'lg'));
  return isMobile;
};

export { useIsMobileScreen };
