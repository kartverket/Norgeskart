import { Heading, Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMarkerLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { createMarkerFromCoordinate } from '../../search/searchmarkers/marker';

export const InputForm = () => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(
    null,
  );

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
      '/location/location_red.svg',
    );
    const markerlayer = getMarkerLayer();
    const makerSource = markerlayer.getSource();
    if (!makerSource) {
      return;
    }
    makerSource.clear();
    makerSource.addFeature(marker);
    return () => {
      makerSource.removeFeature(marker);
    };
  }, [clickedCoordinates]);
  return (
    <Stack>
      <Heading size={'sm'}>
        {t('printdialog.emergencyPoster.inputform.heading')}
      </Heading>
      {clickedCoordinates}
    </Stack>
  );
};
