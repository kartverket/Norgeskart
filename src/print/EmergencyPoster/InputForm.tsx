import { Heading, Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';

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
  return (
    <Stack>
      <Heading size={'sm'}>
        {t('printdialog.emergencyPoster.inputform.heading')}
      </Heading>
      {clickedCoordinates}
    </Stack>
  );
};
