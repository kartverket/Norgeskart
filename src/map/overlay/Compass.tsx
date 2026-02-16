import { Image } from '@kvib/react';
import { useAtomValue } from 'jotai';
import {
  magneticDeclinationAtom,
  mapOrientationDegreesAtom,
  useMagneticNorthAtom,
} from '../atoms';
import { useCompassFileName } from '../mapHooks';
export const Compass = () => {
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const magneticDeclination = useAtomValue(magneticDeclinationAtom);
  const useMagneticNorth = useAtomValue(useMagneticNorthAtom);
  const compassFileName = useCompassFileName();
  const compassOrientation =
    mapOrientation + (useMagneticNorth ? magneticDeclination : 0);
  return (
    <Image
      rotate={compassOrientation + 'deg'}
      position="absolute"
      width="16%"
      top="34%"
      left="42%"
      src={compassFileName}
      userSelect="none"
      pointerEvents="none"
      zIndex={2}
    />
  );
};
