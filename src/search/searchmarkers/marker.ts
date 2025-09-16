import { Feature, Map } from 'ol';
import { Point } from 'ol/geom';
import { transform } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { getInputCRS } from '../../shared/utils/crsUtils';
import { SearchResult } from '../../types/searchTypes';

type MarkerIcon = '/location/location_red.svg' | '/location/location_blue.svg';

export const LOCATION_RED_SVG: MarkerIcon = '/location/location_red.svg';
export const LOCATION_BLUE_SVG: MarkerIcon = '/location/location_blue.svg';

export const createMarkerStyle = (iconSrc: MarkerIcon): Style => {
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
  iconSrc: MarkerIcon,
  map: Map,
): Feature => {
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
