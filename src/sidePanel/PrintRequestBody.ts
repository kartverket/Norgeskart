export class PrintRequestBody implements MapPrintJob {
  attributes: Attributes
  layout: string
  outputFormat: string
  outputFilename: string

  constructor(data: MapPrintJob) {
    this.attributes = data.attributes
    this.layout = data.layout
    this.outputFormat = data.outputFormat
    this.outputFilename = data.outputFilename
  }

  /** Create an instance from raw JSON string or object */
  static fromJSON(json: string | MapPrintJob): PrintRequestBody {
    const data: MapPrintJob =
      typeof json === "string" ? JSON.parse(json) : json
    return new PrintRequestBody(data)
  }

  /** Convert this object to a JSON string for sending to backend */
  toJSON(): string {
    return JSON.stringify(
      {
        attributes: this.attributes,
        layout: this.layout,
        outputFormat: this.outputFormat,
        outputFilename: this.outputFilename,
      },
      null,
      2
    );
  }

  get scale(): number {
    return this.attributes.map.scale
  }

  set scale(value: number) {
    this.attributes.map.scale = value
  }

  updateCenter(center: [number, number]) {
    this.attributes.map.center = center
  }
}

export interface Matrix {
  identifier: string
  scaleDenominator: number
  topLeftCorner: [number, number]
  tileSize: [number, number]
  matrixSize: [number, number]
}

export interface Layer {
  baseURL: string
  type: 'WMS' | 'WMTS'
  opacity: number
  imageFormat: string
  layers?: string[]
  layer?: string
  style?: string
  customParams?: Record<string, string>
  dimensions?: any
  requestEncoding?: string
  dimensionParams?: Record<string, any>
  matrixSet?: string
  matrices?: Matrix[]
}

export interface MapAttributes {
  center: [number, number]
  dpi: number
  layers: Layer[]
  rotation: number
  projection: string
  scale: number
}

export interface Attributes {
  map: MapAttributes
  pos: string
  scale_string: string
  title: string
}

export interface MapPrintJob {
  attributes: Attributes
  layout: string
  outputFormat: string
  outputFilename: string
}
