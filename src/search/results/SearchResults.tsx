import { Box, List, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { mapAtom, markerStyleAtom } from '../../map/atoms.ts';
import { useMapSettings } from '../../map/mapHooks.ts';
import { Address, PlaceName, Property, Road } from '../../types/searchTypes.ts';
import { SearchResult } from '../atoms.ts';
import { SearchResultLine } from './SearchResultLine.tsx';

interface SearchResultsProps {
  poperties: Property[];
  roads: Road[];
  places: PlaceName[];
  addresses: Address[];
}

const getInputCRS = (selectedResult: SearchResult) => {
  switch (selectedResult.type) {
    case 'Road':
      return 'EPSG:25832';
    case 'Property':
      return 'EPSG:25832';
    case 'Place':
      return 'EPSG:4258';
    case 'Address':
      return 'EPSG:4258';
    default:
      return 'EPSG:4258';
  }
};

export const SearchResults = ({
  poperties,
  roads,
  places,
  addresses,
}: SearchResultsProps) => {
  const map = useAtomValue(mapAtom);
  const markerStyle = useAtomValue(markerStyleAtom);
  const { setMapLocation } = useMapSettings();

  const handleClick = (res: SearchResult) => {
    const { lon, lat } = res;

    setMapLocation([lon, lat], getInputCRS(res), 15);

    const markerLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === 'markerLayer');

    if (!markerLayer) return;

    const vectorMarkerLayer = markerLayer as VectorLayer;
    const source = vectorMarkerLayer.getSource() as VectorSource;

    source.clear();

    const marker = new Feature({
      geometry: new Point(
        transform([lon, lat], getInputCRS(res), map.getView().getProjection()),
      ),
    });

    marker.setStyle(markerStyle);
    source.addFeature(marker);
  };

  return (
    <Box backgroundColor="white" mt="5px" overflowY="scroll" maxH="1000px">
      {places.length > 0 && (
        <>
          <Text>Stedsnavn</Text>
          <List>
            {places.map((place, i) => (
              <SearchResultLine
                key={`place-${i}`}
                heading={place.skrivemåte}
                onClick={() => {
                  handleClick({
                    type: 'Place',
                    name: place.skrivemåte,
                    lat: place.representasjonspunkt.nord,
                    lon: place.representasjonspunkt.øst,
                    place,
                  });
                }}
                locationType={place.navneobjekttype}
              />
            ))}
          </List>
        </>
      )}
      {roads.length > 0 && (
        <>
          <Text>Vegnavn</Text>
          <List>
            {roads.map((road, i) => (
              <SearchResultLine
                key={`road-${i}`}
                heading={road.NAVN}
                onClick={() =>
                  handleClick({
                    type: 'Road',
                    name: road.NAVN,
                    lat: parseFloat(road.LATITUDE),
                    lon: parseFloat(road.LONGITUDE),
                    road,
                  })
                }
              />
            ))}
          </List>
        </>
      )}
      {poperties.length > 0 && (
        <>
          <Text>Eiendommer</Text>
          <List>
            {poperties.map((property, i) => (
              <SearchResultLine
                key={`property-${i}`}
                heading={property.TITTEL}
                onClick={() =>
                  handleClick({
                    type: 'Property',
                    name: property.TITTEL,
                    lat: parseFloat(property.LATITUDE),
                    lon: parseFloat(property.LONGITUDE),
                    property,
                  })
                }
                locationType={property.KOMMUNENAVN}
              />
            ))}
          </List>
        </>
      )}
      {addresses.length > 0 && (
        <>
          <Text>Adresser</Text>
          <List>
            {addresses.map((address, i) => (
              <SearchResultLine
                key={`address-${i}`}
                heading={`${address.adressenavn}, ${address.adressetekst}`}
                onClick={() =>
                  handleClick({
                    type: 'Address',
                    name: address.adressenavn,
                    lat: address.representasjonspunkt.lat,
                    lon: address.representasjonspunkt.lon,
                    address,
                  })
                }
              />
            ))}
          </List>
        </>
      )}
    </Box>
  );
};
