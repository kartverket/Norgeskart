import {
  Button,
  FieldLabel,
  FieldRoot,
  Flex,
  Heading,
  Input,
  Separator,
  Stack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { MapBrowserEvent } from 'ol';
import BaseEvent from 'ol/events/Event';
import { transform } from 'ol/proj';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPosterMarkerLayer } from '../../draw/drawControls/hooks/mapLayers';
import { mapAtom } from '../../map/atoms';
import { getEmergecyPosterInfoByCoordinates } from '../../search/searchApi';
import { createMarkerFromCoordinate } from '../../search/searchmarkers/marker';
import { downloadFile } from '../../shared/utils/fileUtils';
import { PlaceSelector } from './PlaceSelector';
import { RoadAddressSelection } from './RoadAddressSelection';
import { createPosterUrl } from './utils';

export const InputForm = () => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(
    null,
  );
  const [customName, setCustomName] = useState<string>('');

  const [selectedRoad, setSelectedRoad] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  const [isInfoCorrect, setIsInfoCorrect] = useState<boolean>(false);

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
      'yellow',
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
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t('printdialog.emergencyPoster.inputform.fields.title.label')}
        </FieldLabel>
        <Input
          value={customName}
          onChange={(s) => {
            setCustomName(s.target.value);
          }}
        />
      </FieldRoot>
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t('printdialog.emergencyPoster.inputform.fields.place.label')}
        </FieldLabel>
        <PlaceSelector
          coordinates={clickedCoordinates}
          range={1500}
          onSelect={(s) => {
            setSelectedPlace(s);
            setCustomName(s);
          }}
          onLoadComplete={(s) => {
            setSelectedPlace(s);
            setCustomName(s);
          }}
        />
      </FieldRoot>
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t('printdialog.emergencyPoster.inputform.fields.road.label')}
        </FieldLabel>
        <RoadAddressSelection
          posterData={emergenyPosterData}
          onSelect={(s) => {
            setSelectedRoad(s);
          }}
        />
      </FieldRoot>
      <Text>
        {emergenyPosterData.isSuccess
          ? `${t('shared.in')} ${emergenyPosterData.data?.kommune} ${t('shared.locations.municipality')}`
          : ''}
      </Text>
      <Separator />
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t(
            'printdialog.emergencyPoster.inputform.fields.isInfoCorrect.label',
          )}
        </FieldLabel>
        <SwitchRoot
          checked={isInfoCorrect}
          onCheckedChange={(checked) => {
            setIsInfoCorrect(checked.checked);
          }}
        >
          <SwitchHiddenInput />
          <SwitchLabel>
            {isInfoCorrect ? t('shared.yes') : t('shared.no')}
          </SwitchLabel>
          <SwitchControl />
        </SwitchRoot>
      </FieldRoot>
      <Flex w={'100%'} justifyContent={'space-between'}>
        <Button variant="secondary">{t('shared.cancel')}</Button>
        <Button
          disabled={!isInfoCorrect || !clickedCoordinates}
          onClick={() => {
            const downloadLink = createPosterUrl(
              customName,
              clickedCoordinates!,
              selectedRoad || '',
              selectedPlace || '',
            );
            downloadFile(downloadLink, customName + '_emergency_poster.pdf');
          }}
        >
          {t('printdialog.emergencyPoster.buttons.makePoster')}
        </Button>
      </Flex>
    </Stack>
  );
};
