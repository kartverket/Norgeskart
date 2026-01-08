import {
  Button,
  createListCollection,
  FieldLabel,
  FieldRoot,
  Flex,
  Heading,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Separator,
  Stack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
} from '@kvib/react';
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
  const [placesNearby, setPlacesNearby] = useState<string[]>([
    'Steinsåsen',
    'Heggelia',
    'Nordseter',
  ]);

  const [roadsNearby, setRoadsNearby] = useState<string[]>([
    'Kranveien 24',
    'Ubåtsvingen 1A',
    'Tyholt Allé 14b',
  ]);

  const [municipalityName, setMunicipalityName] = useState<string>('Hole');
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
      makerSource.clear();
    };
  }, [clickedCoordinates]);
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
        <Input />
      </FieldRoot>
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t('printdialog.emergencyPoster.inputform.fields.place.label')}
        </FieldLabel>
        <SelectRoot
          collection={createListCollection({
            items: placesNearby,
          })}
          defaultValue={[placesNearby[0]]}
        >
          <SelectTrigger>
            <SelectValueText />
          </SelectTrigger>
          <SelectContent>
            {placesNearby.map((item) => (
              <SelectItem key={item} item={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </FieldRoot>
      <FieldRoot orientation={'horizontal'}>
        <FieldLabel>
          {t('printdialog.emergencyPoster.inputform.fields.road.label')}
        </FieldLabel>
        <SelectRoot
          collection={createListCollection({
            items: roadsNearby,
          })}
          defaultValue={[roadsNearby[0]]}
        >
          <SelectTrigger>
            <SelectValueText />
          </SelectTrigger>
          <SelectContent>
            {roadsNearby.map((item) => (
              <SelectItem key={item} item={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </FieldRoot>
      <Text>
        {t('shared.in')} {municipalityName} {t('shared.locations.municipality')}
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
        <Button disabled={!isInfoCorrect || !clickedCoordinates}>
          {t('printdialog.emergencyPoster.buttons.makePoster')}
        </Button>
      </Flex>
    </Stack>
  );
};
