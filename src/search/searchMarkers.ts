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

export const addSearchMarkers = (
  map: Map,
  searchResults: SearchResult[],
  hoveredResult: { lon: number; lat: number } | null,
  selectedResult: SearchResult | null,
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
    const { lon, lat } = selectedResult;

    if (isFinite(lon) && isFinite(lat)) {
      const marker = new Feature({
        geometry: new Point(
          transform(
            [lon, lat],
            getInputCRS(selectedResult),
            map.getView().getProjection(),
          ),
        ),
      });
      marker.setStyle(createMarkerStyle(LOCATION_RED_SVG));
      source.addFeature(marker);
    }
    return;
  }

  searchResults.forEach((res) => {
    const { lon, lat } = res;

    if (!isFinite(lon) || !isFinite(lat)) {
      return;
    }

    const isHovered =
      hoveredResult && hoveredResult.lon === lon && hoveredResult.lat === lat;
    const svgSrc = isHovered ? LOCATION_RED_SVG : LOCATION_BLUE_SVG;

    const marker = new Feature({
      geometry: new Point(
        transform([lon, lat], getInputCRS(res), map.getView().getProjection()),
      ),
    });
    marker.setStyle(createMarkerStyle(svgSrc));
    source.addFeature(marker);
  });
};
