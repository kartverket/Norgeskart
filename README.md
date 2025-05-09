# Norgeskart
Kildekode til norgeskart.no 2025. Enn så lenge WIP



## Copyright
The content of norgeskart.no and this repository is available under the following licenses:

Kartverkets logo and font: (C) Kartverket. OpenLayers and all contributions to openlayers, included at /lib/src/openlayers: BSD style - see https://github.com/openlayers/openlayers/blob/master/LICENSE.md Everything else: Public Domain. The solution uses web services from Kartverket which are subject to their own licenses (mostly CC-BY 3.0 Norway) and the Norwegian Geodata law. See http://kartverket.no/data/lisens/ for the license terms and http://kartverket.no/data/ for details on the web ser

## Kom igang
For å kjøre applikasjonen kreves npm og node >= 20.0.0.
 
 ``` npm install``` 

 ``` npm run dev```

 Skal starte en utviklingsserver og siden skal være mulig å nå på localhost:3000

 ## Bygge og pakke inn i kontainer

 For at applikasjonen skal kjøre på Kartverkets platform bygges den inn i et docker image. For å gjøre disse stegene kreves at du har docker installert og kjørende på maskinen din. Bygg gjøres på følgende måte:

 ```npm run build ```

 Som lager byggartefakter i /dist

 Deretter

 ```docker build  -t norgeskart```
 
 For å bygge og 

 ```docker run -p 3000:3000 -d norgeskart```

 for å kjøre containeren du har laget