import { Map } from 'ol';
import { useEffect, useState } from 'react';
import { useDraggableOverlay } from './useDraggableOverlay';

type PrintExtentOverlayProps = {
  map: Map;
  overlayWidth: number;
  overlayHeight: number;
  overlayRef: React.RefObject<HTMLDivElement | null>;
};

export const PrintExtentOverlay = ({
  map,
  overlayWidth,
  overlayHeight,
  overlayRef,
}: PrintExtentOverlayProps) => {
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getViewport();
    const overlay = document.createElement('div');
    overlayRef.current = overlay;

    overlay.style.position = 'absolute';
    overlay.style.border = '2px dashed rgba(0,0,0,0.5)';
    overlay.style.backgroundColor = '#FF770082';
    overlay.style.cursor = 'move';
    overlay.style.zIndex = '999';
    overlay.style.pointerEvents = 'auto';
    overlay.style.userSelect = 'none';
    overlay.style.width = `${overlayWidth}px`;
    overlay.style.height = `${overlayHeight}px`;

    const mapRect = mapContainer.getBoundingClientRect();
    setOverlayPosition({
      x: mapRect.width / 2 - overlayWidth / 2,
      y: mapRect.height / 2 - overlayHeight / 2,
    });

    mapContainer.appendChild(overlay);

    return () => overlay.remove();
  }, [map, overlayWidth, overlayHeight]);

  useEffect(() => {
    if (!overlayRef.current || !map) return;

    overlayRef.current.style.width = `${overlayWidth}px`;
    overlayRef.current.style.height = `${overlayHeight}px`;

    const mapRect = map.getViewport().getBoundingClientRect();
    setOverlayPosition({
      x: mapRect.width / 2 - overlayWidth / 2,
      y: mapRect.height / 2 - overlayHeight / 2,
    });
  }, [overlayWidth, overlayHeight, map]);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.top = `${overlayPosition.y}px`;
      overlayRef.current.style.left = `${overlayPosition.x}px`;
    }
  }, [overlayPosition]);

  useDraggableOverlay({
    map,
    overlayRef,
    overlayWidth,
    overlayHeight,
    setOverlayPosition,
  });

  // Return nothing, overlay is managed in DOM
  return null;
};
