import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { GeoJSON, GML, GPX } from 'ol/format';
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import { mapAtom } from '../../map/atoms';
import { downloadStringAsFile } from '../../shared/utils/fileOperations';
import { getFeaturePropertiesForExport } from '../utils/featureUtils';

const to2DGeometry = (
  geom: Point | LineString | MultiLineString,
): Point | LineString | MultiLineString => {
  if (geom.getLayout() === 'XY') return geom;
  if (geom instanceof Point) {
    const [x, y] = geom.getCoordinates();
    return new Point([x, y]);
  }
  if (geom instanceof LineString) {
    const coords2d = geom.getCoordinates().map(([x, y]) => [x, y]);
    return new LineString(coords2d);
  }
  if (geom instanceof MultiLineString) {
    const lines2d = geom
      .getCoordinates()
      .map((line) => line.map(([x, y]) => [x, y]));
    return new MultiLineString(lines2d);
  }
  return geom;
};

export const handleGeoJsonExport = (layer: VectorLayer) => {
  const formater = new GeoJSON();
  const features = layer.getSource()?.getFeatures() as Feature[] | undefined;
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const projection = getDefaultStore()
    .get(mapAtom)
    .getView()
    .getProjection()
    .getCode();
  const featuresToExport = features
    .filter(
      (f) =>
        f.getGeometry()?.getType() === 'LineString' ||
        f.getGeometry()?.getType() === 'Polygon' ||
        f.getGeometry()?.getType() === 'Point',
    )
    .map((f) => {
      const props = getFeaturePropertiesForExport(f);
      if (props) {
        f.setProperties(props, true);
      }
      return f;
    });

  const geojsonStr = formater.writeFeatures(featuresToExport, {
    dataProjection: 'EPSG:4326',
    featureProjection: projection,
  });
  downloadStringAsFile(
    geojsonStr,
    'Norgeskart_eksport.geojson',
    'application/json',
  );
};

export const handleGMLExport = (layer: VectorLayer) => {
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const projection = getDefaultStore()
    .get(mapAtom)
    .getView()
    .getProjection()
    .getCode();
  // Use a default feature type and geometry name
  const formater = new GML({
    featureNS: 'http://www.norgeskart.no/drawings',
    featureType: 'drawings',
    srsName: 'urn:ogc:def:crs:EPSG::4326',
    surface: false,
    curve: false,
    multiCurve: false,
    multiSurface: false,
  });

  const featuresToExport = features.map((f) => {
    const clone = f.clone();
    clone.setId(f.getId());
    const props = getFeaturePropertiesForExport(f);
    if (props) {
      clone.setProperties(
        { ...props, style: JSON.stringify(props.style) },
        true,
      );
    }
    return clone;
  });

  const gmlStr = formater.writeFeatures(featuresToExport, {
    dataProjection: 'EPSG:4326',
    featureProjection: projection,
  });

  const wrappedGmlStr = `
  <?xml version="1.0" encoding="UTF-8"?>
    <gml:FeatureCollection  xmlns:gml="http://www.opengis.net/gml"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xsi:schemaLocation="http://www.norgeskart.no/drawings"
                            gml:srsName="urn:ogc:def:crs:EPSG::4326">
      ${gmlStr}
    </gml:FeatureCollection>`.trim();

  downloadStringAsFile(
    wrappedGmlStr,
    'Norgeskart_eksport.gml',
    'application/gml+xml',
  );
};

export const handleGPXExport = (layer: VectorLayer) => {
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const projection = getDefaultStore()
    .get(mapAtom)
    .getView()
    .getProjection()
    .getCode();

  const gpxFormat = new GPX();

  const supportedTypes = new Set([
    'Point',
    'LineString',
    'MultiLineString',
    'Polygon',
  ]);
  const featuresToExport = features
    .filter((f) => {
      const type = f.getGeometry()?.getType();
      return type !== undefined && supportedTypes.has(type);
    })
    .map((f) => {
      const clone = f.clone();
      clone.setId(f.getId());
      const geom = clone.getGeometry();
      const effectiveGeom =
        geom instanceof Polygon
          ? new LineString(geom.getLinearRing(0)!.getCoordinates())
          : geom;
      if (
        effectiveGeom instanceof Point ||
        effectiveGeom instanceof LineString ||
        effectiveGeom instanceof MultiLineString
      ) {
        clone.setGeometry(to2DGeometry(effectiveGeom));
      }
      const props = getFeaturePropertiesForExport(f);
      const textLabel = props?.style?.text?.text;
      if (textLabel) {
        clone.set('name', textLabel);
      }
      return clone;
    });

  const gpxString = gpxFormat.writeFeatures(featuresToExport, {
    dataProjection: 'EPSG:4326',
    featureProjection: projection,
  });

  downloadStringAsFile(
    gpxString,
    'Norgeskart_eksport.gpx',
    'application/gpx+xml',
  );
};
