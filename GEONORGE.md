# Geonorge – Fullstendighetsdekning i Norgeskart

Denne branchen (`geonorge`) legger til støtte for Geonorges
**fullstendighetsdekningskart** i Norgeskart, med to komplementære
tilnærminger:

1. **Temalag** – alle 108 DOK-datasett er tilgjengelige som av/på-brytere i
   temalagpanelet (ingen URL-manipulering nødvendig).
2. **URL-parameter `geojsonUrl`** – vilkårlige GeoJSON-filer kan lastes inn
   direkte via en URL-lenke, for eksempel fra Kartkatalogen eller
   Dekningskartappen.

---

## 1. Temalag: Fullstendighetsdekning

### Aktivering

Åpne **Temakart-panelet** → kategori **Fullstendighetsdekning**. Der finner du
alle 108 datasett som individuelle brytere, for eksempel:

- Ankringsområder
- Brannsmitteområder
- FKB-Veg
- Naturvernområder
- Reindrift: Sommerbeite
- … (og 103 andre)

Slå på ett eller flere datasett (maks 10 aktive temalag totalt). Kartet zoomer
ikke automatisk til dataene ved aktivering fra temalagpanelet – bruk
URL-parameteren (se under) for automatisk zoom.

### Kartografi

Polygonene farges etter `dekningsstatus`-egenskapen i GeoJSON-filene:

| Verdi | Farge | Betydning |
|---|---|---|
| `fullstendig` | Grønn `#a6d388` | Data er fullstendige |
| `ufullstendig` | Gul `#e8d38a` | Data er ufullstendige |
| `ikkeKartlagt` | Oransje `#f09c5a` | Området er ikke kartlagt |
| `ikkeRelevant` | Grå `#b4b4b4` | Datasettet er ikke relevant her |

### Klikk i kartet (GetFeatureInfo)

Klikk på en polygon for å se alle egenskaper for det trufne området, inkludert:

- `datasettnavn` – navn på DOK-datasettet
- `dataeier` – ansvarlig dataeier
- `dekningsstatus` – dekningsstatus
- `dekningsinfo` – supplerende informasjon
- `doktema` – DOK-tema
- `oppdateringsdato`

---

## 2. URL-parameter: `geojsonUrl`

Eksterne systemer (Kartkatalogen, Dekningskartappen) kan lenke direkte til
Norgeskart med én eller flere GeoJSON-lag forhåndslastet.

### Enkelt lag

```
https://norgeskart-preview-geonorge.atkv3-dev.kartverket-intern.cloud/?geojsonUrl=<kodet-url>
```

Eksempel med et fullstendighetsdekning-datasett fra Geonorges testserver:

```
https://norgeskart-preview-geonorge.atkv3-dev.kartverket-intern.cloud/?geojsonUrl=https%3A%2F%2Ftestnedlasting.geonorge.no%2Fgeonorge%2FBasisdata%2FDOKFullstendighetsdekningskart%2FKartkatalogen%2Fdekning_ankringsomrader.geojson
```

### Flere lag

Gjenta parameteren for hvert lag:

```
https://norgeskart-preview-geonorge.atkv3-dev.kartverket-intern.cloud/?geojsonUrl=<url1>&geojsonUrl=<url2>&geojsonUrl=<url3>
```

### Kombinasjon med andre parametere

```
https://norgeskart-preview-geonorge.atkv3-dev.kartverket-intern.cloud/?geojsonUrl=<url>&zoom=6&lat=6868825&lon=217236
```

Hvis ingen `lat`/`lon`/`zoom` er oppgitt, zoomer kartet automatisk inn på
utstrekningen til de lastede lagene.

### Datasett på Geonorges testserver

Basisadresse:
```
https://testnedlasting.geonorge.no/geonorge/Basisdata/DOKFullstendighetsdekningskart/Kartkatalogen/
```

Alle filer følger navnemønsteret `dekning_<datasett>.geojson`. Eksempler:

| Fil | Datasett |
|---|---|
| `dekning_adresse.geojson` | Adresse |
| `dekning_ankringsomrader.geojson` | Ankringsområder |
| `dekning_fkb-veg.geojson` | FKB-Veg |
| `dekning_naturvernomrader.geojson` | Naturvernområder |
| `dekning_n50.geojson` | N50 |

Filnavn med mellomrom (f.eks. `dekning_n5 kartdata.geojson`) må
URL-enkodes: `dekning_n5%20kartdata.geojson`.

---

## 3. Kartografi og stilsetting

### Prioriteringsrekkefølge

Stilsettingen velges automatisk basert på filnavnet og innholdet i dataene:

| Prioritet | Betingelse | Stil som brukes |
|---|---|---|
| 1 (høyest) | Filnavn starter med `dekning_` (via `geojsonUrl`-param) | `dekningsstatus`-farger |
| 1 (høyest) | Temalag med `styleType: 'dekningsstatus'` | `dekningsstatus`-farger |
| 2 | Features har simplestyle-spec-egenskaper (`fill`, `stroke` osv.) | Per-feature simplestyle |
| 3 | Ingen av ovennevnte | Standard blå stil |

### Simplestyle-spec

For vilkårlige GeoJSON-filer (ikke `dekning_*`) støttes
[simplestyle-spec v1.1](https://github.com/mapbox/simplestyle-spec):

| Egenskap | Effekt |
|---|---|
| `fill` | Fyllfarge (hex) |
| `fill-opacity` | Fyllopasitet (0–1) |
| `stroke` | Strekfarge (hex) |
| `stroke-opacity` | Strekopasitet (0–1) |
| `stroke-width` | Strekbredde (px) |
| `marker-color` | Punktfarge (hex) |
| `marker-size` | Punktstørrelse: `small`, `medium`, `large` |

### Koordinatsystem

- GeoJSON-filer fra Geonorge er i **EPSG:25833** og inneholder et `crs`-felt.
- Via `geojsonUrl`-parameteren leses `crs`-feltet automatisk, slik at
  koordinater transformeres korrekt uavhengig av projeksjon.
- Temalagene er konfigurert med `sourceEpsg: 'EPSG:25833'` i koden.

---

## 4. Teknisk oversikt

### Nye og endrede filer

| Fil | Endring |
|---|---|
| `src/map/layers/urlGeoJson.ts` | Ny – atom + lagfabrikk for URL-lastede GeoJSON-lag, simplestyle-tolker, `dekningsstatus`-stil |
| `src/map/layers/config/fullstendighetsdekning.ts` | Ny – konfig for alle 108 DOK-datasett |
| `src/map/layers/themeGeoJson.ts` | Oppdatert – støtter `styleType: 'dekningsstatus'` og setter `layerTitle` |
| `src/api/themeLayerConfigApi.ts` | Oppdatert – `styleType`-felt på `ThemeLayerDefinition`; registrerer ny konfig |
| `src/map/layers/themeWMS.ts` | Oppdatert – `FullstendighetsdekningLayerName` union-type (108 lag) |
| `src/shared/utils/urlUtils.ts` | Oppdatert – `geojsonUrl` lagt til `NKUrlParameter`; ny `getAllUrlParameters()`-hjelper |
| `src/map/MapComponent.tsx` | Oppdatert – laster GeoJSON-lag fra `geojsonUrl`-parametere ved oppstart |

### Atom-basert tilstand

Lastede URL-GeoJSON-lag spores i `urlGeoJsonLayersAtom`
(`src/map/layers/urlGeoJson.ts`). Dette gjør det mulig å utvide med
fjerning av lag, dynamisk tegnforklaring osv. i fremtidige faser.

### GetFeatureInfo

Alle GeoJSON-lag (både URL-baserte og temalag) plukkes automatisk opp av
`getVisibleVectorLayers()` i `featureInfoService.ts` fordi de får
`id: 'theme.*'`. Klikk i kartet viser egenskaper fra trufne features gruppert
per lag.

---

## 5. Fremtidige muligheter (ikke implementert)

- **SLD-styling** – `sldUrl`-parameter for å pare en SLD-stilfil med et
  GeoJSON-lag. Geonorge har utarbeidet en standardisert SLD for
  fullstendighetsdekning.
  OBS: SLD-støtte krever utvikling og er ikke prioritert. SLD er mest egnet for WMS-lag.
- **OGC API Features** – erstatte nedlasting av hele GeoJSON-filen med
  on-demand henting via OGC API Features + OGC API Styles.
- **Dynamisk katalog** – hente fillisten fra Geonorges server ved oppstart
  i stedet for statisk konfig, slik at nye datasett dukker opp automatisk.
- **Tegnforklaring** – vise `dekningsstatus`-fargeforklaringen i kartets
  legendepanel for aktive fullstendighetsdekningslag.
- **Fjern-knapp per lag** – la brukeren fjerne enkeltlag lastet via
  `geojsonUrl` uten å redigere URL-en manuelt.
