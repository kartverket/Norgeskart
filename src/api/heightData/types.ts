export class GPFeatureRecordSetLayer {
  gepmetryType: string;
  spatialReference: { wkid: number };
  features: Array<{
    attributes: {};
    geometry: {
      paths: number[][][];
    };
  }>;

  constructor(paths: number[][][], wkid: number) {
    this.gepmetryType = 'esriGeometryPolyline';
    this.spatialReference = { wkid: wkid };
    this.features = [
      {
        attributes: {},
        geometry: {
          paths: paths,
        },
      },
    ];
  }
}
