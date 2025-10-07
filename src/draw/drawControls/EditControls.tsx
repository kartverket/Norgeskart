import { HStack, IconButton } from '@kvib/react';
import { useDrawSettings } from './hooks/drawSettings';
import { useVerticalMove } from './hooks/verticalMove';

export const EditControls = () => {
  const { moveSelectedUp, moveSelectedDown } = useVerticalMove();
  const { drawType } = useDrawSettings();

  if (drawType !== 'Move') {
    return null;
  }
  return (
    <HStack>
      <IconButton
        onClick={() => {
          moveSelectedUp();
        }}
        icon={'move_up'}
        variant="ghost"
      />
      <IconButton
        onClick={() => {
          moveSelectedDown();
        }}
        icon={'move_down'}
        variant="ghost"
      />
    </HStack>
  );
};
