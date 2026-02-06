import {
  Button,
  FieldLabel,
  FieldRoot,
  Flex,
  Input,
  Separator,
  Stack,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Text,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../map/atoms';
import { downloadFile } from '../../shared/utils/fileUtils';
import { EmergencyPosterResponse } from '../../types/searchTypes';
import { isPrintDialogOpenAtom } from '../atoms';
import { PlaceSelector } from './PlaceSelector';
import { RoadAddressSelection } from './RoadAddressSelection';
import { createPosterUrl } from './utils';

const LABEL_WIDTH = '40%';
export const InputForm = ({
  clickedCoordinates,
  emergenyPosterData,
}: {
  clickedCoordinates: Coordinate;
  emergenyPosterData: EmergencyPosterResponse;
}) => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const [customNameChanged, setCustomNameChanged] = useState(false);

  const [customName, setCustomName] = useState<string>('');
  const [selectedRoad, setSelectedRoad] = useState<string | null>(
    emergenyPosterData.vegliste[0],
  );
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [isInfoCorrect, setIsInfoCorrect] = useState<boolean>(false);

  const ph = usePostHog();

  return (
    <Stack gap={3}>
      <FieldRoot orientation={'horizontal'} display={'flex'}>
        <FieldLabel flexBasis={LABEL_WIDTH}>
          {t('printdialog.emergencyPoster.inputform.fields.title.label')}
        </FieldLabel>
        <Input
          value={customName}
          onChange={(s) => {
            setCustomName(s.target.value);
            if (!customNameChanged) {
              setCustomNameChanged(true);
            }
          }}
          borderRadius={0}
        />
      </FieldRoot>
      <FieldRoot orientation={'horizontal'} display={'flex'}>
        <FieldLabel flexBasis={LABEL_WIDTH}>
          {t('printdialog.emergencyPoster.inputform.fields.place.label')}
        </FieldLabel>
        <PlaceSelector
          coordinates={clickedCoordinates}
          range={1500}
          onSelect={(s) => {
            setSelectedPlace(s);
            if (!customNameChanged) {
              setCustomName(s);
            }
          }}
          onLoadComplete={(s) => {
            setSelectedPlace(s);
            if (!customNameChanged) {
              setCustomName(s);
            }
          }}
        />
      </FieldRoot>
      {emergenyPosterData.vegliste.length > 0 && (
        <>
          <FieldRoot orientation={'horizontal'} display={'flex'}>
            <FieldLabel flexBasis={LABEL_WIDTH}>
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
            {`${t('shared.in')} ${emergenyPosterData.kommune} ${t('shared.locations.municipality')}`}
          </Text>
        </>
      )}
      <Separator />
      <FieldRoot orientation={'horizontal'} display={'flex'}>
        <FieldLabel flexBasis={'80%'}>
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
        <Button
          onClick={() => {
            setIsPrintDialogOpen(false);
          }}
          variant="secondary"
        >
          {t('shared.cancel')}
        </Button>
        <Button
          disabled={!isInfoCorrect || !clickedCoordinates}
          onClick={() => {
            let roadString = '';
            if (selectedRoad) {
              roadString += selectedRoad;
              if (emergenyPosterData.kommune != '') {
                roadString += ` i ${emergenyPosterData.kommune}`;
              }
            }
            let cadastreString = '';
            if (emergenyPosterData.matrikkelnr) {
              cadastreString += emergenyPosterData.matrikkelnr;
              if (emergenyPosterData.kommune != '') {
                cadastreString += ` i ${emergenyPosterData.kommune}`;
              }
            }
            const downloadLink = createPosterUrl(
              customName,
              clickedCoordinates!,
              map.getView().getProjection().getCode(),
              roadString,
              selectedPlace || '',
              cadastreString,
            );

            if (!downloadLink) {
              alert(
                t(
                  'printdialog.emergencyPoster.inputform.errors.couldNotCreatePosterUrl',
                ),
              );
              ph.capture('print_emergency_poster_failed');
              return;
            }

            downloadFile(downloadLink, customName + '_emergency_poster.pdf');
            ph.capture('print_emergency_poster_created');
          }}
        >
          {t('printdialog.emergencyPoster.buttons.makePoster')}
        </Button>
      </Flex>
    </Stack>
  );
};
