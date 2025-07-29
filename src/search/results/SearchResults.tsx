import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Box,
  List,
  ListItem,
  Pagination,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom, markerStyleAtom } from '../../map/atoms.ts';
import { useMapSettings } from '../../map/mapHooks.ts';
import { useIsMobileScreen } from '../../shared/hooks.ts';
import {
  Address,
  Metadata,
  PlaceName,
  Property,
  Road,
} from '../../types/searchTypes.ts';
import { SearchResult } from '../atoms.ts';
import { getAddresses } from '../searchApi.ts';
import { SearchResultLine } from './SearchResultLine.tsx';

type AccordionTab = 'places' | 'roads' | 'properties' | 'addresses';

interface SearchResultsProps {
  properties: Property[];
  roads: Road[];
  places: PlaceName[];
  addresses: Address[];
  placesMetadata?: Metadata;
  onPlacesPageChange: (_page: number) => void;
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
  properties,
  roads,
  places,
  addresses,
  placesMetadata,
  onPlacesPageChange,
}: SearchResultsProps) => {
  const map = useAtomValue(mapAtom);
  const markerStyle = useAtomValue(markerStyleAtom);
  const isMobileScreen = useIsMobileScreen();
  const { setMapLocation } = useMapSettings();
  const [accordionTabsOpen, setAccordionTabsOpen] = useState<AccordionTab[]>([
    'places',
    'roads',
    'properties',
    'addresses',
  ]);
  const [openRoads, setOpenRoads] = useState<string[]>([]);
  const { t } = useTranslation();

  const toggleRoad = (roadId: string) => {
    setOpenRoads((prev) =>
      prev.includes(roadId)
        ? prev.filter((id) => id !== roadId)
        : [...prev, roadId],
    );
  };

  const handleAccordionTabClick = (value: AccordionTab) => {
    setAccordionTabsOpen((prev) =>
      prev.includes(value)
        ? prev.filter((tab) => tab !== value)
        : [...prev, value],
    );
  };

  const handleSearchClick = (res: SearchResult) => {
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

  const handleHouseNumberClick = async (
    roadName: string,
    houseNumber: string,
  ) => {
    try {
      const query = `${roadName} ${houseNumber}`;
      const response = await getAddresses(query);

      const address = response.adresser?.[0];
      if (!address) return;

      handleSearchClick({
        type: 'Address',
        name: address.adressenavn,
        lat: address.representasjonspunkt.lat,
        lon: address.representasjonspunkt.lon,
        address,
      });
    } catch (e) {
      console.error('Failed to fetch address', e);
    }
  };
  //Mattis 18.06.26. For å sjekke om det er resultater for høydesetting på resultatene
  const hasResults =
    properties.length > 0 ||
    roads.length > 0 ||
    places.length > 0 ||
    addresses.length > 0;

  if (!placesMetadata) {
    return null;
  }

  return (
    <AccordionRoot
      collapsible
      multiple
      value={accordionTabsOpen}
      backgroundColor="white"
      mt="5px"
      overflowY="auto"
      height={
        hasResults ? (isMobileScreen ? '10vh' : 'calc(100vh - 130px)') : 'auto'
      }
      maxHeight={
        hasResults ? (isMobileScreen ? '10vh' : 'calc(100vh - 130px)') : 'none'
      }
    >
      {places.length > 0 && (
        <AccordionItem value="places">
          <AccordionItemTrigger
            onClick={() => handleAccordionTabClick('places')}
          >
            {t('search.placeName')} ({places.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {places.map((place, i) => {
                const municipalityNames =
                  place.kommuner && place.kommuner.length > 0
                    ? place.kommuner.map((k) => k.kommunenavn).join(', ')
                    : '';
                return (
                  <SearchResultLine
                    key={`place-${i}`}
                    heading={place.skrivemåte}
                    onClick={() => {
                      handleSearchClick({
                        type: 'Place',
                        name: place.skrivemåte,
                        lat: place.representasjonspunkt.nord,
                        lon: place.representasjonspunkt.øst,
                        place,
                      });
                    }}
                    locationType={
                      municipalityNames
                        ? `${place.navneobjekttype} i ${municipalityNames}`
                        : place.navneobjekttype
                    }
                  />
                );
              })}
            </List>
            {placesMetadata.totaltAntallTreff > placesMetadata.treffPerSide && (
              <Pagination
                siblingCount={4}
                size="sm"
                count={placesMetadata.totaltAntallTreff}
                page={placesMetadata.side}
                pageSize={placesMetadata.treffPerSide}
                onPageChange={(e: { page: number }) =>
                  onPlacesPageChange(e.page)
                }
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </Pagination>
            )}
          </AccordionItemContent>
        </AccordionItem>
      )}
      {roads.length > 0 && (
        <AccordionItem value="roads">
          <AccordionItemTrigger
            onClick={() => handleAccordionTabClick('roads')}
          >
            {t('search.roads')} ({roads.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {roads.map((road, i) => (
                <Box key={`road-${i}`}>
                  <SearchResultLine
                    heading={road.NAVN}
                    showButton={true}
                    onButtonClick={() => toggleRoad(road.ID)}
                    onClick={() =>
                      handleSearchClick({
                        type: 'Road',
                        name: road.NAVN,
                        lat: parseFloat(road.LATITUDE),
                        lon: parseFloat(road.LONGITUDE),
                        road,
                      })
                    }
                  />
                  {openRoads.includes(road.ID) && road.HUSNUMMER && (
                    <List ml="20px">
                      {road.HUSNUMMER.map((houseNumber, i) => (
                        <ListItem
                          _hover={{ fontWeight: '600' }}
                          cursor="pointer"
                          as={'ul'}
                          key={`houseNumber-${i}`}
                          mb={2}
                          onClick={() =>
                            handleHouseNumberClick(road.NAVN, houseNumber)
                          }
                        >
                          {t('search.houseNumber')}
                          <Box as="span" ml={5}>
                            {houseNumber}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
            </List>
          </AccordionItemContent>
        </AccordionItem>
      )}
      {properties.length > 0 && (
        <AccordionItem value="properties">
          <AccordionItemTrigger
            onClick={() => handleAccordionTabClick('properties')}
          >
            {t('search.properties')} ({properties.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {properties.map((property, i) => (
                <SearchResultLine
                  key={`property-${i}`}
                  heading={property.TITTEL}
                  onClick={() =>
                    handleSearchClick({
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
            {t('search.addresses')} ({addresses.length})
          </AccordionItemTrigger>
          <AccordionItemContent>
            <List>
              {addresses.map((address, i) => (
                <SearchResultLine
                  key={`address-${i}`}
                  heading={`${address.adressenavn}, ${address.adressetekst}`}
                  onClick={() =>
                    handleSearchClick({
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
  );
};
