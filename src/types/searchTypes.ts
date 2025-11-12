import { ParsedCoordinate } from '../shared/utils/coordinateParser';

export type RepresentasjonsPunkt = {
  epsg: string;
  lon: number;
  lat: number;
};

export type RepresentasjonsPunktNorsk = {
  koordsys: string;
  øst: number;
  nord: number;
};

export type Address = {
  adressekode: number;
  adressenavn: string;
  adressetekst: string;
  adressetilleggsnavn: string;
  bokstav: string;
  kommunenummer: string;
  kommunenavn: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer: number;
  undernummer: number;
  bruksenhetsnummer: [];
  objtype: string;
  poststed: string;
  postnummer: string;
  adressetekstutenadressetillegssnavn: string;
  stedfestingverifisert: boolean;
  representasjonspunkt: RepresentasjonsPunkt;
  oppdateringsdato: string;
};

export type AddressApiResponse = {
  metadata: Metadata;
  adresser: Address[];
};

export type County = {
  fylkesnavn: string;
  fylkesnummer: string;
};

export type Municipality = {
  kommunenavn: string;
  kommunenummer: string;
};

export type PlaceName = {
  fylker: County[];
  kommuner: Municipality[];
  navneobjekttype: string;
  representasjonspunkt: RepresentasjonsPunktNorsk;
  skrivemåte: string;
  skrivemåtestatus: string;
  språk: string;
  stedsnummer: number;
  stedstatus: string;
};

export type PlaceNamePoint = {
  meterFraPunkt: number;
  representasjonspunkt: RepresentasjonsPunktNorsk;
  stedsnavn: PlaceNameDetails[];
  stedsnummer: number;
  stedstatus: string;
  navneobjekttype: string;
};

export type PlaceNameDetails = {
  navnestatus: string;
  skrivemåte: string;
  skrivemåtestatus: string;
  språk: string;
  stedsnavnnummer: number;
};

export class Place {
  counties: County[];
  municipalities: Municipality[];
  placeType: string;
  name: string;
  location: RepresentasjonsPunktNorsk;

  constructor(
    counties: County[],
    municipalities: Municipality[],
    placeType: string,
    name: string,
    representationPoint: RepresentasjonsPunktNorsk,
  ) {
    this.counties = counties;
    this.municipalities = municipalities;
    this.placeType = placeType;
    this.name = name;
    this.location = representationPoint;
  }

  static fromPlaceName(placeName: PlaceName): Place {
    return new Place(
      placeName.fylker,
      placeName.kommuner,
      placeName.navneobjekttype,
      placeName.skrivemåte,
      placeName.representasjonspunkt,
    );
  }
  static fromPlaceNamePoint(placeNamePoint: PlaceNamePoint): Place {
    const firstName = placeNamePoint.stedsnavn[0];
    return new Place(
      [],
      [],
      placeNamePoint.navneobjekttype,
      firstName.skrivemåte,
      placeNamePoint.representasjonspunkt,
    );
  }
}

export type Metadata = {
  side: number;
  sokeStreng: string;
  totaltAntallTreff: number;
  treffPerSide: number;
  utkoordsys: number;
  viserFra: number;
  viserTil: number;
};

export type PlaceNameApiResponse = {
  metadata: Metadata;
  navn: PlaceName[];
};

export type PlaceNamePointApiResponse = {
  metadata: Metadata;
  navn: PlaceNamePoint[];
};

export type Road = {
  ADRESSEKODE: string;
  FYLKESNAVN: string;
  FYLKESNR: string;
  HUSNUMMER: string[];
  ID: string;
  KILDE: string;
  KOMMUNENAVN: string;
  KOMMUNENR: string;
  LATITUDE: string;
  LONGITUDE: string;
  NAVN: string;
  OBJEKTTYPE: string;
  TILHOERIGHET: string[];
  TITTEL: string[];
};

export type Property = {
  BRUKSNR: string;
  FESTENR: string;
  FYLKESNAVN: string;
  FYLKESNR: string;
  GARDSNR: string;
  ID: string;
  KOMMUNENAVN: string;
  KOMMUNENR: string;
  LATITUDE: string;
  LONGITUDE: string;
  NAVN: string;
  OBJEKTTYPE: string;
  SEKSJONSNR: string;
  TILHOERIGHET: string[];
  TITTEL: string;
  TITTEL2: string;
  TITTEL3: string[];
  TITTEL4: string[];
  VEGADRESSE: string[];
  VEGADRESSE2: string;
};

export type SearchResultBase = {
  name: string;
  lat: number;
  lon: number;
};

export type SearchResultType =
  | 'Property'
  | 'Road'
  | 'Place'
  | 'Address'
  | 'Coordinate';

export type SearchResult = SearchResultBase &
  (
    | {
        type: 'Property';
        property: Property;
      }
    | {
        type: 'Road';
        road: Road;
      }
    | {
        type: 'Place';
        place: Place;
      }
    | {
        type: 'Address';
        address: Address;
      }
    | {
        type: 'Coordinate';
        coordinate: ParsedCoordinate;
      }
  );
