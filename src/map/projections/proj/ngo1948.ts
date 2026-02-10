import proj4 from 'proj4';
export const registerNGO1948Projections = () => {
  proj4.defs(
    'EPSG:27391',
    '+proj=tmerc +lat_0=58 +lon_0=-4.66666666666667 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27392',
    '+proj=tmerc +lat_0=58 +lon_0=-2.33333333333333 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27393',
    '+proj=tmerc +lat_0=58 +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27394',
    '+proj=tmerc +lat_0=58 +lon_0=2.5 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27395',
    '+proj=tmerc +lat_0=58 +lon_0=6.16666666666667 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27396',
    '+proj=tmerc +lat_0=58 +lon_0=10.1666666666667 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27397',
    '+proj=tmerc +lat_0=58 +lon_0=14.1666666666667 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );

  proj4.defs(
    'EPSG:27398',
    '+proj=tmerc +lat_0=58 +lon_0=18.3333333333333 +k=1 +x_0=0 +y_0=0 +a=6377492.018 +rf=299.1528128 +pm=oslo +towgs84=278.3,93,474.5,7.889,0.05,-6.61,6.21 +units=m +no_defs +type=crs',
  );
};
