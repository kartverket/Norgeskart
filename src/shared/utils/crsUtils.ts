import { SearchResult } from '../../types/searchTypes';

export const getInputCRS = (selectedResult: SearchResult) => {
  switch (selectedResult.type) {
    case 'Road':
      return 'EPSG:25832';
    case 'Property':
      return 'EPSG:25832';
    case 'Place':
      return 'EPSG:4258';
    case 'Address':
      return 'EPSG:4258';
    case 'Coordinate':
      return selectedResult.coordinate.projection;
    default:
      return 'EPSG:4258';
  }
};
