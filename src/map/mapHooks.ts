import { useAtomValue, useSetAtom } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition';
import { Listener } from 'ol/events';
import { get as getProjection, transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { calculateAzimuth } from '../shared/utils/coordinateCalculations';
import { validateBackgroundLayerIdString } from '../shared/utils/enumUtils';
import { getUrlParameter, setUrlParameter } from '../shared/utils/urlUtils';
import {
  magneticDeclinationAtom,
  mapAtom,
  mapOrientationAtom,
  ProjectionIdentifier,
} from './atoms';
import { BackgroundLayer, mapLayers } from './layers';
import { getMousePositionControl } from './mapControls';

const ROTATION_ANIMATION_DURATION = 500;

const getBackgroundLayerId = () => {
  const backgroundLayerIdFromUrl = validateBackgroundLayerIdString(
    getUrlParameter('backgroundLayer'),
  );
  return backgroundLayerIdFromUrl ? backgroundLayerIdFromUrl : 'topo';
};

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

  const getMapViewCenter = () => {
    const view = map.getView();
    return view.getCenter();
  };

  const setBackgroundLayer = (layerName: BackgroundLayer) => {
    const backgroundLayers = map
      .getLayers()
      .getArray()
      .filter((layer) => {
        const layerId = layer.get('id') as string;
        return layerId.startsWith('bg_');
      });

    backgroundLayers.forEach((layer) => {
      map.removeLayer(layer);
    });
    map.addLayer(
      mapLayers.backgroundLayers[layerName].getLayer(
        map.getView().getProjection().getCode() as ProjectionIdentifier,
      ),
    );
    setUrlParameter('backgroundLayer', layerName);
  };

  const setProjection = (projectionId: ProjectionIdentifier) => {
    const projection = getProjection(projectionId)!;

    // Optionally, transform the current center to the new projection
    const oldView = map.getView();
    const oldCenter = oldView.getCenter();
    const oldProjection = oldView.getProjection();

    let newCenter = undefined;
    if (oldProjection.getCode() === projection.getCode()) {
      newCenter = oldCenter; // No transformation needed if projections are the same
    } else if (oldCenter && oldProjection) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }
    map
      .getLayers()
      .getArray()
      .filter((layer) => {
        const layerId = layer.get('id') as string;
        return layerId === 'europaForenklet' || layerId.startsWith('bg_');
      })
      .forEach((layer) => {
        map.removeLayer(layer);
      });

    map.addLayer(mapLayers.europaForenklet.getLayer(projectionId));
    map.addLayer(
      mapLayers.backgroundLayers[getBackgroundLayerId()].getLayer(projectionId),
    );

    // Create a new view with the new projection
    const newView = new View({
      center: newCenter,
      zoom: oldView.getZoom(),
      minZoom: oldView.getMinZoom(),
      maxZoom: oldView.getMaxZoom(),
      projection: projection,

      extent: projection.getExtent(),
    });

    oldView.getListeners('change:rotation')?.forEach((listener: Listener) => {
      newView.addEventListener('change:rotation', listener);
    });
    oldView.getListeners('change:center')?.forEach((listener: Listener) => {
      newView.addEventListener('change:center', listener);
    });

    map.setView(newView);

    const mousePositionInteraction = map
      .getControls()
      .getArray()
      .filter((control) => {
        return control instanceof MousePosition;
      })[0];
    map.removeControl(mousePositionInteraction);
    map.addControl(getMousePositionControl(projectionId));
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
    setUrlParameter('x', transformedLocation[0]);
    setUrlParameter('y', transformedLocation[1]);
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
    setMapAngle,
    rotatateMap,
    rotateSnappy,
    getMapViewCenter,
    setMapFullScreen,
    setBackgroundLayer,
    setProjection,
    setMapLocation,
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

export { getBackgroundLayerId, useCompassFileName, useMap, useMapSettings };
