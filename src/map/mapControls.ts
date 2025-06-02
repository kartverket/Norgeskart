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
