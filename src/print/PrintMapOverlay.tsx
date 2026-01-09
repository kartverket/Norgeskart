import { useAtomValue } from "jotai";
import { mapAtom } from "../map/atoms";
import { useEffect, useRef, useState } from "react";
import { printFormatAtom, printOrientationAtom } from "./atoms";
import { getDpiMetrics } from "./utils/getDpiMetrics";
import { useDraggableOverlay } from "./hooks/useDraggableOverlay";

export const PrintMapOverlay = () => {
    const map = useAtomValue(mapAtom);
    const format = useAtomValue(printFormatAtom);
    const orientation = useAtomValue(printOrientationAtom);

    // Lag layout-string, f.eks. "A4 Portrait"
    const layout = `${format} ${orientation === "portrait" ? "Portrait" : "Landscape"}`;
    const { overlayWidth, overlayHeight } = getDpiMetrics(layout);

    const overlayRef = useRef<HTMLDivElement>(null);
    const [overlayPosition, setOverlayPosition] = useState({ x: 100, y: 100 });

    useDraggableOverlay({
        map,
        overlayRef,
        overlayWidth,
        overlayHeight,
        setOverlayPosition,
    });

    useEffect(() => {
        if (!map || !overlayRef.current) return;
        const viewport = map.getViewport();
        viewport.appendChild(overlayRef.current);
        return () => {
            if (overlayRef.current && viewport.contains(overlayRef.current)) {
                viewport.removeChild(overlayRef.current);
            }
        };
    }, [map]);

    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.style.top = `${overlayPosition.y}px`;
            overlayRef.current.style.left = `${overlayPosition.x}px`;
            overlayRef.current.style.width = `${overlayWidth}px`;
            overlayRef.current.style.height = `${overlayHeight}px`;
        }
    }, [overlayPosition, overlayWidth, overlayHeight]);

    return null; // Overlay-diven legges i kartet via ref, ikke i JSX
};