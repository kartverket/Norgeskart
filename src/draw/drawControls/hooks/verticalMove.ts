import { useMapInteractions } from './mapInterations';

export const useVerticalMove = () => {
  const { getSelectInteraction } = useMapInteractions();
  const moveSelectedUp = () => {
    const selectedInteraction = getSelectInteraction();
    if (!selectedInteraction) {
      return;
    }
  };

  const moveSelectedDown = () => {};

  return { moveSelectedUp, moveSelectedDown };
};
