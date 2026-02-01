import { StyleForStorage } from "../../api/nkApiClient";
import type { Feature as OlFeature } from 'ol';
import type { Geometry } from 'ol/geom';
import { Layer } from "./printApi";
import { GeoJSON } from 'ol/format';

type PrintSymbolizer =
    | {
        type: 'polygon';
        fillColor: string;
        fillOpacity: number;
        strokeColor: string;
        strokeWidth: number;
    }
    | {
        type: 'line';
        strokeColor: string;
        strokeWidth: number;
    }
    | {
        type: 'point';
        fillColor: string;
        pointRadius: number;
        graphicName: string;
    };

type StyleCollection = {
    version: string;
    [featureId: string]: { symbolizers: PrintSymbolizer[] } | string;
};

export const getSymbolizersFromStyle = (
    style: StyleForStorage | null,
    geometryType: string
): PrintSymbolizer[] => {
    if (!style) return [];

    switch (geometryType) {
        case 'Polygon':
            return [{
                type: 'polygon',
                fillColor: style.fill?.color?.toString() ?? 'rgba(255,255,255,0.5)',
                fillOpacity: 0.5,
                strokeColor: style.stroke?.color?.toString() ?? '#000',
                strokeWidth: style.stroke?.width ?? 2,
            }];
        case 'LineString':
            return [{
                type: 'line',
                strokeColor: style.stroke?.color?.toString() ?? '#000',
                strokeWidth: style.stroke?.width ?? 2,
            }];
        case 'Point':
            return [{
                type: 'point',
                fillColor: style.icon?.color?.toString() ?? '#000',
                pointRadius: style.icon?.radius ?? 6,
                graphicName: 'circle', //TODO: må utvides for andre symboltyper
            }];
            //Mangler å få med tekst og circle også
        default:
            return [];
    }
};

export const createGeoJsonLayerWithStyles = (
    features: OlFeature<Geometry>[],
    sourceProjection: string,
    targetProjection: string,
    styleForStorage: StyleForStorage
): Layer => {
    const geoJson = new GeoJSON().writeFeaturesObject(features, {
        featureProjection: sourceProjection,
        dataProjection: targetProjection,
    });

    const styleCollection: StyleCollection = { version: '2' };
    for (let i = 0; i < geoJson.features.length; i++) {
        const f = geoJson.features[i];
        if (!f.id) f.id = features[i].getId();
        if (f.properties) {
            delete f.properties.style;
            for (const key in f.properties) {
                if (f.properties[key] === null) delete f.properties[key];
            }
        }
        styleCollection[`[IN('${f.id}')]`] = {
            symbolizers: getSymbolizersFromStyle(styleForStorage, f.geometry?.type)
        };
    }

    return {
        type: 'geojson',
        name: 'drawings',
        geoJson: {
            type: 'FeatureCollection',
            features: geoJson.features.map((f) => ({
                type: 'Feature',
                geometry: f.geometry,
                properties: f.properties || {},
                id: f.id,
            })),
        },
        style: {
            ...styleCollection,
        },
        opacity: 1,
    };
};