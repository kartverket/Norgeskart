import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { GML, GPX } from 'ol/format';
import { mapAtom } from '../../../map/atoms';

import GeoJSON from 'ol/format/GeoJSON.js';

export type FeatureReadResult =
  | {
      status: 'success';
      features: Feature[];
    }
  | {
      status: 'error';
    };

import { FeatureCollection } from './types';
export const readFeaturesFromGPXString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  const gpxReader = new GPX();
  try {
    const features = gpxReader.readFeatures(fileText, {
      dataProjection: 'EPSG:4326',
      featureProjection: projection,
    });
    return {
      status: 'success',
      features,
    };
  } catch (error) {
    console.error('Error reading GPX file:', error);
    return {
      status: 'error',
    };
  }
};

export const readFeaturesFromGeoJsonString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  let geoJsonFormat: FeatureCollection;
  try {
    geoJsonFormat = JSON.parse(fileText) as FeatureCollection;
    if (
      !geoJsonFormat ||
      !geoJsonFormat.type ||
      geoJsonFormat.type !== 'FeatureCollection'
    ) {
      console.error(
        'Invalid GeoJSON format: Missing or incorrect "type" property',
      );
      return {
        status: 'error',
      };
    }
  } catch (error) {
    console.error('Error parsing GeoJSON file:', error);
    return {
      status: 'error',
    };
  }
  try {
    const features = new GeoJSON().readFeatures(geoJsonFormat, {
      dataProjection: 'EPSG:4326',
      featureProjection: projection,
    });
    return {
      status: 'success',
      features,
    };
  } catch (error) {
    console.error('Error reading GeoJSON features:', error);
    return {
      status: 'error',
    };
  }
};

export const readFeaturesFromGMLString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  try {
    const gmlReader = new GML();
    const features = gmlReader.readFeatures(fileText, {
      featureProjection: projection,
    });
    return {
      status: 'success',
      features,
    };
  } catch (error) {
    console.error('Error reading GML file:', error);
    return {
      status: 'error',
    };
  }
};
