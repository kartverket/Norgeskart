import { Coordinate } from 'ol/coordinate';
import { MultiPolygon } from 'ol/geom';

export const createMultiPolygonGridFromExtent = (
  lowerLeft: Coordinate,
  upperRight: Coordinate,
  rows: number,
  cols: number,
): MultiPolygon => {
  const minX = lowerLeft[0]!;
  const minY = lowerLeft[1]!;
  const maxX = upperRight[0]!;
  const maxY = upperRight[1]!;

  const deltaX = (maxX - minX) / cols;
  const deltaY = (maxY - minY) / rows;
  const polygons = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x1 = minX + col * deltaX;
      const y1 = minY + row * deltaY;
      const x2 = x1 + deltaX;
      const y2 = y1 + deltaY;
      const polygon = [
        [
          [x1, y1],
          [x1, y2],
          [x2, y2],
          [x2, y1],
          [x1, y1],
        ],
      ];
      polygons.push(polygon);
    }
  }
  return new MultiPolygon(polygons);
};
