import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

export const projInit = () => {
  proj4.defs(
    'EPSG:25832',
    '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
  );
  proj4.defs(
    'http://www.opengis.net/def/crs/EPSG/0/25832',
    proj4.defs('EPSG:25832'),
  );
  proj4.defs(
    'EPSG:25833',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
  );
  proj4.defs(
    'http://www.opengis.net/def/crs/EPSG/0/25833',
    proj4.defs('EPSG:25833'),
  );

  proj4.defs(
    'EPSG:25834',
    '+proj=utm +zone=34 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
  );
  proj4.defs(
    'http://www.opengis.net/def/crs/EPSG/0/25834',
    proj4.defs('EPSG:25834'),
  );

  proj4.defs(
    'EPSG:25835',
    '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
  );
  proj4.defs(
    'http://www.opengis.net/def/crs/EPSG/0/25835',
    proj4.defs('EPSG:25835'),
  );

  proj4.defs(
    'EPSG:25836',
    '+proj=utm +zone=36 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +type=crs',
  );
  proj4.defs(
    'http://www.opengis.net/def/crs/EPSG/0/25836',
    proj4.defs('EPSG:25836'),
  );

  proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80');

  // eslint-disable-next-line
  register(proj4 as any);

  getProjection('EPSG:25832')?.setExtent([
    -2000000.0, 3500000.0, 3545984.0, 9045984.0,
  ]);

  getProjection('EPSG:25833')?.setExtent([
    -2500000.0, 3500000.0, 3045984.0, 9045984.0,
  ]);
  getProjection('EPSG:25834')?.setExtent([
    -3000000.0, 3500000.0, 2545984.0, 9045984.0,
  ]);
  getProjection('EPSG:25835')?.setExtent([
    -3500000.0, 3500000.0, 2045984.0, 9045984.0,
  ]);
  getProjection('EPSG:25836')?.setExtent([
    -4000000.0, 3500000.0, 1545984.0, 9045984.0,
  ]);
};
