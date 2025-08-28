# Grunnlag

Vi gjør veldig sjeldent sletting og oppdaterer av rader i tabeller som inneholder vedtaksfakta. Vi vedlikeholder en `aktiv`-kolonne som sier om en rad er gjeldende.

## Steg for steg

### 1. Skrive for først gang

Man starter med å lage ny rad i `sykdom_grunnlag`-tabellen, og setter `aktiv=true` i denne. Vi bruker en bindetabell `sykdom_vurderinger` for å lage en `1:mange`-relasjon.

![Illustrasjon](grunnlag_tabeller_1.svg)

### 2. Oppdatere i samme behandling

For å "sette inn" nytt grunnlag på samme behandling, deaktiveres først det originale grunnlaget ved å sette `aktiv=false`.  Deretter lager man et nytt innslag i kobling-tabellen.

![Illustrasjon](grunnlag_tabeller_2.svg)

### 3. Kopiere fra gammel behandling

Når ny behandling (revudering) opprettes, beholder man `aktiv=true` for den gamle behandlingen (betyr _aktiv for den gjeldende behandlingen_), men kopierer pekere fra det forrige grunnlaget.

![Illustrasjon](grunnlag_tabeller_3.svg)



## Lage / redigere illustrasjonen

Diagrammet ble lagd med Draw.io, her: https://app.diagrams.net/

Last ned filen `grunnlag_tabeller.drawio` i denne mappen, og åpne den i applikasjonen over. Husk å oppdateree `.drawio`-filen etter endring.
