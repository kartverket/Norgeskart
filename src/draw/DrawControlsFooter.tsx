import {
  Button,
  ButtonGroup,
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
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { transform } from 'ol/proj';
import { Style } from 'ol/style';
import { useState } from 'react';
import { getStyleForStorage, saveFeatures } from '../api/nkApiClient';
import { useMapSettings } from '../map/mapHooks';
import { canRedoAtom, canUndoAtom } from '../settings/draw/drawActions/atoms';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks';
import { setUrlParameter } from '../shared/utils/urlUtils';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

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
  }

  return coordinates;
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
        const styleForStorage = getStyleForStorage(featureStyle);
        return {
          type: 'Feature',
          geometry: {
            type: geometry.getType(),
            coordinates: featureCoordinates,
          },
          properties: {
            style: styleForStorage,
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
      <ButtonGroup>
        <PopoverRoot
          open={clearPopoverOpen}
          onOpenChange={(e) => setClearPopoverOpen(e.open)}
        >
          <PopoverTrigger asChild>
            <Button colorPalette={'red'}>{t('draw.clear')}</Button>
          </PopoverTrigger>
          <PopoverContent>
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
              >
                {t('shared.yes')}
              </Button>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>
        <Button onClick={onSaveFeatures}>{t('draw.save')}</Button>
        <Button onClick={undoLast}>Undo</Button>
      </ButtonGroup>
    </>
  );
};
