import { Box } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { drawPanelCollapsedAtom } from '../map/overlay/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';
import { DrawControlFooter } from './DrawControlsFooter';

export const BottomDrawToolSelector = () => {
  const [, setCollapsed] = useAtom(drawPanelCollapsedAtom);
  const collapsed = useAtomValue(drawPanelCollapsedAtom);
  const { drawType } = useDrawSettings();

  if (!collapsed) {
    return null;
  }

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
      py={1}
      // iPhone safe area
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      <DrawControlFooter
        drawType={drawType}
        hasSelectedFeature={false}
        compact
        onExpand={() => setCollapsed(false)}
      />
    </Box>
  );
};
