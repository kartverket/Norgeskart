import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import {
  actionOffsetAtom,
  DrawAction,
  drawActionsAtom,
} from '../settings/draw/drawActions/atoms';

export const Actions = () => {
  const drawActions = useAtomValue(drawActionsAtom);
  const actionOffset = useAtomValue(actionOffsetAtom);
  const currentActionToUndoIndex = drawActions.length - 1 - actionOffset;
  return (
    <>
      Offset: {actionOffset}
      {drawActions.map((action, index) => {
        return (
          <Box
            key={index}
            backgroundColor={
              currentActionToUndoIndex === index ? 'yellow' : 'unset'
            }
          >
            <ActionBody action={action} />
          </Box>
        );
      })}
    </>
  );
};

const ActionBody = ({ action }: { action: DrawAction }) => {
  switch (action.type) {
    case 'CREATE':
      return <>ADD - {action.featureId}</>;
    case 'DELETE':
      return (
        <>
          DELETE - {action.details.features.length}
          <Box>
            deleted ids:{' '}
            {action.details.features
              .map((feature) => feature.getId())
              .join(', ')}
          </Box>
        </>
      );

    case 'MOVE':
      return <>MOVE - {action.details.featuresMoved.length}</>;
    case 'EDIT_STYLE':
      return <>EDIT STYLE - {action.details.length} - </>;
    default:
      return null;
  }
};
