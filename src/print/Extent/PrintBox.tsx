import { useAtomValue } from 'jotai';
import Map from 'ol/Map';
import { Overlay } from 'ol';
import { getPointResolution } from 'ol/proj';
import { useEffect } from 'react';
import { printBoxLayoutAtom } from './atoms';

type PrintBoxProps = {
  map: Map;
};

export const PrintBox = ({ map }: PrintBoxProps) => {
  const layout = useAtomValue(printBoxLayoutAtom);

  useEffect(() => {
    if (!map) return;

    const overlayContainer = document.createElement('div');
    overlayContainer.className = 'print-box-overlay';

    const overlay = new Overlay({
      element: overlayContainer,
      positioning: 'center-center',
      stopEvent: false,
      id: 'printBoxOverlay',
    });

    map.addOverlay(overlay);

    const postRenderHandler = () => {
      const size = map.getSize();
      if (!size) return;

      const center = map.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
      overlay.setPosition(center);

      const projection = map.getView().getProjection();
      const resolution = map.getView().getResolution();
      if (!projection || !resolution) return;

      const centerResolution = getPointResolution(
        projection,
        resolution,
        center,
      );

      overlayContainer.style.width = `${layout.widthPx / centerResolution * resolution}px`;
      overlayContainer.style.height = `${layout.heightPx / centerResolution * resolution}px`;
    };

    postRenderHandler();
    map.on('postrender', postRenderHandler);

    return () => {
      map.un('postrender', postRenderHandler);
      map.removeOverlay(overlay);
    };
  }, [map, layout]);

  return null;
};
