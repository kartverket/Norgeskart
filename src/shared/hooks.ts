import {
  getBreakpointCondition,
  useKvibContext,
  useMediaQuery,
} from '@kvib/react';

const useIsMobileScreen = () => {
  const system = useKvibContext();
  const isMobile = !useMediaQuery(getBreakpointCondition(system, 'md'));
  return isMobile;
};

export { useIsMobileScreen };
