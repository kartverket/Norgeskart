import { useSetAtom } from "jotai";
import { useState } from "react";
import { measureTypeAtom } from "./atoms";
import { IconButton, Popover, PopoverContent, PopoverTrigger } from "@kvib/react";
import { MeasurePanel } from "./MeasurePanel";

export const MeasureToolButton = () => {
  const [openMeasureTool, setOpenMeasureTool] = useState(false);
  const setMeasureType = useSetAtom(measureTypeAtom);

  return (
    <Popover
      open={openMeasureTool}
      onOpenChange={({ open }) => {
        setOpenMeasureTool(open);

        if (open) {
          setMeasureType('length');
        } else {
          setMeasureType(null);
        }
      }}
      positioning={{ placement: 'left' }}
      closeOnInteractOutside={false}
    >
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          colorPalette="green"
          size="xs"
          icon="straighten"
          aria-label="Måle"
          backgroundColor={openMeasureTool ? '#D0ECD6' : undefined}
        />
      </PopoverTrigger>

      <PopoverContent maxW="77px">
        <MeasurePanel />
      </PopoverContent>
    </Popover>
  );
};