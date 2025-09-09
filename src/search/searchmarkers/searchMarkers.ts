import { Feature } from 'ol';
import { createEmpty, extend } from 'ol/extent';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import { SearchResult } from '../../types/searchTypes';
import { clusterStyle } from './cluster';
import { createMarker, LOCATION_BLUE_SVG, LOCATION_RED_SVG } from './marker';
import { clusterPopup } from './popup';

let isClickHandlerAttached = false;

const handleMarkerClick = (
  feature: Feature,
  onMarkerClick: (res: SearchResult) => void,
) => {
  const res = feature.get('searchResult');
  if (res) {
    onMarkerClick(res);
  }
};

const handleClusterClick = (clusterFeatures: Feature[], map: Map) => {
  const results = clusterFeatures.map(
    (f) => f.get('searchResult') as SearchResult,
  );
  const view = map.getView();
  const currentZoom = view.getZoom() || 0;
  const maxZoom = view.getMaxZoom();
  const minZoom = Math.min(currentZoom + 2, maxZoom);

  if (currentZoom === maxZoom) {
    const clusterGeometry = clusterFeatures[0].getGeometry();
    if (clusterGeometry && clusterGeometry instanceof Point) {
      const coordinates = clusterGeometry.getCoordinates();
      clusterPopup(results, map, coordinates);
    }
  } else {
    const extent = createEmpty();
    clusterFeatures.forEach((clusterFeature: Feature) => {
      const geometry = clusterFeature.getGeometry();
      if (geometry) {
        extend(extent, geometry.getExtent());
      }
    });
    view.fit(extent, {
      duration: 500,
      padding: [50, 50, 50, 50],
      maxZoom: minZoom,
    });
  }
};

export const updateSearchMarkers = (
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

  vectorMarkerLayer.setStyle((feature) => clusterStyle(feature, hoveredResult));

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
        const featuresAtPixel = feature.get('features') as Feature[];
        if (!featuresAtPixel) return;

        if (featuresAtPixel.length === 1) {
          handleMarkerClick(featuresAtPixel[0], onMarkerClick);
        } else {
          handleClusterClick(featuresAtPixel, map);
        }
      });
    });
  }
};
