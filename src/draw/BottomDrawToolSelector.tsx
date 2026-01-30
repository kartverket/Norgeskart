import { Box } from '@kvib/react';
import { DrawToolSelector } from './DrawToolSelector';

export const BottomDrawToolSelector = () => {
  return (
    <Box
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      bg="white"
      boxShadow="md"
      px={2}
      py={2}
      // iPhone safe area
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      <DrawToolSelector />
    </Box>
  );
};
