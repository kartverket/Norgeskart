import { useAtomValue, useSetAtom } from 'jotai';
import { get as getProjection, transform } from 'ol/proj';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  calculateAzimuth,
  calculateGridConvergence,
  getCentralMeridianDeg,
} from '../shared/utils/coordinateCalculations';
import { setUrlParameter } from '../shared/utils/urlUtils';
import {
  gridConvergenceAtom,
  magneticDeclinationAtom,
  mapAtom,
  mapOrientationAtom,
} from './atoms';
import { ProjectionIdentifier } from './projections/types';

const ROTATION_ANIMATION_DURATION = 500;

const useMap = () => {
  const map = useAtomValue(mapAtom);

  const setMapOrientation = useSetAtom(mapOrientationAtom);
  const setMagneticDeclination = useSetAtom(magneticDeclinationAtom);
  const setGridConvergence = useSetAtom(gridConvergenceAtom);

  const setTargetElement = useCallback(
    (element: HTMLDivElement | null) => {
      if (!map.getTarget() && element) {
        map.setTarget(element);
      } else if (element == null) {
        map.setTarget(undefined);
      }
    },
    [map],
  );

  // that works for now, remove useEffect later
  useEffect(() => {
    const registerViewListeners = () => {
      const view = map.getView();

      const onCenterChange = () => {
        const newCenter = view.getCenter();
        if (!newCenter) return;

        const projection = view.getProjection();
        const angleCoords = transform(newCenter, projection, 'EPSG:4326');
        const [lon, lat] = angleCoords;

        const magneticNorth = [162.867, 86.494];
        const azimuth = calculateAzimuth(
          lat,
          lon,
          magneticNorth[1],
          magneticNorth[0],
        );

        setMagneticDeclination((prev) => {
          const diff = Math.abs(azimuth - prev);
          if (isNaN(diff) || diff < 0.01) {
            return prev;
          }
          return azimuth;
        });

        const centralMeridian = getCentralMeridianDeg(projection.getCode());
        setGridConvergence(
          centralMeridian !== null
            ? calculateGridConvergence(lat, lon, centralMeridian)
            : 0,
        );
      };

      onCenterChange();

      const onRotationChange = () => {
        const rotation = view.getRotation();
        setMapOrientation(rotation);
      };

      view.on('change:center', onCenterChange);
      view.on('change:rotation', onRotationChange);

      return () => {
        view.un('change:center', onCenterChange);
        view.un('change:rotation', onRotationChange);
      };
    };

    let cleanupViewListeners = registerViewListeners();

    const onViewChange = () => {
      cleanupViewListeners();
      cleanupViewListeners = registerViewListeners();
    };

    map.on('change:view', onViewChange);

    return () => {
      cleanupViewListeners();
      map.un('change:view', onViewChange);
    };
  }, [map, setMapOrientation, setMagneticDeclination, setGridConvergence]);

  const mapElement = map.getTarget() as HTMLElement | undefined;
  return { mapElement, setTargetElement };
};

const useMapSettings = () => {
  const map = useAtomValue(mapAtom);

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
