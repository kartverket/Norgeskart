import {
  Box,
  Button,
  Grid,
  HStack,
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
import { useSetAtom } from 'jotai';
import { Coordinate } from 'ol/coordinate';
import { Circle, Geometry, LineString, Point, Polygon } from 'ol/geom';
import { transform } from 'ol/proj';
import { useState } from 'react';
import { saveFeatures } from '../api/nkApiClient';
import { useMapSettings } from '../map/mapHooks';
import { setUrlParameter } from '../shared/utils/urlUtils';
import {
  isExportDialogOpenAtom,
  isImportDialogOpenAtom,
} from './dialogs/atoms';
import { ExportDialog } from './dialogs/ExportDialog';
import { ImportDialog } from './dialogs/import/ImportDialog';
import { DrawActionControls } from './drawControls/EditControls';
import { DrawType } from './drawControls/hooks/drawSettings';
import { useDrawSettings } from './drawControls/hooks/drawSettings';
import { getFeaturePropertiesForExport } from './utils/featureUtils';

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

export const DrawControlFooter = ({
  drawType,
}: {
  drawType: DrawType | null;
}) => {
  const { getDrawnFeatures, clearDrawing } = useDrawSettings();
  const { getMapProjectionCode } = useMapSettings();
  const setIsExportDialogOpen = useSetAtom(isExportDialogOpenAtom);
  const setIsImportDialogOpen = useSetAtom(isImportDialogOpenAtom);

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

        const featureProperties = getFeaturePropertiesForExport(feature);
        return {
          type: 'Feature',
          geometry: {
            type: getGeometryType(geometry),
            coordinates: featureCoordinates,
          },
          properties: featureProperties,
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
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={2} width="100%">
        <Button
          leftIcon="download"
          width="100%"
          size="sm"
          variant="outline"
          colorPalette="green"
          onClick={() => setIsExportDialogOpen(true)}
        >
          {t('draw.download')}
        </Button>
        <Button
          width="100%"
          size="sm"
          leftIcon="upload"
          variant="outline"
          colorPalette="green"
          onClick={() => setIsImportDialogOpen(true)}
        >
          {t('draw.uploadButton.label')}
        </Button>
      </Grid>
      <Box
        position="sticky"
        bottom={0}
        zIndex={1}
        width="100%"
        backgroundColor="white"
        marginTop="auto"
        paddingTop={2}
      >
        <HStack width="100%" justifyContent="space-between" alignItems="center">
          <HStack gap={1} alignItems="center">
            <DrawActionControls
              showDeleteControl={drawType === 'Move'}
              marginTop={0}
            />
            <PopoverRoot
              open={clearPopoverOpen}
              onOpenChange={(e) => setClearPopoverOpen(e.open)}
            >
              <PopoverTrigger asChild>
                <IconButton
                  aria-label={t('draw.clear')}
                  icon="delete"
                  size="sm"
                  variant="outline"
                  iconFill
                  colorPalette="red"
                  border="1px solid"
                  borderColor="red.500"
                  borderRadius="4px"
                />
              </PopoverTrigger>
              <PopoverContent width="250px">
                <PopoverArrow />
                <PopoverBody>
                  <PopoverTitle>{t('draw.confrimClear')}</PopoverTitle>
                  <HStack mt={2} justifyContent="space-between">
                    <Button
                      onClick={() => {
                        setClearPopoverOpen(false);
                        clearDrawing();
                      }}
                      colorPalette="red"
                      size="xs"
                    >
                      {t('shared.yes')}
                    </Button>
                    <Button
                      onClick={() => {
                        setClearPopoverOpen(false);
                      }}
                      variant="ghost"
                      size="xs"
                    >
                      {t('shared.cancel')}
                    </Button>
                  </HStack>
                </PopoverBody>
              </PopoverContent>
            </PopoverRoot>
          </HStack>
          <Button
            leftIcon="save"
            size="sm"
            colorPalette="green"
            marginLeft="auto"
            onClick={onSaveFeatures}
          >
            {t('draw.save')}
          </Button>
        </HStack>
      </Box>
      <ExportDialog />
      <ImportDialog />
    </>
  );
};
