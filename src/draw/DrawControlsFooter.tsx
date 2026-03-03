import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Button,
  ButtonGroup,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogTrigger,
  Heading,
  IconButton,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from '@kvib/react';
import { Feature, FeatureCollection } from 'geojson';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { Circle, Geometry, LineString, Point, Polygon } from 'ol/geom';
import { transform } from 'ol/proj';
import { Style } from 'ol/style';
import { useState } from 'react';
import { getStyleForStorage, saveFeatures } from '../api/nkApiClient';
import { useMapSettings } from '../map/mapHooks';
import { canRedoAtom, canUndoAtom } from '../settings/draw/drawActions/atoms';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks';
import { setUrlParameter } from '../shared/utils/urlUtils';
import { getFeatureIcon } from './drawControls/hooks/drawEventHandlers';
import { useDrawSettings } from './drawControls/hooks/drawSettings';
import { ExportControls } from './export/ExportControls';

const getGeometryCoordinates = (geo: Geometry, mapProjection: string) => {
  let coordinates: Coordinate[][] | Coordinate[] | Coordinate = [];
  if (geo instanceof Polygon) {
    coordinates = geo
      .getCoordinates()
      .map((c) =>
        c.map((coord) => transform(coord, mapProjection, 'EPSG:4326')),
      );
  } else if (geo instanceof LineString) {
    coordinates = [
      geo
        .getCoordinates()
        .map((coord) => transform(coord, mapProjection, 'EPSG:4326')),
    ];
  } else if (geo instanceof Point) {
    coordinates = transform(geo.getCoordinates(), mapProjection, 'EPSG:4326');
  } else if (geo instanceof Circle) {
    coordinates = transform(geo.getCenter(), mapProjection, 'EPSG:4326');
  }

  return coordinates;
};

//To handle things not covered by geojson spec, like circle
const getGeometryType = (geo: Geometry): string => {
  if (geo instanceof Circle) {
    return 'Point';
  }
  return geo.getType();
};

const getRadius = (geo: Geometry): number | undefined => {
  if (geo instanceof Circle) {
    return geo.getRadius();
  }
  return undefined;
};

export const DrawControlFooter = () => {
  const { getDrawnFeatures, clearDrawing } = useDrawSettings();
  const { getMapProjectionCode } = useMapSettings();
  const { undoLast, redoLastUndone } = useDrawActions();
  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);
  const canUndoDrawAction = useAtomValue(canUndoAtom);
  const canRedoDrawAction = useAtomValue(canRedoAtom);
  const onSaveFeatures = () => {
    const drawnFeatures = getDrawnFeatures();
    const mapProjection = getMapProjectionCode();

    if (drawnFeatures == null) {
      return;
    }

    const geometryWithStyle = drawnFeatures
      .map((feature) => {
        const geometry = feature.getGeometry();
        if (!geometry) {
          return null;
        }
        const featureCoordinates = getGeometryCoordinates(
          geometry,
          mapProjection,
        );
        const featureStyle = feature.getStyle() as Style | null;
        const icon = getFeatureIcon(feature);
        const styleForStorage = getStyleForStorage(featureStyle);
        return {
          type: 'Feature',
          geometry: {
            type: getGeometryType(geometry),
            coordinates: featureCoordinates,
          },
          properties: {
            style: styleForStorage,
            overlayIcon: icon || undefined,
            radius: getRadius(geometry),
          },
        } as Feature;
      })
      .filter((f) => f !== null);

    const collection = {
      type: 'FeatureCollection',
      features: geometryWithStyle,
    } as FeatureCollection;

    saveFeatures(collection).then((id) => {
      if (id != null) {
        setUrlParameter('drawing', id);
      }
    });
  };
  return (
    <>
      <Heading size={{ base: 'xs', md: 'sm' }} marginTop={2}>
        {t('draw.redoundo')}
      </Heading>
      <ButtonGroup>
        <IconButton
          variant="ghost"
          disabled={!canUndoDrawAction}
          onClick={undoLast}
          icon={'undo'}
        />
        {canRedoDrawAction && (
          <IconButton
            variant="ghost"
            disabled={!canRedoDrawAction}
            onClick={redoLastUndone}
            icon={'redo'}
          />
        )}
      </ButtonGroup>

      <Accordion collapsible variant="plain" size="sm" paddingX="0">
        <AccordionItem value="item1">
          <AccordionItemTrigger>{t('controller.export')}</AccordionItemTrigger>
          <AccordionItemContent>
            <ButtonGroup>
              <PopoverRoot
                open={clearPopoverOpen}
                onOpenChange={(e) => setClearPopoverOpen(e.open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="xs"
                    variant="outline"
                    iconFill
                    colorPalette={'red'}
                  >
                    {t('draw.clear')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent width="145px">
                  <PopoverArrow />
                  <PopoverBody>
                    <PopoverTitle fontWeight="bold">
                      {t('draw.confrimClear')}
                    </PopoverTitle>
                    <Button
                      onClick={() => {
                        setClearPopoverOpen(false);
                        clearDrawing();
                      }}
                      colorPalette={'red'}
                      marginTop={2}
                    >
                      {t('shared.yes')}
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </PopoverRoot>
              <Button
                size="xs"
                variant="outline"
                iconFill
                onClick={onSaveFeatures}
              >
                {t('draw.save')}
              </Button>

              <Dialog placement={'center'} motionPreset="slide-in-left">
                <DialogTrigger asChild>
                  <Button variant="outline" size="xs">
                    Last ned
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogBody>
                    <ExportControls />
                  </DialogBody>

                  <DialogCloseTrigger />
                </DialogContent>
              </Dialog>
            </ButtonGroup>
          </AccordionItemContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
