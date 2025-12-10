import { getDefaultStore } from 'jotai';
import { GeoJSON, GML, GPX } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { mapAtom } from '../../map/atoms';
import { downloadStringAsFile } from '../../shared/utils/fileOperations';

export const handleGeoJsonExport = (layer: VectorLayer) => {
  const formater = new GeoJSON();
  const features = layer.getSource()?.getFeatures();
  if (!features || features.length === 0) {
    console.error('No features to export');
    return;
  }
  const geojsonStr = formater.writeFeatures(features);
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
  // Use a default feature type and geometry name
  const formater = new GML({
    featureNS: 'http://www.opengis.net/gml',
    featureType: 'feature',
    srsName: layer.getSource()?.getProjection()?.getCode() || 'EPSG:4326',
  });

  // Ensure all features have the correct geometry name
  features.forEach((f) => {
    if (f.getGeometryName() !== 'geometry') {
      f.setGeometryName('geometry');
    }
  });

  const gmlStr = formater.writeFeatures(features);
  downloadStringAsFile(gmlStr, 'Norgeskart_eksport.gml', 'application/gml+xml');
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

  const gpxString = gpxFormat.writeFeatures(features, {
    dataProjection: 'EPSG:4326', // Output projection for GPX (WGS84)
    featureProjection: projection,
  });

  downloadStringAsFile(
    gpxString,
    'Norgeskart_eksport.gpx',
    'application/gpx+xml',
  );
};
