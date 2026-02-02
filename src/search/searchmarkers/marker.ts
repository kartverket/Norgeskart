import { Feature, Map } from 'ol';
import { Point } from 'ol/geom';
import { transform } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';

type MakrerColor = 'red' | 'blue' | 'yellow' | 'green' | 'orange';

export const createMarkerStyle = (iconSrc: string): Style => {
  return new Style({
    image: new Icon({
      src: iconSrc,
      anchor: [0.5, 1],
      scale: 2.0,
    }),
  });
};

export const createMarker = (
  res: SearchResult,
  markerColor: MakrerColor,
  map: Map,
): Feature => {
  const iconSrc = `/location/location_${markerColor}.svg`;
  const marker = new Feature({
    geometry: new Point(
      transform(
        [res.lon, res.lat],
        getInputCRS(res),
        map.getView().getProjection(),
      ),
    ),
  });
  marker.setProperties({ searchResult: res });
  marker.setStyle(createMarkerStyle(iconSrc));
  return marker;
};

export const createMarkerFromCoordinate = (
  lon: number,
  lat: number,
  markerColor: MakrerColor,
): Feature => {
  const marker = new Feature({
    geometry: new Point([lon, lat]),
  });
  const iconSrc = `/location/location_${markerColor}.svg`;
  marker.set('isMarker', true);
  marker.setStyle(createMarkerStyle(iconSrc));
  return marker;
};
