export type ProjectionIdentifier =
  | 'EPSG:4326' // wgs84
  | 'EPSG:3857' // webmercator
  | 'EPSG:4230' // ed50 geografisk

  // EU89 UTM zones for Norway
  | 'EPSG:25832' // utm32n
  | 'EPSG:25833' // utm33n
  | 'EPSG:25834' // utm34n
  | 'EPSG:25835' // utm35n
  | 'EPSG:25836' // utm36n

  //ED50 UTM zones for Norway
  | 'EPSG:23031' // ed50 utm31n
  | 'EPSG:23032' // ed50 utm32n
  | 'EPSG:23033' // ed50 utm33n
  | 'EPSG:23034' // ed50 utm34n
  | 'EPSG:23035' // ed50 utm35n
  | 'EPSG:23036' // ed50 utm36n

  //NGO 1948
  | 'EPSG:27391' // NGO 1948 Gauss-Kruger sone 1
  | 'EPSG:27392' // NGO 1948 Gauss-Kruger sone 2
  | 'EPSG:27393' // NGO 1948 Gauss-Kruger sone 3
  | 'EPSG:27394' // NGO 1948 Gauss-Kruger sone 4
  | 'EPSG:27395' // NGO 1948 Gauss-Kruger sone 5
  | 'EPSG:27396' // NGO 1948 Gauss-Kruger sone 6
  | 'EPSG:27397' // NGO 1948 Gauss-Kruger sone 7
  | 'EPSG:27398'; //  NGO 1948 / Gauss-Kruger sone 8
