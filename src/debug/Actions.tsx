import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import {
  actionOffsetAtom,
  drawActionsAtom,
} from '../settings/draw/drawActions/atoms';

export const Actions = () => {
  const drawActions = useAtomValue(drawActionsAtom);
  const actionOffset = useAtomValue(actionOffsetAtom);
  return (
    <>
      Offset: {actionOffset}
      {drawActions.map((action, index) => (
        <Box key={index}>
          <Box>
            {action.type !== 'DELETE' ? action.featureId : null} - {action.type}
          </Box>
          {action.type === 'DELETE' && (
            <Box>
              deleted ids:{' '}
              {action.details.features
                .map((feature) => feature.getId())
                .join(', ')}
            </Box>
          )}
        </Box>
      ))}
    </>
  );
};
