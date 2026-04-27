import { getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { setUrlParameter } from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import { backgroundLayerAtom } from './config/backgroundLayers/atoms';
import { eccStyleAtom } from './eccStyle';

export const eccStyleEffect = atomEffect((get) => {
  const style = get(eccStyleAtom);
  const bgLayer = get(backgroundLayerAtom);
  if (bgLayer !== 'oceanicelectronic') return;

  if (style) {
    setUrlParameter('eccStyle', style);
  }

  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const layer = map
    .getAllLayers()
    .find((l) => l.get('id') === 'bg.oceanicelectronic');
  if (!(layer instanceof TileLayer)) return;
  const source = layer.getSource();
  if (!(source instanceof TileWMS)) return;
  source.updateParams({ STYLES: style });
});
