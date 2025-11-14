import {
  Address,
  Place,
  Property,
  Road,
  SearchResult,
} from '../../types/searchTypes';

export const searchResultsMapper = (
  places: Place[],
  roads: Road[],
  addresses: Address[],
  properties: Property[],
): SearchResult[] => [
  ...places.map(
    (place): SearchResult => ({
      type: 'Place',
      name: place.name,
      lat: place.location.nord,
      lon: place.location.øst,
      place,
    }),
  ),
  ...roads.map(
    (road): SearchResult => ({
      type: 'Road',
      name: road.NAVN,
      lat: parseFloat(road.LATITUDE),
      lon: parseFloat(road.LONGITUDE),
      road,
    }),
  ),
  ...addresses.map(
    (address): SearchResult => ({
      type: 'Address',
      name: address.adressenavn,
      lat: address.representasjonspunkt.lat,
      lon: address.representasjonspunkt.lon,
      address,
    }),
  ),
  ...properties.map(
    (property): SearchResult => ({
      type: 'Property',
      name: property.TITTEL,
      lat: parseFloat(property.LATITUDE),
      lon: parseFloat(property.LONGITUDE),
      property,
    }),
  ),
];
