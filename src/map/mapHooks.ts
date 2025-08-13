import { useAtomValue, useSetAtom } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition';
import { Listener } from 'ol/events';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection, transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { calculateAzimuth } from '../shared/utils/coordinateCalculations';
import { getUrlParameter, setUrlParameter } from '../shared/utils/urlUtils';
import {
  DEFAULT_ZOOM_LEVEL,
  magneticDeclinationAtom,
  mapAtom,
  mapOrientationAtom,
  ProjectionIdentifier,
} from './atoms';
import { isMapLayerBackground } from './layers';
import {
  DEFAULT_BACKGROUND_LAYER,
  loadableWMTS,
  WMTSLayerName,
  WMTSProviderId,
} from './layers/backgroundProviders';
import { getMousePositionControl } from './mapControls';

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

  const getNibProviderKeyForProjections = (
    projection: ProjectionIdentifier,
  ) => {
    if (WMTSloadable.state !== 'hasData') {
      console.warn('WMTS data is not loaded yet');
      return null;
    }
    const nibKeys = Array.from(WMTSloadable.data.keys()).filter((key) => {
      const provider = WMTSloadable.data.get(key);
      return provider && provider.has(projection);
    });
    return nibKeys.length > 0 ? (nibKeys[0] as WMTSProviderId) : null;
  };

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

  const setBackgroundLayer = (
    WTMSProvider: WMTSProviderId,
    layerName: WMTSLayerName,
  ) => {
    if (WMTSloadable.state !== 'hasData') {
      console.warn('WMTS data is not loaded yet');
      return;
    }
    const currentProjectionCode = map
      .getView()
      .getProjection()
      .getCode() as ProjectionIdentifier;

    const layerToAdd = WMTSloadable.data
      .get(WTMSProvider)
      ?.get(currentProjectionCode)
      ?.get(layerName);

    if (layerToAdd == null) {
      console.warn(`WMTS layer ${layerName} is not available`);
      return;
    }
    const WTMSLayers = map
      .getLayers()
      .getArray()
      .filter((layer) => {
        return layer.get('id').startsWith('bg.');
      });
    WTMSLayers.forEach((layer) => {
      map.removeLayer(layer);
    });

    setUrlParameter('backgroundLayer', `${WTMSProvider}.${layerName}`);

    map.addLayer(
      new TileLayer({
        source: layerToAdd,
        properties: { id: `bg.${WTMSProvider}.${layerName}` },
      }),
    );
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

    //Find the old background and check if it is available, otherwise use topo
    const [providerId, layerName] = (
      getUrlParameter('backgroundLayer') || DEFAULT_BACKGROUND_LAYER
    ).split('.');

    let layerToAdd = WMTSloadable.data
      .get(providerId as WMTSProviderId)
      ?.get(projectionId)
      ?.get(layerName as WMTSLayerName);
    if (!layerToAdd && providerId.startsWith('norgeibilder_')) {
      const nibKey = getNibProviderKeyForProjections(projectionId);
      console.log(nibKey);
      if (nibKey) {
        layerToAdd = WMTSloadable.data
          .get(nibKey as WMTSProviderId)
          ?.get(projectionId)
          ?.entries()
          .next().value?.[1];
      }
    }

    if (!layerToAdd) {
      console.warn(
        `WMTS layer ${layerName} for provider ${providerId} is not available in projection ${projectionId} and no fallback was found.`,
      );
      return;
    }

    let newCenter = undefined;
    if (oldProjection.getCode() === projection.getCode()) {
      newCenter = oldCenter; // No transformation needed if projections are the same
    } else if (oldCenter && oldProjection) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }
    const currentBackgoundLayers = map
      .getLayers()
      .getArray()
      .filter((l) => isMapLayerBackground(l));

    currentBackgoundLayers.forEach((layer) => {
      map.removeLayer(layer);
    });

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

    const newView = new View({
      center: newCenter,
      zoom: newZoom,
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
    map.addLayer(
      new TileLayer({
        source: layerToAdd,
        properties: { id: `bg.${providerId}.${layerName}` },
      }),
    );

    const mousePositionInteraction = map
      .getControls()
      .getArray()
      .filter((control) => {
        return control instanceof MousePosition;
      })[0];
    map.removeControl(mousePositionInteraction);
    map.addControl(getMousePositionControl(projectionId));
    setUrlParameter('projection', projectionId);
    setUrlParameter('backgroundLayer', `${providerId}.${layerName}`);
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
