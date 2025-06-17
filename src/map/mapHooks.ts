import { useAtomValue, useSetAtom } from 'jotai';
import { View } from 'ol';
import MousePosition from 'ol/control/MousePosition';
import { Listener } from 'ol/events';
import { Extent } from 'ol/extent';
import LayerGroup from 'ol/layer/Group';
import { get as getProjection, transform } from 'ol/proj';
import { setUrlParameter } from '../shared/utils/urlUtils';
import { mapAtom, mapOrientationAtom, ProjectionIdentifier } from './atoms';
import { BackgroundLayer } from './layers';
import { getMousePositionControl } from './mapControls';

const ROTATION_ANIMATION_DURATION = 500;

const useMap = () => {
  const map = useAtomValue(mapAtom);
  const setMapOrientation = useSetAtom(mapOrientationAtom);

  const setTargetElement = (element: HTMLDivElement | null) => {
    if (!map.getTarget() && element) {
      map.setTarget(element);
    } else if (element == null) {
      map.setTarget(undefined);
    }
  };
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
      .filter(
        (layer) => layer.get('id') === 'backgroundLayers',
      )[0] as unknown as LayerGroup;

    backgroundLayers.getLayers().forEach((layer) => {
      if (layer.get('id') === layerName) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
    setUrlParameter('backgroundLayer', layerName);
  };

  const setProjection = (projectionId: ProjectionIdentifier) => {
    const projection = getProjection(projectionId)!;

    // Optionally, transform the current center to the new projection
    const oldView = map.getView();
    const oldCenter = oldView.getCenter();
    const oldProjection = oldView.getProjection();

    let newCenter = undefined;
    if (
      oldCenter &&
      oldProjection &&
      oldProjection.getCode() !== projection.getCode()
    ) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }

    // Create a new view with the new projection
    const newView = new View({
      center: newCenter || [570130, 7032300], // fallback center if needed
      zoom: oldView.getZoom(),
      projection: projection,
      extent: projection.getExtent() as Extent,
    });

    oldView.getListeners('change:rotation')?.forEach((listener: Listener) => {
      newView.addEventListener('change:rotation', listener);
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

export { useMap, useMapSettings };
