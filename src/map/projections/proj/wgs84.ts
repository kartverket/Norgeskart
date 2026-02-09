import proj4 from 'proj4';

export const registerWGS84Projections = () => {
  proj4.defs(
    'EPSG:32631',
    '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:32632',
    '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:32633',
    '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:32634',
    '+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:32635',
    '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs +type=crs',
  );
  proj4.defs(
    'EPSG:32636',
    '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs +type=crs',
  );
};
