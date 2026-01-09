# Norgeskart

Kildekode til norgeskart.no 2025. Enn så lenge WIP


For endringslogg, se [wiki-siden](https://github.com/kartverket/Norgeskart/wiki/Endringslogg).


## Copyright

The content of norgeskart.no and this repository is available under the following licenses:

Kartverkets logo and font: (C) Kartverket. OpenLayers and all contributions to openlayers, included at /lib/src/openlayers: BSD style - see https://github.com/openlayers/openlayers/blob/master/LICENSE.md Everything else: Public Domain. The solution uses web services from Kartverket which are subject to their own licenses (mostly CC-BY 3.0 Norway) and the Norwegian Geodata law. See http://kartverket.no/data/lisens/ for the license terms and http://kartverket.no/data/ for details on the web ser

The code contents are available under the MIT licence, see the LICENCE file for more details.

## Kom igang

For å kjøre applikasjonen kreves npm og node. Vi prøver å holde oss til current LTS, som nå er 24.

```sh
npm install &&\
npm run dev
```

Skal starte en utviklingsserver og siden skal være mulig å nå på localhost:3000

## Bygge og pakke inn i kontainer

For at applikasjonen skal kjøre på Kartverkets platform bygges den inn i et docker image. For å gjøre disse stegene kreves at du har docker installert og kjørende på maskinen din. For å bygge, pakke sammen og kjøre en docker container gjør du følgende

```sh
npm run build  &&\
docker build -t norgeskart . &&\
docker run -p 3000:3000 -d norgeskart
```

## Språk

For å støtte forskjellge språk har vi filer i `src/locales/[ditt språk her]`. Denne kan du redigere manuelt, eller du kan bruke scriptene addWord og removeWord. Disse kan du kjøre på følgende måte

```sh
npm run aword -- path.til.det.du.vil.sette "valgfri verdi"
```

Hvis du ikke legger ved en verdi får du spørsmål for hver av språkene scriptet finner

For å fjerne et ord, selv om det er nøstet kjører du

```sh
npm run rword --path.til.det.som.skal.bort
```

Disse verdiene kan så brukes i en komponent

```js
import { useTranslation } from 'react-i18next';

const MinKomponent = () => {
  const { t } = useTranslation();
  return <>{t('path.til.det.du.vil.sette')}</>;
};
```

## Nettleserkompatibilitet

En gang i blandt, kjør følgende for å holde caniuse-db oppdatert

```sh
npx update-browserslist-db@latest
```
