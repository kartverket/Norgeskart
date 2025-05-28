export type RepresentasjonsPunkt = {
  espg: string;
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

export type Road = {
  ADRESSEKODE: string;
  FYLKESNAVN: string;
  FYLKESNR: string;
  HUSNUMMER: string;
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
