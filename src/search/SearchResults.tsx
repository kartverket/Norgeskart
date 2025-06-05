import { Box, List, ListItem, Separator, Text } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { mapAtom, markerStyleAtom } from '../map/atoms.ts';
import { useMapSettings } from '../map/mapHooks.ts';
import { SearchResult } from './atoms.ts';

interface SearchResultsProps {
  results: SearchResult[];
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
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

export const SearchResults = ({ results }: SearchResultsProps) => {
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
    <Box
      backgroundColor="white"
      mt="5px"
      overflowY="scroll"
      maxH="1000px"
      width="450px"
    >
      <List listStyleType="none">
        {results.map((res, i) => {
          return (
            <ListItem
              key={i}
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              onClick={() => handleClick(res)}
            >
              {res.type === 'Place' && (
                <Text>
                  {res.place.skrivemåte}, {res.place.navneobjekttype}
                </Text>
              )}
              {res.type === 'Road' && (
                <Text>
                  {res.road.NAVN}, {res.road.KOMMUNENAVN}
                </Text>
              )}
              {res.type === 'Property' && (
                <Text>
                  {res.property.TITTEL}, {res.property.KOMMUNENAVN}
                </Text>
              )}
              {res.type === 'Address' && (
                <Text>
                  {res.address.adressenavn}, {res.address.adressetekst}
                </Text>
              )}
              <Separator />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
