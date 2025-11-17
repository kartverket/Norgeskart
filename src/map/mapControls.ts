import Control from 'ol/control/Control';

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
