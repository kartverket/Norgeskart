import {
  createListCollection,
  HStack,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
} from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { DistanceUnit, distanceUnitAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

const measurementUnitCollection: { value: DistanceUnit; label: string }[] = [
  { value: 'm', label: `${t('shared.units.meter')} [m]` },
  { value: 'NM', label: `${t('shared.units.nauticalMile')} [NM]` },
];

export const MeasurementControls = () => {
  const [distanceUnit, setDistanceUnit] = useAtom(distanceUnitAtom);

  const { showMeasurements, setShowMeasurements } = useDrawSettings();
  return (
    <HStack width={'100%'} justifyContent={'space-between'} h={'40px'}>
      <SwitchRoot
        checked={showMeasurements}
        onCheckedChange={(e) => {
          setShowMeasurements(e.checked);
        }}
        w={'50%'}
      >
        <SwitchHiddenInput />
        <SwitchControl />
        <SwitchLabel>{t('draw.controls.showMeasurements')}</SwitchLabel>
      </SwitchRoot>
      {showMeasurements && (
        <SelectRoot
          value={[distanceUnit]}
          collection={createListCollection({
            items: measurementUnitCollection,
          })}
          defaultValue={[measurementUnitCollection[0].value]}
        >
          <SelectTrigger>
            <SelectValueText />
          </SelectTrigger>
          <SelectContent>
            {measurementUnitCollection.map((item) => (
              <SelectItem
                key={item.value}
                item={item.value}
                onClick={() => {
                  setDistanceUnit(item.value);
                }}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      )}
    </HStack>
  );
};
