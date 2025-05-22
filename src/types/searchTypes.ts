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

export type Adresse = {
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

export type AdresseApiResponse = {
  metadata: Metadata;
  adresser: Adresse[];
};

export type Fylke = {
  fylkesnavn: string;
  fylkesnummer: string;
};

export type Kommune = {
  kommunenavn: string;
  kommunenummer: string;
};

export type StedsNavn = {
  fylker: Fylke[];
  kommuner: Kommune[];
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

export type StedsnavnApiResponse = {
  metadata: Metadata;
  navn: StedsNavn[];
};

export type Veg = {
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
