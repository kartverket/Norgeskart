import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { createEmpty, extend } from 'ol/extent';
import { Point } from 'ol/geom';
import Map from 'ol/Map';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import { getMarkerLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { SearchResult } from '../../types/searchTypes';
import { clusterStyle } from './cluster';
import { createMarker } from './marker';
import { clusterPopup } from './popup';

const handleMarkerClick = (
  feature: Feature,
  onResultClick: (res: SearchResult) => void,
) => {
  const res = feature.get('searchResult');
  if (res) {
    onResultClick(res);
  }
};

const handleClusterClick = (
  clusterFeatures: Feature[],
  map: Map,
  onResultClick: (res: SearchResult) => void,
) => {
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
      clusterPopup(results, map, coordinates, onResultClick);
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
  searchResults: SearchResult[],
  hoveredResult: { lon: number; lat: number } | null,
  selectedResult: SearchResult | null,
  onResultClick: (res: SearchResult) => void,
) => {
  const map = getDefaultStore().get(mapAtom);
  const markerLayer = getMarkerLayer();

  const markerSource = new VectorSource();

  const clusterSource = new Cluster({
    distance: 40,
    source: markerSource,
  });

  markerLayer.setSource(clusterSource);

  markerLayer.setStyle((feature) => clusterStyle(feature, hoveredResult));

  markerSource.clear();

  if (selectedResult) {
    if (isFinite(selectedResult.lon) && isFinite(selectedResult.lat)) {
      const selectedMarker = createMarker(selectedResult, 'red', map);
      markerSource.addFeature(selectedMarker);
    }
    if (selectedResult.type !== 'Coordinate') {
      return;
    }
  }

  searchResults.forEach((res) => {
    if (!isFinite(res.lon) || !isFinite(res.lat)) return;
    // Skip if this result is the same as the selected result to avoid duplicate markers
    if (
      selectedResult &&
      res.lon === selectedResult.lon &&
      res.lat === selectedResult.lat
    ) {
      return;
    }

    const isHovered =
      hoveredResult &&
      hoveredResult.lon === res.lon &&
      hoveredResult.lat === res.lat;

    const iconSrc = isHovered ? 'red' : 'blue';

    const marker = createMarker(res, iconSrc, map);
    marker.setProperties({ isMarker: true });
    markerSource.addFeature(marker);
  });

  if (!map.get('markerClickHandler')) {
    map.set('markerClickHandler', true);
    map.on('singleclick', (evt) => {
      const isPrintDialogOpen = getDefaultStore().get(isPrintDialogOpenAtom);
      if (isPrintDialogOpen) {
        return;
      }
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const featuresAtPixel = feature.get('features') as Feature[];
        if (!featuresAtPixel) {
          return;
        }

        if (featuresAtPixel.length === 1) {
          handleMarkerClick(featuresAtPixel[0], onResultClick);
        } else {
          handleClusterClick(featuresAtPixel, map, onResultClick);
        }
      });
    });
  }
};
