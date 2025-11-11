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

    let offsetX = 0,
      offsetY = 0,
      isDragging = false;

    const interactions = map.getInteractions();
    const toggleDragPan = (enable: boolean) => {
      interactions.forEach((i: any) => {
        if (i.constructor.name.includes("DragPan")) i.setActive(enable);
      });
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
      const rect = map.getViewport().getBoundingClientRect();
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      x = Math.max(0, Math.min(x, rect.width - overlayWidth));
      y = Math.max(0, Math.min(y, rect.height - overlayHeight));
      setOverlayPosition({ x, y });
    };

    const onMouseUp = () => {
      if (isDragging) toggleDragPan(true);
      isDragging = false;
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [map, overlayWidth, overlayHeight, setOverlayPosition, overlayRef]);
};
