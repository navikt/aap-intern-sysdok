# Utviklerguide

For å komme i gang: Les [readme-en](https://github.com/navikt/aap-behandlingsflyt)  og gjør deg kjent med denne dokumentasjonen, spesielt [Teknisk beskrivelse](./teknisk.md).

## Vanlige utviklerfeil

### Endringer i avklaringsbehovdefinisjoner

Man skal aldri endre på eller slette eksisterende definisjoner i `Definisjon.kt` - kun legge til nye. Avsluttede og åpne
behandlinger kan brekke som følge av dette. Andre apper, f.eks. statistikk, er også avhengige av historiske
avklaringsbehov.

### Endringer i kontrakt-modulen

Kontrakt-modulen publiseres som bibliotek. Det betyr at endringer i denne modulen kan brekke andre tjenester. Les
mer [her](https://github.com/navikt/aap-behandlingsflyt/blob/main/kontrakt/src/main/kotlin/no/nav/aap/behandlingsflyt/kontrakt/README.md).

### Opprette nye avklaringsbehov
Typiske endringer som kan føre til problemer er å legge til nye avklaringsbehovdefinisjoner (dette i seg selv er lov) og
ta disse i bruk før man har bumpet kontraktversjonen i tilgang, statistikk og oppgave, og eventuelt andre apper som
bruker biblioteket og er avhengige av å gjenkjenne de nye behovene.

Det må derertter genereres typer for `aap-saksbehandling`, og oppdatere oversettelser med navn på avklaringsbehov. Man brekker ikke frontenden dersom man glemmer å gjøre dette, men man kan ikke commite i `aap-saksbehandling` før det er gjort.

### Endringer i flyt

Endringer i flyten (stegrekkefølge, stegnavn, slette steg etc.) kan brekke avsluttede og åpne behandlinger. Historikken
lagres i databasen.

