import {
  Button,
  ButtonGroup,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from '@kvib/react';
import { Feature, FeatureCollection } from 'geojson';
import { t } from 'i18next';
import { Coordinate } from 'ol/coordinate';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { transform } from 'ol/proj';
import { Style } from 'ol/style';
import { useState } from 'react';
import { getStyleForStorage, saveFeatures } from '../api/nkApiClient';
import { useMapSettings } from '../map/mapHooks';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks';
import { setUrlParameter } from '../shared/utils/urlUtils';
import { useDrawSettings } from './drawHooks';

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
  const { undoLast } = useDrawActions();
  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);
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
  );
};
