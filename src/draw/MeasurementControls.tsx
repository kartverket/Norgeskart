import { Button, Group, Heading, HStack, Tooltip } from '@kvib/react';
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
    { value: 'm', label: 'M' },
    { value: 'NM', label: 'NM' },
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
    <HStack align="center" justifyContent="space-between" width="100%">
      <Heading size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.showMeasurements')}
      </Heading>

      <Group attached>
        {units.map((u) => (
          <Tooltip
            key={u.value}
            content={u.value === 'm' ? 'Meter' : 'Nautisk mil'}
          >
            <Button
              size="xs"
              borderColor={isActive(u.value) ? 'green.500' : 'gray.200'}
              color="green.500"
              bg={isActive(u.value) ? 'green.100' : 'transparent'}
              onClick={() => onPick(u.value)}
            >
              {u.label}
            </Button>
          </Tooltip>
        ))}
      </Group>
    </HStack>
  );
};
