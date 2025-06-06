import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Box,
  List,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { useState } from 'react';
import { mapAtom, markerStyleAtom } from '../../map/atoms.ts';
import { useMapSettings } from '../../map/mapHooks.ts';
import { Address, PlaceName, Property, Road } from '../../types/searchTypes.ts';
import { SearchResult } from '../atoms.ts';
import { SearchResultLine } from './SearchResultLine.tsx';

type AccordionTab = 'places' | 'roads' | 'properties' | 'addresses';

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
  const [accordionTabsOpen, setAccordionTabsOpen] = useState<AccordionTab[]>([
    'places',
    'roads',
    'properties',
    'addresses',
  ]);

  const handleAccordionTabClick = (value: AccordionTab) => {
    setAccordionTabsOpen((prev) =>
      prev.includes(value)
        ? prev.filter((tab) => tab !== value)
        : [...prev, value],
    );
  };

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
      overflowY="auto"
      height="calc(100vh - 130px)"
    >
      <AccordionRoot collapsible multiple value={accordionTabsOpen}>
        {places.length > 0 && (
          <AccordionItem value="places">
            <AccordionItemTrigger
              onClick={() => handleAccordionTabClick('places')}
            >
              Stedsnavn ({places.length})
            </AccordionItemTrigger>
            <AccordionItemContent>
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
            </AccordionItemContent>
          </AccordionItem>
        )}
        {roads.length > 0 && (
          <AccordionItem value="roads">
            <AccordionItemTrigger
              onClick={() => handleAccordionTabClick('roads')}
            >
              Vegnavn ({roads.length})
            </AccordionItemTrigger>
            <AccordionItemContent>
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
            </AccordionItemContent>
          </AccordionItem>
        )}
        {poperties.length > 0 && (
          <AccordionItem value="properties">
            <AccordionItemTrigger
              onClick={() => handleAccordionTabClick('properties')}
            >
              Eiendommer ({poperties.length})
            </AccordionItemTrigger>
            <AccordionItemContent>
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
            </AccordionItemContent>
          </AccordionItem>
        )}
        {addresses.length > 0 && (
          <AccordionItem value="addresses">
            <AccordionItemTrigger
              onClick={() => handleAccordionTabClick('addresses')}
            >
              Adresser ({addresses.length})
            </AccordionItemTrigger>
            <AccordionItemContent>
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
            </AccordionItemContent>
          </AccordionItem>
        )}
      </AccordionRoot>
    </Box>
  );
};
