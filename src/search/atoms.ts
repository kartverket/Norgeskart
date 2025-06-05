import { Address, PlaceName, Property, Road } from '../types/searchTypes.ts';

export type SearchResultBase = {
  name: string;
  lat: number;
  lon: number;
};

export type SearchResultType = 'Property' | 'Road' | 'Place' | 'Address';

export type SearchResult = SearchResultBase &
  (
    | {
        type: 'Property';
        property: Property;
      }
    | {
        type: 'Road';
        road: Road;
      }
    | {
        type: 'Place';
        place: PlaceName;
      }
    | {
        type: 'Address';
        address: Address;
      }
  );
