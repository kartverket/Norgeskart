import Control from 'ol/control/Control';
import MousePosition from 'ol/control/MousePosition';

export const getMousePositionControl = (suffix: string) => {
  const coordinateFormat = (coord: number[] | undefined) => {
    if (!coord) {
      return '';
    }
    return `${coord[0].toFixed(2)}, ${coord[1].toFixed(2)} (${suffix})`;
  };
  return new MousePosition({
    coordinateFormat,
  });
};

export class ControlPortal extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options: { target?: HTMLElement } = {}) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.id = 'custom-control-portal';

    super({
      element: element,
      target: options.target,
    });
  }
}
