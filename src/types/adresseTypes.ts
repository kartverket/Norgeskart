export type RepresentasjonsPunkt = {
  espg: string;
  lon: number;
  lat: number;
}

export type Adresser = {
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
  representasjonspunkt: RepresentasjonsPunkt,
  oppdateringsdato: string,
}