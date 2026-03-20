import { atom, getDefaultStore } from 'jotai';
import { View } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import Map from 'ol/Map';
import { get as getProjection, transform } from 'ol/proj';

import { atomEffect } from 'jotai-effect';
import { v4 as uuidv4 } from 'uuid';
import { validateProjectionIdString } from '../shared/utils/enumUtils';
import { getUrlParameter, setUrlParameter } from '../shared/utils/urlUtils';
import { isMapLayerBackground, mapLayers } from './layers';
import { activeThemeLayersAtom } from './layers/atoms';
import { BackgroundLayerName } from './layers/backgroundLayers';
import {
  allConfiguredBackgroundLayers,
  backgroundLayerAtom,
} from './layers/config/backgroundLayers/atoms';
import { getLayerFromConfig } from './layers/config/backgroundLayers/utils';
import { themeLayerConfig } from './layers/themeLayerConfigApi';
import { scaleToResolution } from './mapScale';
import { ProjectionIdentifier } from './projections/types';

export const DEFAULT_PROJECTION: ProjectionIdentifier = 'EPSG:25833';
export const DEFAULT_ZOOM_LEVEL = 3;
export const DEFAULT_CENTER = [396722, 7197860]; // Center in EPSG:25833
export const DEFAULT_ROTATION = 0;

export const currentProjectionAtom = atom<ProjectionIdentifier>(
  validateProjectionIdString(getUrlParameter('projection')) ||
    DEFAULT_PROJECTION,
);

export const mapOrientationAtom = atom<number>(0);
export const mapOrientationDegreesAtom = atom<number>((get) => {
  const radians = get(mapOrientationAtom);
  return (radians * 180) / Math.PI; // Convert radians to degrees
});

export const displayMapLegendAtom = atom<boolean>(false);
export const displayMapLegendControlAtom = atom<boolean>((get) => {
  const displayMapLegned = get(displayMapLegendAtom);
  const activeThemeLayers = get(activeThemeLayersAtom);

  const hasLegend = Array.from(activeThemeLayers).some((layerName) => {
    const layerDef = themeLayerConfig.layers.find((l) => l.id === layerName);
    return layerDef && !layerDef.noLegend;
  });
  return !displayMapLegned && hasLegend;
});
export const displayCompassOverlayAtom = atom<boolean>(false);
export const useMagneticNorthAtom = atom<boolean>(false);
export const magneticDeclinationAtom = atom<number>(0);

export const getBackgroundLayerImageName = (
  layerName: BackgroundLayerName,
): string => {
  switch (layerName) {
    case 'Nibcache_web_mercator_v2':
    case 'Nibcache_UTM32_EUREF89_v2':
    case 'Nibcache_UTM33_EUREF89_v2':
    case 'Nibcache_UTM35_EUREF89_v2':
      return 'Nibcache_web_mercator_v2';
    case 'nautical-background':
      return 'sjokartraster'; // Use nautical chart image for nautical background for now
    case 'Basisdata_NP_Basiskart_Svalbard_WMTS_25833':
      return 'svalbard';
    case 'Basisdata_NP_Basiskart_JanMayen_WMTS_25833':
      return 'jan_mayen';
    default:
      return layerName;
  }
};

const getInitialMapView = () => {
  const projectionIdFromUrl = validateProjectionIdString(
    getUrlParameter('projection'),
  );
  const projectionId = projectionIdFromUrl
    ? projectionIdFromUrl
    : DEFAULT_PROJECTION;

  const initialProjection = getProjection(projectionId)!;

  let initialZoom = DEFAULT_ZOOM_LEVEL;
  let initialCenter = DEFAULT_CENTER;
  let initialRotation = DEFAULT_ROTATION;

  const lon = getUrlParameter('lon');
  const lat = getUrlParameter('lat');
  if (lon != null && lat != null) {
    const parsedLon = parseFloat(lon);
    const parsedLat = parseFloat(lat);
    if (!Number.isNaN(parsedLon) && !Number.isNaN(parsedLat)) {
      initialCenter = [parsedLon, parsedLat];
    }
  }

  const zoom = getUrlParameter('zoom');
  if (zoom != null) {
    const parsedZoom = parseFloat(zoom);
    if (!Number.isNaN(parsedZoom)) {
      initialZoom = parsedZoom;
    }
  }
  const rotation = getUrlParameter('rotation');
  if (rotation != null) {
    const parsedRotation = parseFloat(rotation);
    if (!Number.isNaN(parsedRotation)) {
      initialRotation = parsedRotation;
    }
  }

  return new View({
    center: initialCenter,
    minZoom: 3,
    maxZoom: 20,
    zoom: initialZoom,
    rotation: initialRotation,
    projection: initialProjection,
    constrainResolution: true,
    smoothResolutionConstraint: false,
  });
};

export const mapAtom = atom<Map>(() => {
  const map = new Map({
    controls: defaultControls({ zoom: false, rotate: false }).extend([
      new ScaleLine({ minWidth: 100 }),
    ]),
    keyboardEventTarget: document,
  });

  map.addLayer(mapLayers.markerLayer.getLayer());
  map.addLayer(mapLayers.drawLayer.getLayer());
  map.addLayer(mapLayers.drawOverlayLayer.getLayer());
  map.addLayer(mapLayers.posterMarkerLayer.getLayer());

  const intialView = getInitialMapView();

  map.setView(intialView);
  map.on('moveend', (e) => {
    const view = e.map.getView();
    const center = view.getCenter();
    if (center) {
      setUrlParameter('lon', center[0].toString());
      setUrlParameter('lat', center[1].toString());
    }
    const rotation = view.getRotation();
    if (!Number.isNaN(rotation)) {
      setUrlParameter('rotation', rotation.toString());
    }
    const zoom = view.getZoom();
    if (zoom && !Number.isNaN(zoom)) {
      setUrlParameter('zoom', zoom.toString());
    }
  });
  const mapId = uuidv4();
  map.setProperties({ id: mapId });

  return map;
});

export const availableScales = [
  5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000,
];

export const scaleAtom = atom<number | null>(null);

export const scaleToResolutionEffect = atomEffect((get) => {
  const scale = get(scaleAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  if (!map || !scale) return;

  const view = map.getView();
  const resolution = scaleToResolution(scale, map);
  view.setResolution(resolution);
});

export const projectionEffect = atomEffect((get, set) => {
  const projectionId = get(currentProjectionAtom);
  const store = getDefaultStore();
  const map = store.get(mapAtom);

  const oldView = map.getView();
  const oldProjection = oldView.getProjection();
  const oldProjectionCode = oldProjection.getCode();

  if (oldProjectionCode === projectionId) return;

  const backgroundLayerName = store.get(backgroundLayerAtom);
  const activeThemeLayers = store.get(activeThemeLayersAtom);

  const projection = getProjection(projectionId)!;
  const oldCenter = oldView.getCenter();

  const newCenter = oldCenter
    ? transform(oldCenter, oldProjection, projection)
    : undefined;

  let newZoom = oldView.getZoom() ?? DEFAULT_ZOOM_LEVEL;
  if (oldProjectionCode !== 'EPSG:3857' && projectionId === 'EPSG:3857') {
    newZoom += 1;
  } else if (
    oldProjectionCode === 'EPSG:3857' &&
    projectionId !== 'EPSG:3857'
  ) {
    newZoom -= 1;
  }
  newZoom = Math.round(newZoom);

  map.setView(
    new View({
      center: newCenter,
      zoom: newZoom,
      minZoom: oldView.getMinZoom(),
      maxZoom: oldView.getMaxZoom(),
      projection,
      constrainResolution: true,
      extent: projection.getExtent(),

      smoothResolutionConstraint: false,
    }),
  );

  if (activeThemeLayers.size > 0) {
    map
      .getLayers()
      .getArray()
      .filter((l) => l.get('id')?.startsWith('theme.'))
      .forEach((l) => map.removeLayer(l));
    set(activeThemeLayersAtom, new Set(activeThemeLayers));
  }

  setUrlParameter('projection', projectionId);

  const currentBackgroundLayer = map.getAllLayers().find(isMapLayerBackground);

  if (currentBackgroundLayer) {
    const bgLayerProjection = currentBackgroundLayer
      .getSource()
      ?.getProjection()
      ?.getCode();

    if (bgLayerProjection && bgLayerProjection !== projectionId) {
      const layerConfig = allConfiguredBackgroundLayers.find(
        (config) => config.layerName === backgroundLayerName,
      );

      if (layerConfig) {
        getLayerFromConfig(layerConfig).then((layer) => {
          if (layer) {
            map.removeLayer(currentBackgroundLayer);
            map.addLayer(layer);
          } else {
            console.warn(
              `Could not create layer for ${backgroundLayerName} with projection ${projectionId}`,
            );
          }
        });
      }
    }
  }
});
