import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { SearchResult } from '../../types/searchTypes';
import { getInputCRS } from './crsUtils';

const createMarkerStyle = (iconSrc: string): Style => {
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
      marker.setStyle(createMarkerStyle('/location_red.svg'));
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
    const svgSrc = isHovered ? '/location_red.svg' : '/location_blue.svg';

    const marker = new Feature({
      geometry: new Point(
        transform([lon, lat], getInputCRS(res), map.getView().getProjection()),
      ),
    });
    marker.setStyle(createMarkerStyle(svgSrc));
    source.addFeature(marker);
  });
};
