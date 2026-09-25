import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Button,
  Grid,
  HStack,
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
import { useIsMobileScreen } from '../shared/hooks';
import { setUrlParameter } from '../shared/utils/urlUtils';
import {
  isExportDialogOpenAtom,
  isImportDialogOpenAtom,
} from './dialogs/atoms';
import { ExportDialog } from './dialogs/ExportDialog';
import { ImportDialog } from './dialogs/import/ImportDialog';
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

export const DrawControlFooter = () => {
  const { getDrawnFeatures, clearDrawing } = useDrawSettings();
  const { getMapProjectionCode } = useMapSettings();
  const setIsExportDialogOpen = useSetAtom(isExportDialogOpenAtom);
  const setIsImportDialogOpen = useSetAtom(isImportDialogOpenAtom);

  const [clearPopoverOpen, setClearPopoverOpen] = useState(false);

  const isMobile = useIsMobileScreen();

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

  const defaultAccordionValue: string[] = isMobile ? [] : ['export'];

  return (
    <>
      <Accordion
        collapsible
        variant="plain"
        size="sm"
        paddingTop={2}
        paddingX={0}
        overflow={'hidden'}
        defaultValue={defaultAccordionValue}
      >
        <AccordionItem value="export" paddingX="0">
          <AccordionItemTrigger fontWeight="600" padding="0">
            {t('controller.export')}
          </AccordionItemTrigger>
          <AccordionItemContent marginX="-25px" mt={2}>
            <Grid templateColumns="repeat(2, max-content)" gap={1}>
              <Button
                width="fit-content"
                leftIcon="save"
                size="xs"
                variant="ghost"
                onClick={onSaveFeatures}
              >
                {t('draw.save')}
              </Button>
              <PopoverRoot
                open={clearPopoverOpen}
                onOpenChange={(e) => setClearPopoverOpen(e.open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    width="fit-content"
                    leftIcon="delete"
                    size="xs"
                    variant="ghost"
                    iconFill
                    colorPalette={'red'}
                  >
                    {t('draw.clear')}
                  </Button>
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
                        colorPalette={'red'}
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

              <Button
                leftIcon="download"
                variant="ghost"
                width="fit-content"
                size="xs"
                onClick={() => setIsExportDialogOpen(true)}
              >
                {t('draw.download')}
              </Button>
              <Button
                width="fit-content"
                size="xs"
                leftIcon="upload"
                variant="ghost"
                onClick={() => setIsImportDialogOpen(true)}
              >
                {t('draw.uploadButton.label')}
              </Button>
            </Grid>
          </AccordionItemContent>
        </AccordionItem>
      </Accordion>
      <ExportDialog />
      <ImportDialog />
    </>
  );
};
