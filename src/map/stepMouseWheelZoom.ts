import { MapBrowserEvent } from 'ol';
import { zoomByDelta } from 'ol/interaction/Interaction';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';

// A pause longer than this ends a scroll gesture. macOS momentum events arrive
// every frame, so the inertia tail stays part of the gesture that caused it.
const GESTURE_GAP_MS = 100;
const MIN_STEP_DELTA = 4;
const STEP_DURATION_MS = 150;

// OL zooms two-finger trackpad scroll continuously and snaps to a level once
// the scroll (incl. macOS momentum) stops, so the map appears to zoom and then
// jumps back. Zoom one level per gesture instead, ignoring the momentum tail.
// Pinch (ctrl+wheel) keeps OL's default handling.
export class StepMouseWheelZoom extends MouseWheelZoom {
  private lastEventTime = 0;
  private lastStepTime = 0;
  private accumulatedDelta = 0;
  private peakDelta = 0;
  private hasStepped = false;

  override handleEvent(mapBrowserEvent: MapBrowserEvent) {
    const wheelEvent = mapBrowserEvent.originalEvent as WheelEvent;
    if (mapBrowserEvent.type !== 'wheel' || wheelEvent.ctrlKey) {
      return super.handleEvent(mapBrowserEvent);
    }
    wheelEvent.preventDefault();

    let delta = wheelEvent.deltaY;
    if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 40;
    if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= 300;
    if (delta === 0) return false;

    const now = Date.now();
    if (now - this.lastEventTime > GESTURE_GAP_MS) {
      this.accumulatedDelta = 0;
      this.peakDelta = 0;
      this.hasStepped = false;
    }
    this.lastEventTime = now;
    this.accumulatedDelta += delta;

    // Momentum decays from the gesture's peak; only a delta at least as strong
    // (continued mouse wheel spinning, a faster swipe) may zoom another level.
    const absDelta = Math.abs(delta);
    const canStepAgain =
      now - this.lastStepTime >= STEP_DURATION_MS && absDelta >= this.peakDelta;
    this.peakDelta = Math.max(this.peakDelta, absDelta);

    if (
      Math.abs(this.accumulatedDelta) >= MIN_STEP_DELTA &&
      (!this.hasStepped || canStepAgain)
    ) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      if (view.getAnimating()) view.cancelAnimations();
      zoomByDelta(
        view,
        this.accumulatedDelta > 0 ? -1 : 1,
        map.getCoordinateFromPixel(mapBrowserEvent.pixel),
        STEP_DURATION_MS,
      );
      this.hasStepped = true;
      this.lastStepTime = now;
      this.accumulatedDelta = 0;
    }
    return false;
  }
}
