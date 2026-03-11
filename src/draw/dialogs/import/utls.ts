import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { GPX } from 'ol/format';
import { mapAtom } from '../../../map/atoms';

import GeoJSON from 'ol/format/GeoJSON.js';

import { FeatureCollection } from './types';
export const readFeaturesFromGPXString = (fileText: string): Feature[] => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  const gpxReader = new GPX();
  const features = gpxReader.readFeatures(fileText, {
    dataProjection: 'EPSG:4326',
    featureProjection: projection,
  });
  return features;
};

export const readFeaturesFromGeoJsonString = (fileText: string): Feature[] => {
  console.log(fileText);
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  const geoJsonFormat = JSON.parse(fileText) as FeatureCollection;
  const features = new GeoJSON().readFeatures(geoJsonFormat, {
    dataProjection: 'EPSG:4326',
    featureProjection: projection,
  });
  return features;
};

export const readFeaturesFromGMLString = (fileText: string): Feature[] => {
  return [];
};
