# Beregninger i AAP
Dette er intern dokumentasjon av beregninger for Team AAP

## Vedlikehold av beregninger dokumenter

### Ved behov for mer eller oppdatert dokumentasjon

Oppdater beregningene manuelt i .typ filene i beregninger-katalogen
basert på de faktiske beregningene i behandlingsflyt-koden

### Automatisk bygg generering av PDF-dokumentasjon

Prosjektets github config (github/workflows/build-pdf.yml) sørger for 
å publisere ny PDF som github-artifact hver gang aap-intern-sysdok 
bygges via github-actions (uavhengig om det er gjort endringer i .typ 
filene) 

### Lokal generering av PDF

Egen typst installasjon
```
typst compile beregninger/beregning.typ
```
Prosjekt typst binær-versjon (samme som Github-Actions benytter)
```
bash beregninger/typst.sh compile beregninger/beregning.typ
```

### Bytt til nyere Typst binær for prosjektet

Bytt versjon og 2 SHA-summer øverst i beregninger/typst.sh scriptet
 
Hent ned ny Typst versjon
```
bash beregninger/typst.sh install --all
```
Sjekk inn ny versjon av både typst-binærer og script til git repo
og se at github action kjører uten feil.
