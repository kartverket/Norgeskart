import { useAtomValue, useSetAtom } from 'jotai';
import { Collection, Feature } from 'ol';
import { Polygon } from 'ol/geom';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { useEffect, useRef } from 'react';
import { printBoxCenterAtom, printBoxExtentAtom } from './atoms';

type PrintBoxProps = {
  map: Map;
};

export const PrintBox = ({ map }: PrintBoxProps) => {
  const extent = useAtomValue(printBoxExtentAtom);
  const setCenter = useSetAtom(printBoxCenterAtom);
  const translateRef = useRef<Translate | null>(null);
  const layerRef = useRef<VectorLayer | null>(null);

  useEffect(() => {
    if (!map || !extent) return;

    const source = new VectorSource();
    const layer = new VectorLayer({
      source,
      zIndex: 1000,
      properties: { id: 'printBoxLayer' },
    });
    layerRef.current = layer;

    const coords = [
      [
        [extent[0], extent[1]],
        [extent[2], extent[1]],
        [extent[2], extent[3]],
        [extent[0], extent[3]],
        [extent[0], extent[1]],
      ],
    ];

    const feature = new Feature(new Polygon(coords));
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'rgba(0,0,0,0.5)',
          width: 2,
          lineDash: [6, 6],
        }),
        fill: new Fill({ color: '#FF770082' }),
      })
    );
    source.addFeature(feature);

    map.addLayer(layer);

    const featuresCollection = source.getFeaturesCollection() || undefined;
    translateRef.current = new Translate({ features: featuresCollection });
    map.addInteraction(translateRef.current);

    const onTranslateEnd = () => {
      const geom = feature.getGeometry() as Polygon;
      const newExtent = geom.getExtent();
      const newCenter: [number, number] = [
        (newExtent[0] + newExtent[2]) / 2,
        (newExtent[1] + newExtent[3]) / 2,
      ];
      setCenter(newCenter);
    };
    translateRef.current.on('translateend', onTranslateEnd);

    return () => {
      if (translateRef.current) {
        translateRef.current.un('translateend', onTranslateEnd);
        map.removeInteraction(translateRef.current);
        translateRef.current = null;
      }
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, extent, setCenter]);

  return null;
};
