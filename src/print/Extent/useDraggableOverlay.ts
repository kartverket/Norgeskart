import { Map } from 'ol';
import { useEffect } from 'react';

export interface UseDraggableOverlayProps {
  map: Map;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  overlayWidth: number;
  overlayHeight: number;
  setOverlayPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
}

export const useDraggableOverlay = ({
  map,
  overlayRef,
  overlayWidth,
  overlayHeight,
  setOverlayPosition,
}: UseDraggableOverlayProps) => {
  useEffect(() => {
    const overlay = overlayRef?.current;
    if (!overlay || !map) return;

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const constrainPosition = (x: number, y: number) => {
      const rect = map.getViewport().getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(x, rect.width - overlayWidth)),
        y: Math.max(0, Math.min(y, rect.height - overlayHeight)),
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      const rect = overlay.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      const { x: cx, y: cy } = constrainPosition(x, y);
      setOverlayPosition({ x: cx, y: cy });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
    };

    overlay.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      overlay.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [map, overlayRef, overlayWidth, overlayHeight, setOverlayPosition]);
};
