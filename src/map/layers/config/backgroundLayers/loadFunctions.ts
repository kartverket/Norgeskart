import ImageTile from 'ol/ImageTile';
import Tile, { LoadFunction } from 'ol/Tile';
import { getEnv } from '../../../../env';
const env = getEnv();
export const nibTileLoadFunction: LoadFunction = (
  imageTile: Tile,
  src: string,
) => {
  const token = env.layerProviderParameters.norgeIBilder.apiKey;
  if (imageTile instanceof ImageTile) {
    const image = imageTile.getImage();
    if (image instanceof HTMLImageElement) {
      image.src = src + (src.includes('?') ? '&' : '?') + 'token=' + token;
    }
  }
};
