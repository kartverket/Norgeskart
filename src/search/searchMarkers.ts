import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { getInputCRS } from '../shared/utils/crsUtils';
import { SearchResult } from '../types/searchTypes';

type MarkerIcon = '/location/location_red.svg' | '/location/location_blue.svg';

const LOCATION_RED_SVG: MarkerIcon = '/location/location_red.svg';
const LOCATION_BLUE_SVG: MarkerIcon = '/location/location_blue.svg';

const createMarkerStyle = (iconSrc: MarkerIcon): Style => {
  return new Style({
    image: new Icon({
      src: iconSrc,
      anchor: [0.5, 1],
      scale: 2.0,
    }),
  });
};

const createMarker = (
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

let isClickHandlerAttached = false;

export const addSearchMarkers = (
  map: Map,
  searchResults: SearchResult[],
  hoveredResult: { lon: number; lat: number } | null,
  selectedResult: SearchResult | null,
  onMarkerClick: (res: SearchResult) => void,
) => {
  const markerLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get('id') === 'markerLayer');

  if (!markerLayer) return;

  const vectorMarkerLayer = markerLayer as VectorLayer;
  const source = vectorMarkerLayer.getSource() as VectorSource;

  source.clear();

  if (selectedResult) {
    if (isFinite(selectedResult.lon) && isFinite(selectedResult.lat)) {
      source.addFeature(createMarker(selectedResult, LOCATION_RED_SVG, map));
    }
    return;
  }

  searchResults.forEach((res) => {
    if (!isFinite(res.lon) || !isFinite(res.lat)) return;

    const isHovered =
      hoveredResult &&
      hoveredResult.lon === res.lon &&
      hoveredResult.lat === res.lat;
    const iconSrc = isHovered ? LOCATION_RED_SVG : LOCATION_BLUE_SVG;

    source.addFeature(createMarker(res, iconSrc, map));
  });

  if (!isClickHandlerAttached) {
    isClickHandlerAttached = true;

    map.on('singleclick', (evt) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const res = feature.get('searchResult');
        if (res) {
          onMarkerClick(res);
        }
      });
    });
  }
};
