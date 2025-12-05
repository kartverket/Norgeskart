import { getDefaultStore } from 'jotai';
import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Translate from 'ol/interaction/Translate';
import { mapAtom } from '../../../map/atoms';

export const getSelectInteraction = () => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Select)[0] as
    | Select
    | undefined;
};
export const getTranslateInteraction = () => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Translate)[0] as
    | Translate
    | undefined;
};

export const getDrawInteraction = () => {
  const map = getDefaultStore().get(mapAtom);
  return map
    .getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof Draw)[0] as
    | Draw
    | undefined;
};
