import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import {
  clearStaticOverlaysForFeature,
  enableFeatureMeasurmentOverlay,
} from '../../../draw/drawControls/drawUtils';
import {
  addIconOverlayToPointFeature,
  useDrawSettings,
} from '../../../draw/drawControls/hooks/drawSettings';
import {
  actionOffsetAtom,
  canRedoAtom,
  canUndoAtom,
  DrawAction,
  drawActionsAtom,
} from './atoms';

export const useDrawActions = () => {
  const actionOffset = useAtomValue(actionOffsetAtom);
  const drawActions = useAtomValue(drawActionsAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const { removeDrawnFeatureById, addFeature, getDrawLayer } =
    useDrawSettings();
  const { decrementOffset, incrementOffset } = useDrawActionsState();
  const undoMove = (action: DrawAction) => {
    if (action.type !== 'MOVE') {
      console.warn('Not a move action');
      return;
    }
    action.details.featuresMoved.forEach((moveDetail) => {
      const drawLayer = getDrawLayer();
      const drawSource = drawLayer?.getSource();
      if (!drawSource) {
        console.warn('No draw source found');
        return;
      }
      const feature = drawSource.getFeatureById(moveDetail.featureId);
      if (!feature) {
        console.warn(
          `Feature with ID ${moveDetail.featureId} not found in draw source`,
        );
        return;
      }
      clearStaticOverlaysForFeature(feature);
      feature.setGeometry(moveDetail.geometryBeforeMove);
      enableFeatureMeasurmentOverlay(feature);
    });
  };

  const redoMove = (action: DrawAction) => {
    if (action.type !== 'MOVE') {
      console.warn('Not a move action');
      return;
    }
    action.details.featuresMoved.forEach((moveDetail) => {
      const drawLayer = getDrawLayer();
      const drawSource = drawLayer?.getSource();
      if (!drawSource) {
        console.warn('No draw source found');
        return;
      }
      const feature = drawSource.getFeatureById(moveDetail.featureId);
      if (!feature) {
        console.warn(
          `Feature with ID ${moveDetail.featureId} not found in draw source`,
        );
        return;
      }
      clearStaticOverlaysForFeature(feature);
      feature.setGeometry(moveDetail.geometryAfterMove);
      enableFeatureMeasurmentOverlay(feature);
    });
  };

  const undoStyleChange = (action: DrawAction) => {
    if (action.type !== 'EDIT_STYLE') {
      console.warn('Not an edit style action');
      return;
    }
    action.details.forEach((styleChange) => {
      const drawLayer = getDrawLayer();
      const drawSource = drawLayer?.getSource();
      if (!drawSource) {
        console.warn('No draw source found');
        return;
      }
      const feature = drawSource.getFeatureById(styleChange.featureId);
      if (!feature) {
        console.warn(
          `Feature with ID ${styleChange.featureId} not found in draw source`,
        );
        return;
      }
      if (styleChange.oldIcon != null) {
        addIconOverlayToPointFeature(feature, styleChange.oldIcon || null);
        return;
      }
      feature.setStyle(styleChange.oldStyle);
    });
  };

  const redoStyleChange = (action: DrawAction) => {
    if (action.type !== 'EDIT_STYLE') {
      console.warn('Not an edit style action');
      return;
    }
    action.details.forEach((styleChange) => {
      const drawLayer = getDrawLayer();
      const drawSource = drawLayer?.getSource();
      if (!drawSource) {
        console.warn('No draw source found');
        return;
      }
      const feature = drawSource.getFeatureById(styleChange.featureId);
      if (!feature) {
        console.warn(
          `Feature with ID ${styleChange.featureId} not found in draw source`,
        );
        return;
      }
      if (styleChange.newIcon != null) {
        addIconOverlayToPointFeature(feature, styleChange.newIcon || null);
        return;
      }

      feature.setStyle(styleChange.newStyle);
    });
  };

  const undoLast = () => {
    if (!canUndo) {
      console.warn('Cannot undo');
      return;
    }
    const actionIndex = drawActions.length - actionOffset - 1;
    const actionToUndo = drawActions[actionIndex];

    if (actionToUndo == null) {
      console.warn('No action to undo');
      return;
    }

    switch (actionToUndo.type) {
      case 'CREATE':
        removeDrawnFeatureById(actionToUndo.featureId);
        // Handle create action undo
        break;
      case 'EDIT_STYLE':
        undoStyleChange(actionToUndo);
        break;
      case 'EDIT_GEOMETRY':
        // Handle update action undo
        break;
      case 'DELETE':
        actionToUndo.details.features.forEach((feature) => {
          addFeature(feature);
        });
        break;
      case 'MOVE':
        undoMove(actionToUndo);
        break;
    }

    incrementOffset();
  };

  const redoLastUndone = () => {
    if (!canRedo) {
      console.warn('Cannot redo');
    }
    const actionIndex = drawActions.length - actionOffset;
    const actionToRedo = drawActions[actionIndex];

    if (actionToRedo == null) {
      console.warn('No action to redo');
      return;
    }

    switch (actionToRedo.type) {
      case 'CREATE':
        addFeature(actionToRedo.details.feature);
        break;
      case 'EDIT_STYLE':
        redoStyleChange(actionToRedo);
        break;
      case 'EDIT_GEOMETRY':
        // Handle update action redo
        break;
      case 'MOVE':
        redoMove(actionToRedo);
        break;
      case 'DELETE':
        actionToRedo.details.features.forEach((feature) => {
          const featureId = feature.getId();
          if (!featureId) {
            console.warn('Feature ID is null');
            return;
          }
          removeDrawnFeatureById(featureId.toString());
        });
        break;
    }

    decrementOffset();
  };

  return {
    undoLast,
    redoLastUndone,
  };
};

export const useDrawActionsState = () => {
  const [drawActions, setDrawActions] = useAtom(drawActionsAtom);
  const [actionOffset, setActionOffset] = useAtom(actionOffsetAtom);

  const resetActions = () => {
    setDrawActions([]);
    resetOffset();
  };

  const incrementOffset = () => {
    const maxPossibleOffset = drawActions.length;
    if (actionOffset < maxPossibleOffset) {
      setActionOffset((prev) => prev + 1);
    }
  };

  const decrementOffset = () => {
    if (actionOffset > 0) {
      setActionOffset((prev) => prev - 1);
    }
  };

  const resetOffset = () => {
    setActionOffset(0);
  };

  const addDrawAction = (action: DrawAction) => {
    const store = getDefaultStore();
    const currentOffset = store.get(actionOffsetAtom);
    const previousActions = store.get(drawActionsAtom);
    const offsetActionList = previousActions.slice(
      0,
      previousActions.length - currentOffset,
    );
    setDrawActions([...offsetActionList, action]);
    resetOffset();
  };

  return {
    decrementOffset,
    incrementOffset,
    resetOffset,
    addDrawAction,
    resetActions,
  };
};

export const addDrawAction = (action: DrawAction) => {
  const store = getDefaultStore();
  const currentOffset = store.get(actionOffsetAtom);
  const previousActions = store.get(drawActionsAtom);
  const offsetActionList = previousActions.slice(
    0,
    previousActions.length - currentOffset,
  );
  store.set(drawActionsAtom, [...offsetActionList, action]);
  store.set(actionOffsetAtom, 0);
};
