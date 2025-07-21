import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

export const projInit = () => {
  proj4.defs([
    [
      'EPSG:25832',
      '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    ],
    [
      'EPSG:25833',
      '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    ],
    [
      'EPSG:25835',
      '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    ],
    ['EPSG:4258', '+proj=longlat +ellps=GRS80 +no_defs'],
  ]);

  // eslint-disable-next-line
  register(proj4 as any);

  getProjection('EPSG:25832')?.setExtent([
    -4450512.62, 680451.78, 2665647.82, 9493779.8,
  ]);

  getProjection('EPSG:25833')?.setExtent([
    -4450512.62, 680451.78, 2665647.82, 9493779.8,
  ]);
  getProjection('EPSG:25835')?.setExtent([
    -5646007.42, 680723.36, 2528001.15, 9567789.69,
  ]);
};
