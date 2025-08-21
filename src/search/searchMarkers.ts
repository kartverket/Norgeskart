import { Feature } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import {
  Circle as CircleStyle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
} from 'ol/style';
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

const createClusterStyle = (feature: FeatureLike): Style => {
  const clusterFeatures = feature.get('features');

  if (clusterFeatures && clusterFeatures.length > 1) {
    return new Style({
      image: new CircleStyle({
        radius: 15,
        fill: new Fill({ color: '#476ED4B3' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
      }),
      text: new Text({
        text: clusterFeatures.length.toString(),
        fill: new Fill({ color: '#fff' }),
        font: 'bold 14px Arial',
      }),
    });
  }

  const singleFeature = clusterFeatures?.[0];
  if (singleFeature) {
    const style = singleFeature.getStyle?.();
    if (style) return style;
  }

  return createMarkerStyle(LOCATION_BLUE_SVG);
};

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

  const markerSource = new VectorSource();

  const clusterSource = new Cluster({
    distance: 40, 
    source: markerSource,
  });

  vectorMarkerLayer.setSource(clusterSource);

  vectorMarkerLayer.setStyle(createClusterStyle);

  markerSource.clear();

  if (selectedResult) {
    if (isFinite(selectedResult.lon) && isFinite(selectedResult.lat)) {
      const selectedMarker = createMarker(
        selectedResult,
        LOCATION_RED_SVG,
        map,
      );
      markerSource.addFeature(selectedMarker);
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

    const marker = createMarker(res, iconSrc, map);
    markerSource.addFeature(marker);
  });

  if (!isClickHandlerAttached) {
    isClickHandlerAttached = true;

    map.on('singleclick', (evt) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const clusteredFeatures: Feature[] | undefined =
          feature.get('features');
        if (!clusteredFeatures) return;

        if (clusteredFeatures.length === 1) {
          const res = clusteredFeatures[0].get('searchResult');
          if (res) {
            onMarkerClick(res);
          }
        } else {
          const results = clusteredFeatures.map((f) => f.get('searchResult'));
          console.log('Klikket på cluster med flere treff:', results);
        }
      });
    });
  }
};
