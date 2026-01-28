import { Button, Group, Heading, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  DistanceUnit,
  distanceUnitAtom,
  showMeasurementsAtom,
} from '../settings/draw/atoms';

export const MeasurementControls = () => {
  const { t } = useTranslation();
  const [distanceUnit, setDistanceUnit] = useAtom(distanceUnitAtom);
  const [showMeasurements, setShowMeasurements] = useAtom(showMeasurementsAtom);

  const units: { value: DistanceUnit; label: string }[] = [
    { value: 'm', label: `${t('shared.units.meter')} [m]` },
    { value: 'NM', label: `${t('shared.units.nauticalMile')} [NM]` },
  ];

  const isActive = (u: DistanceUnit) => showMeasurements && distanceUnit === u;

  const onPick = (u: DistanceUnit) => {
    if (isActive(u)) {
      setShowMeasurements(false);
      return;
    }

    setDistanceUnit(u);
    setShowMeasurements(true);
  };

  return (
    <VStack align="flex-start" mt={2} w="100%">
      <Heading size="md">{t('draw.controls.showMeasurements')}</Heading>

      <Group attached>
        {units.map((u) => (
          <Button
            key={u.value}
            size="sm"
            variant={isActive(u.value) ? 'solid' : 'outline'}
            onClick={() => onPick(u.value)}
          >
            {u.label}
          </Button>
        ))}
      </Group>
    </VStack>
  );
};
