import { useEffect } from "react";

interface UseDraggableOverlayProps {
  map: any;
  overlayRef?: React.RefObject<HTMLDivElement | null>;
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

    // Enable/disable map panning while dragging
    const interactions = map.getInteractions();
    const toggleDragPan = (enable: boolean) => {
      interactions.forEach((i: any) => {
        if (i.constructor.name.includes("DragPan")) i.setActive(enable);
      });
    };

    // Keep overlay inside viewport based on updated width/height
    const constrainPosition = (x: number, y: number) => {
      const rect = map.getViewport().getBoundingClientRect();

      return {
        x: Math.max(0, Math.min(x, rect.width - overlayWidth)),
        y: Math.max(0, Math.min(y, rect.height - overlayHeight)),
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;

      const rect = overlay.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      toggleDragPan(false);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      const { x: cx, y: cy } = constrainPosition(x, y);
      setOverlayPosition({ x: cx, y: cy });
    };

    const onMouseUp = () => {
      if (isDragging) toggleDragPan(true);
      isDragging = false;
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Handle map resize or layout change
    const resizeObserver = new ResizeObserver(() => {
      setOverlayPosition(prev => constrainPosition(prev.x, prev.y));
    });

    const viewport = map.getViewport();
    if (viewport) resizeObserver.observe(viewport);

    // Cleanup
    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      resizeObserver.disconnect();
    };
  }, [map, overlayRef, overlayWidth, overlayHeight, setOverlayPosition]);
};
