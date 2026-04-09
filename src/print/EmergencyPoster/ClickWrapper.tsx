import { useQuery } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { MapBrowserEvent } from 'ol';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { useEffect, useState } from 'react';
import { getPosterMarkerLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { selectedResultAtom } from '../../search/atoms';
import { createMarkerFromCoordinate } from '../../search/searchmarkers/marker';

import { Heading, Separator, Spinner, Stack } from '@kvib/react';
import { t } from 'i18next';
import { transform } from 'ol/proj';
import { getEmergecyPosterInfoByCoordinates } from '../../search/searchApi';
import { InputForm } from './InputForm';

export const ClickWrapper = () => {
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
  const emergenyPosterData = useQuery({
    queryKey: ['emergencyPosterData', clickedCoordinates],
    queryFn: async () => {
      if (!clickedCoordinates) {
        return null;
      }
      const store = getDefaultStore();
      const map = store.get(mapAtom);
      const projection = map.getView().getProjection();
      const transformedCoordinates = transform(
        clickedCoordinates,
        projection.getCode(),
        'EPSG:4326',
      );

      const response = await getEmergecyPosterInfoByCoordinates(
        transformedCoordinates[0],
        transformedCoordinates[1],
      );

      return response;
    },
  });

  useEffect(() => {
    const store = getDefaultStore();
    const map = store.get(mapAtom);
    map.addEventListener('click', posterClickHandler);
    return () => {
      map.removeEventListener('click', posterClickHandler);
    };
  }, []);

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
      {emergenyPosterData.status === 'pending' && <Spinner size={'lg'} />}
      {emergenyPosterData.status === 'error' && (
        <Heading size={'sm'} color={'red'}>
          {t('printdialog.emergencyPoster.inputform.error')}
        </Heading>
      )}
    </Stack>
  );
};
