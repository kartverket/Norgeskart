import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { registerETRS89Projections, setETRS89Extents } from './etrs89';
import { registerNGO1948Projections } from './ngo1948';
import { registerWGS84Projections } from './wgs84';

export const projInit = () => {
  proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80');

  registerETRS89Projections();
  registerNGO1948Projections();
  registerWGS84Projections();

  // eslint-disable-next-line
  register(proj4 as any);

  setETRS89Extents();
};
