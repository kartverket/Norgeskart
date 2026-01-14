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

export type SubmitJobResponse = {
  jobId: string;
  jobStatus: string;
};

export type OutputType = 'output_points' | 'output_polyline';

export type EsriJobStatus =
  | 'esriJobSubmitted'
  | 'esriJobWaiting'
  | 'esriJobExecuting'
  | 'esriJobSucceeded'
  | 'esriJobFailed'
  | 'esriJobCancelled';

type EsriJobMessage = {
  type:
    | 'esriJobMessageTypeInformative'
    | 'esriJobMessageTypeWarning'
    | 'esriJobMessageTypeError';
  description: string;
  code: number;
};

export type JobStatusResponse = {
  jobId: string;
  jobStatus: EsriJobStatus;
  messages: EsriJobMessage[];
  results?: {
    [key in OutputType]?: {
      paramUrl: string;
    };
  };
};

export type JobResultResponse = {
  dataType: string;
  paramName: OutputType;
  value: {
    displayFieldName: string;
    exceededTransferLimit: boolean;
    features: Array<{
      attributes: { [key: string]: any };
      geometry: { x: number; y: number; z?: number; m?: number };
    }>;
  };
  fields: Array<{
    name: string;
    type: string;
    alias: string;
  }>;
  geometryType: string;
  spatialReference: { wkid: number; latestWkid: number };
};
