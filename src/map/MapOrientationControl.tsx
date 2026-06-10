import { useAtomValue } from "jotai";
import { useState } from "react";
import { useMapSettings } from "./mapHooks";
import { mapOrientationDegreesAtom } from "./atoms";
import { HStack, IconButton, Popover, PopoverContent, PopoverTrigger } from "@kvib/react";
import { t } from "i18next";

export const MapOrientationControl = () => {
  const [open, setOpen] = useState(false);
  const mapOrientation = useAtomValue(mapOrientationDegreesAtom);
  const { rotateSnappy, setMapAngle } = useMapSettings();

  return (
    <Popover open={open} onOpenChange={({ open }) => setOpen(open)} positioning={{ placement: 'left'}}>
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          size="xs"
          icon="more_horiz"
        aria-label={t('map.controls.more.label')}
         
        />
      </PopoverTrigger>

      <PopoverContent maxW="113px" >
        <HStack>
          <IconButton
          variant="ghost"
            icon="rotate_left"
            size="xs"
            aria-label={t('map.controls.rotateLeft.label')}
            onClick={() => rotateSnappy('left')}
          />

          <IconButton
          variant="ghost"
            icon="navigation"
            size="xs"
            aria-label={t('map.controls.orientation.label')}
            onClick={() => setMapAngle(0)}
            style={{
                transform: `rotate(${mapOrientation}deg)`,
                transition: 'none',
              }}
          />

          <IconButton
          variant="ghost"
            icon="rotate_right"
            size="xs"
            aria-label="Rotate right"
            onClick={() => rotateSnappy('right')}
          />
        </HStack>
      </PopoverContent>
    </Popover>
  );
};