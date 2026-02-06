import { useAtomValue, useSetAtom } from 'jotai';
import { View } from 'ol';
import { Listener } from 'ol/events';
import { get as getProjection, transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { calculateAzimuth } from '../shared/utils/coordinateCalculations';
import {
  getListUrlParameter,
  getUrlParameter,
  setUrlParameter,
} from '../shared/utils/urlUtils';
import {
  DEFAULT_ZOOM_LEVEL,
  magneticDeclinationAtom,
  mapAtom,
  mapOrientationAtom,
} from './atoms';
import { isMapLayerBackground } from './layers';
import {
  BackgroundLayerName,
  useBackgoundLayers,
} from './layers/backgroundLayers';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
} from './layers/backgroundWMTSProviders';
import { useThemeLayers } from './layers/themeLayers';
import { ThemeLayerName } from './layers/themeWMS';
import { ProjectionIdentifier } from './types/projections';

const ROTATION_ANIMATION_DURATION = 500;

const useMap = () => {
  const map = useAtomValue(mapAtom);

  const setMapOrientation = useSetAtom(mapOrientationAtom);
  const setMagneticDeclination = useSetAtom(magneticDeclinationAtom);

  const setTargetElement = (element: HTMLDivElement | null) => {
    if (!map.getTarget() && element) {
      map.setTarget(element);
    } else if (element == null) {
      map.setTarget(undefined);
    }
  };

  map.getView().on('change:center', (e) => {
    const newCenter = e.target.getCenter();

    const projection = map.getView().getProjection();
    const angleCoords = transform(newCenter, projection, 'EPSG:4326');

    const magneticNorth = [162.867, 86.494];
    const azimuth = calculateAzimuth(
      angleCoords[1], // latitude
      angleCoords[0], // longitude
      magneticNorth[1], // magnetic north latitude
      magneticNorth[0], // magnetic north longitude)
    );

    setMagneticDeclination((prev) => {
      const diff = Math.abs(azimuth - prev);
      if (isNaN(diff) || diff < 0.01) {
        return prev; // No significant change, return previous value
      }
      return azimuth;
    });
  });
  map.getView().on('change:rotation', (e) => {
    const rotation = e.target.getRotation();
    setMapOrientation(rotation);
  });

  const mapElement = map.getTarget() as HTMLElement | undefined;
  return { mapElement, setTargetElement };
};

const useMapSettings = () => {
  const map = useAtomValue(mapAtom);
  const WMTSloadable = useAtomValue(loadableWMTS);
  const { backgroundLayerState, getBackgroundLayer } = useBackgoundLayers();
  const { removeThemeLayerFromMap, addThemeLayerToMap } = useThemeLayers();

  const getMapViewCenter = () => {
    const view = map.getView();
    return view.getCenter();
  };

  const getMapProjection = () => {
    return map.getView().getProjection();
  };

  const getMapProjectionCode = () => {
    return getMapProjection().getCode() as ProjectionIdentifier;
  };

  const setBackgroundLayer = (backgroundLayerName: BackgroundLayerName) => {
    if (backgroundLayerState !== 'hasData') {
      console.warn('Background layers are not loaded yet');
      return;
    }

    let layerToAdd = getBackgroundLayer(backgroundLayerName);
    let actualLayerName = backgroundLayerName;

    // If requested layer is not available, fall back to default
    if (layerToAdd == null) {
      console.warn(
        `Background layer ${backgroundLayerName} is not available for current projection, falling back to ${DEFAULT_BACKGROUND_LAYER}`,
      );
      layerToAdd = getBackgroundLayer(DEFAULT_BACKGROUND_LAYER);
      actualLayerName = DEFAULT_BACKGROUND_LAYER;

      if (layerToAdd == null) {
        console.error('Default background layer is also not available');
        return;
      }
    }

    const WTMSLayers = map.getLayers().getArray().filter(isMapLayerBackground);
    WTMSLayers.forEach((layer) => {
      map.removeLayer(layer);
    });

    map.addLayer(layerToAdd);
    setUrlParameter('backgroundLayer', actualLayerName);
  };

  const zoomIn = () => {
    const view = map.getView();
    const currZoom = view.getZoom();
    if (currZoom == null || currZoom === view.getMaxZoom()) {
      return;
    }
    view.animate({
      zoom: Math.round(currZoom + 1),
      duration: 200,
    });
  };

  const zoomOut = () => {
    const view = map.getView();
    const currZoom = view.getZoom();
    if (currZoom == null || currZoom === view.getMinZoom()) {
      return;
    }
    view.animate({
      zoom: Math.round(currZoom - 1),
      duration: 200,
    });
  };

  const setProjection = (projectionId: ProjectionIdentifier) => {
    const projection = getProjection(projectionId)!;
    if (WMTSloadable.state !== 'hasData') {
      console.warn('WMTS data is not loaded yet');
      return;
    }

    // Optionally, transform the current center to the new projection
    const oldView = map.getView();
    const oldCenter = oldView.getCenter();
    const oldProjection = oldView.getProjection();

    const backgroundLayerUrlParam: BackgroundLayerName =
      (getUrlParameter('backgroundLayer') as BackgroundLayerName) ||
      DEFAULT_BACKGROUND_LAYER;

    let newCenter = undefined;
    if (oldProjection.getCode() === projection.getCode()) {
      newCenter = oldCenter; // No transformation needed if projections are the same
    } else if (oldCenter && oldProjection) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }

    let newZoom = oldView.getZoom() || DEFAULT_ZOOM_LEVEL;
    if (
      projectionId === 'EPSG:3857' &&
      oldProjection.getCode() !== 'EPSG:3857'
    ) {
      newZoom += 1;
    }

    if (
      projectionId !== 'EPSG:3857' &&
      oldProjection.getCode() === 'EPSG:3857'
    ) {
      newZoom -= 1;
    }

    // Round zoom to integer to ensure it aligns with tile matrix
    newZoom = Math.round(newZoom);

    const newView = new View({
      center: newCenter,
      zoom: newZoom,
      minZoom: oldView.getMinZoom(),
      maxZoom: oldView.getMaxZoom(),
      projection: projection,
      constrainResolution: false,
      extent: projection.getExtent(),
    });
    oldView.getListeners('change:rotation')?.forEach((listener: Listener) => {
      newView.addEventListener('change:rotation', listener);
    });
    oldView.getListeners('change:center')?.forEach((listener: Listener) => {
      newView.addEventListener('change:center', listener);
    });

    map.setView(newView);
    setBackgroundLayer(backgroundLayerUrlParam);
    const themeLayerNames = getListUrlParameter('themeLayers');
    if (themeLayerNames) {
      themeLayerNames.forEach((layerName) => {
        removeThemeLayerFromMap(layerName as ThemeLayerName);
        addThemeLayerToMap(layerName as ThemeLayerName);
      });
    }
    setUrlParameter('projection', projectionId);
  };

  const setMapFullScreen = (shouldBeFullscreen: boolean) => {
    if (!document.fullscreenEnabled) {
      return;
    }
    const mapElement = map.getTarget() as HTMLElement | undefined;
    if (!mapElement) {
      return;
    }
    if (shouldBeFullscreen) {
      mapElement
        .requestFullscreen()
        .catch((err) =>
          console.error('Error attempting to enable full-screen mode:', err),
        );
    } else {
      document.exitFullscreen();
    }
  };

  const setMapLocation = (
    location: [number, number],
    locationProjection: string | null = null,
    zoomLevel: number | null = null,
  ) => {
    const currentMapProjection = map.getView().getProjection();
    const sourceProjection = getProjection(
      locationProjection || currentMapProjection.getCode(),
    );
    if (!sourceProjection) {
      console.error(`Projection ${locationProjection} not found`);
      return;
    }
    const transformedLocation = transform(
      location,
      sourceProjection,
      map.getView().getProjection(),
    );
    map.getView().setCenter(transformedLocation);
    if (zoomLevel !== null) {
      map.getView().setZoom(zoomLevel);
    }
    setUrlParameter('lon', transformedLocation[0]);
    setUrlParameter('lat', transformedLocation[1]);
  };

  const setMapAngle = (angle: number) => {
    const view = map.getView();
    view.animate({
      rotation: angle,
      duration: ROTATION_ANIMATION_DURATION,
    });
  };

  const rotatateMap = (angle: number) => {
    const view = map.getView();
    const currentRotation = view.getRotation();
    const newRotation = currentRotation + angle;
    view.animate({
      rotation: newRotation,
      duration: ROTATION_ANIMATION_DURATION,
    });
  };

  const rotateSnappy = (direction: 'left' | 'right') => {
    const view = map.getView();
    const currentRotation = view.getRotation();
    const angle = Math.PI / 4; // 45 degrees in radians
    let newRotation;

    if (direction === 'left') {
      newRotation = currentRotation - angle;
    } else {
      newRotation = currentRotation + angle;
    }

    // Round to the nearest multiple of 45 degrees
    newRotation = Math.round(newRotation / angle) * angle;

    view.animate({
      rotation: newRotation,
      duration: ROTATION_ANIMATION_DURATION,
    });
  };

  return {
    getMapProjection,
    getMapProjectionCode,
    getMapViewCenter,
    rotatateMap,
    rotateSnappy,
    setMapAngle,
    setMapFullScreen,
    setMapLocation,
    setProjection,
    setBackgroundLayer,
    zoomIn,
    zoomOut,
  };
};

const useCompassFileName = () => {
  const { i18n } = useTranslation();
  switch (i18n.language) {
    case 'nb':
    case 'nn':
      return 'compass_no.svg';

    case 'en':
      return 'compass_en.svg';
    default:
      return 'compass_no.svg'; // Default to Norwegian Bokmål
  }
};

export { useCompassFileName, useMap, useMapSettings };
