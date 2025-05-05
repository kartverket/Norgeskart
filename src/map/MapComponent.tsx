import { View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import Map from 'ol/Map.js';
import { useEffect } from 'react';
import { XYZ } from 'ol/source';

export const MapComponent = () => {
  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topo&STYLE=default&FORMAT=image/png&TILEMATRIXSET=utm33n&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
          }),
        }),
      ],
      view: new View({
        center: [570130, 7032300],
        zoom: 3,
      }),
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);
  return <div id="map" style={{width: "100%", height: "100vh"}}/>;
};
