import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

export const projInit = () => {
  proj4.defs(
    'EPSG:25832',
    '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:25833',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:25835',
    '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  );

  register(proj4);

  getProjection('EPSG:25832')?.setExtent([
    -1866822.47, 3680224.65, 3246120.36, 9483069.2,
  ]);

  getProjection('EPSG:25833')?.setExtent([
    -2450512.62, 3680451.78, 2665647.82, 9493779.8,
  ]);
  getProjection('EPSG:25835')?.setExtent([
    -3646007.42, 3680723.36, 1528001.15, 9567789.69,
  ]);
};
