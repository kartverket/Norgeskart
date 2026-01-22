import { useAtomValue, useSetAtom } from 'jotai';
import { Collection, Feature } from 'ol';
import { Polygon } from 'ol/geom';
import Translate from 'ol/interaction/Translate';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { useEffect } from 'react';
import { printBoxCenterAtom, printBoxExtentAtom } from './atoms';

type PrintBoxProps = {
  map: Map;
};

const printBoxFeatures = new Collection<Feature<Polygon>>();

const printBoxSource = new VectorSource({
  features: printBoxFeatures,
  wrapX: false,
});

const printBoxLayer = new VectorLayer({
  source: printBoxSource,
  zIndex: 5,
});

printBoxLayer.set('id', 'printBoxLayer');

export const PrintBox = ({ map }: PrintBoxProps) => {
  const extent = useAtomValue(printBoxExtentAtom);
  const setCenter = useSetAtom(printBoxCenterAtom);

  useEffect(() => {
    if (!map || !extent) return;

    map.addLayer(printBoxLayer);

    const coords = [
      [
        [extent[0], extent[1]],
        [extent[2], extent[1]],
        [extent[2], extent[3]],
        [extent[0], extent[3]],
        [extent[0], extent[1]],
      ],
    ];

    let feature = printBoxFeatures.item(0);
    if (!feature) {
      feature = new Feature(new Polygon(coords));
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: 'rgba(0,0,0,0.5)',
            width: 2,
            lineDash: [6, 6],
          }),
          fill: new Fill({ color: '#FF770082' }),
        }),
      );
      printBoxFeatures.push(feature);
    } else {
      feature.setGeometry(new Polygon(coords));
    }

    const translate = new Translate({ features: printBoxFeatures });
    map.addInteraction(translate);

    translate.on('translateend', () => {
      const geom = feature!.getGeometry() as Polygon;
      const newExtent = geom.getExtent();
      const newCenter: [number, number] = [
        (newExtent[0] + newExtent[2]) / 2,
        (newExtent[1] + newExtent[3]) / 2,
      ];
      setCenter(newCenter);
    });

    return () => {
      map.removeInteraction(translate);
      map.removeLayer(printBoxLayer);
    };
  }, [map, extent, setCenter]);

  return null;
};
