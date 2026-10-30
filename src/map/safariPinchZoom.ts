import Map from 'ol/Map';

// Safari on macOS reports trackpad pinch as proprietary GestureEvents, not the
// ctrl+wheel events OL's MouseWheelZoom handles; unhandled, Safari zooms the page.
type GestureEvent = UIEvent & {
  scale: number;
  clientX: number;
  clientY: number;
};

export const addSafariPinchZoom = (map: Map) => {
  const viewport = map.getViewport();
  if (!viewport) return;
  let active = false;
  let lastScale = 1;
  let anchor: number[] | undefined;

  const onGestureStart = (e: Event) => {
    e.preventDefault();
    const view = map.getView();
    if (view.getAnimating()) view.cancelAnimations();
    view.beginInteraction();
    active = true;
    lastScale = 1;
  };

  const onGestureChange = (e: Event) => {
    e.preventDefault();
    if (!active) return;
    const g = e as GestureEvent;
    if (!g.scale) return;
    anchor = map.getCoordinateFromPixel(map.getEventPixel(g));
    // Incremental ratio keeps the pinch point fixed as the anchor moves.
    map.getView().adjustResolution(lastScale / g.scale, anchor);
    lastScale = g.scale;
  };

  const onGestureEnd = (e: Event) => {
    e.preventDefault();
    if (!active) return;
    active = false;
    // Snap (constrainResolution) towards the pinch direction, not the nearest level.
    map.getView().endInteraction(undefined, lastScale > 1 ? -1 : 1, anchor);
  };

  // Should Safari also emit ctrl+wheel mid-gesture, drop it so we don't zoom twice.
  const onWheel = (e: WheelEvent) => {
    if (active && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  viewport.addEventListener('gesturestart', onGestureStart);
  viewport.addEventListener('gesturechange', onGestureChange);
  viewport.addEventListener('gestureend', onGestureEnd);
  viewport.addEventListener('wheel', onWheel, {
    capture: true,
    passive: false,
  });
};
