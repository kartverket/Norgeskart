import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { registerED50Projections } from './ed50';
import { registerEUREF89Projections, setEUREF89Extents } from './euref89';
import { registerNGO1948Projections } from './ngo1948';
import { registerWGS84Projections } from './wgs84';

export const projInit = () => {
  proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80');

  registerEUREF89Projections();
  registerNGO1948Projections();
  registerWGS84Projections();
  registerED50Projections();

  // eslint-disable-next-line
  register(proj4 as any);

  setEUREF89Extents();
};
