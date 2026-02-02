import { useQuery } from '@tanstack/react-query';
import { getDefaultStore, useAtomValue } from 'jotai';
import { MapBrowserEvent } from 'ol';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { useEffect, useState } from 'react';
import { getPosterMarkerLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { selectedResultAtom } from '../../search/atoms';
import { createMarkerFromCoordinate } from '../../search/searchmarkers/marker';

import { Heading, Separator, Stack } from '@kvib/react';
import { t } from 'i18next';
import { transform } from 'ol/proj';
import { getEmergecyPosterInfoByCoordinates } from '../../search/searchApi';
import { InputForm } from './InputForm';

export const ClickWrapper = () => {
  const map = useAtomValue(mapAtom);
  const [clickedCoordinates, setClickedCoordinates] =
    useState<Coordinate | null>(() => {
      const selectedResult = getDefaultStore().get(selectedResultAtom);
      if (selectedResult) {
        return [selectedResult.lon, selectedResult.lat];
      }
      return null;
    });
  const posterClickHandler = (event: Event | BaseEvent) => {
    if (event instanceof MapBrowserEvent) {
      const coordinate = event.coordinate;
      setClickedCoordinates(coordinate);
    }
  };

  useEffect(() => {
    map.addEventListener('click', posterClickHandler);
    return () => {
      map.removeEventListener('click', posterClickHandler);
    };
  }, [map]);

  useEffect(() => {
    if (!clickedCoordinates) {
      return;
    }
    const marker = createMarkerFromCoordinate(
      clickedCoordinates[0],
      clickedCoordinates[1],
      'orange',
    );
    const markerlayer = getPosterMarkerLayer();
    const makerSource = markerlayer.getSource();
    if (!makerSource) {
      return;
    }
    makerSource.clear();
    makerSource.addFeature(marker);
    return () => {
      makerSource.clear();
    };
  }, [clickedCoordinates]);

  const emergenyPosterData = useQuery({
    queryKey: ['emergencyPosterData', clickedCoordinates],
    queryFn: async () => {
      if (!clickedCoordinates) {
        return null;
      }
      const transformedCoordinates = transform(
        clickedCoordinates,
        map.getView().getProjection(),
        'EPSG:4326',
      );

      const response = await getEmergecyPosterInfoByCoordinates(
        transformedCoordinates[0],
        transformedCoordinates[1],
      );

      return response;
    },
  });

  return (
    <Stack>
      <Heading size={'md'}>
        {t('printdialog.emergencyPoster.inputform.heading')}
      </Heading>
      <Separator />
      {emergenyPosterData.status === 'success' &&
        emergenyPosterData.data &&
        clickedCoordinates != null && (
          <InputForm
            clickedCoordinates={clickedCoordinates}
            emergenyPosterData={emergenyPosterData.data}
          />
        )}
    </Stack>
  );
};
