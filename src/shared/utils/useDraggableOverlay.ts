import { useEffect } from "react";

interface UseDraggableOverlayProps {
  map: any;
  overlayRef?: React.RefObject<HTMLDivElement | null>;
  overlayWidth: number;
  overlayHeight: number;
  setOverlayPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
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

    const interactions = map.getInteractions();
    const toggleDragPan = (enable: boolean) => {
      interactions.forEach((i: any) => {
        if (i.constructor.name.includes("DragPan")) i.setActive(enable);
      });
    };

    const constrainPosition = (x: number, y: number) => {
      const rect = map.getViewport().getBoundingClientRect();
      const constrainedX = Math.max(0, Math.min(x, rect.width - overlayWidth));
      const constrainedY = Math.max(0, Math.min(y, rect.height - overlayHeight));
      return { x: constrainedX, y: constrainedY };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - overlay.offsetLeft;
      offsetY = e.clientY - overlay.offsetTop;
      toggleDragPan(false);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      const { x: constrainedX, y: constrainedY } = constrainPosition(x, y);
      setOverlayPosition({ x: constrainedX, y: constrainedY });
    };

    const onMouseUp = () => {
      if (isDragging) toggleDragPan(true);
      isDragging = false;
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Reposition overlay if map viewport changes (optional, e.g., window resize)
    const resizeObserver = new ResizeObserver(() => {
      if (!overlay) return;
      setOverlayPosition(prev => constrainPosition(prev.x, prev.y));
    });

    if (map.getViewport()) resizeObserver.observe(map.getViewport());

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      resizeObserver.disconnect();
    };
  }, [map, overlayWidth, overlayHeight, setOverlayPosition, overlayRef]);
};
