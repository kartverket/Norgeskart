import { getDefaultStore } from 'jotai';
import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import { mapAtom } from '../../../map/atoms';

export const useMapInteractions = () => {
  const map = getDefaultStore().get(mapAtom);
  const getSelectInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Select)[0] as
      | Select
      | undefined;
  };
  const getTranslateInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Translate)[0] as
      | Translate
      | undefined;
  };

  const getDrawInteraction = () => {
    return map
      .getInteractions()
      .getArray()
      .filter((interaction) => interaction instanceof Draw)[0] as
      | Draw
      | undefined;
  };
  // Add map interaction hooks here in the future

  return { getSelectInteraction, getTranslateInteraction, getDrawInteraction };
};
