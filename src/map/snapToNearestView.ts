import View from 'ol/View';
import { Coordinate } from 'ol/coordinate';

// With constrainResolution, OL snaps trackpad/pinch zoom on release towards the
// gesture direction (6.1 → 7), an extra step after the user stops. Snap to nearest.
export class SnapToNearestView extends View {
  override endInteraction(
    duration?: number,
    _direction?: number,
    anchor?: Coordinate,
  ) {
    super.endInteraction(duration, 0, anchor);
  }
}
