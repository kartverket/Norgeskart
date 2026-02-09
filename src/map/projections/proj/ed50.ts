import proj4 from 'proj4';

export const registerED50Projections = () => {
  //  UTM zones
  proj4.defs(
    'EPSG:23031',
    '+proj=utm +zone=31 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:23032',
    '+proj=utm +zone=32 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:23033',
    '+proj=utm +zone=33 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:23034',
    '+proj=utm +zone=34 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:23035',
    '+proj=utm +zone=35 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs +type=crs',
  );

  //Geografical
  proj4.defs(
    'EPSG:4230',
    '+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs +type=crs',
  );
};
