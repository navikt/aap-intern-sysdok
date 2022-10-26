# Verifisere arkivering av journalposter og dokumenter

Dette er en quick list for hvordan avdekke om arkivering skjer OK

## Dersom en har journalpost ID

Om en har en journalpost ID fra loggen kan en gå inn i [Logs](https://logs.adeo.no/) for å søke på IDen.

Husk å ha hermetegn rundt "journalpostIden".

 - Dette vil da vise hva som skjer fra journalposten blir opprettet og det som skjer med den etterpå.
 - Dette vil da identifisere hvilken enhet som får oppgavene basert på geolokasjon og oppslag mot NORG.

## Dersom en skal sjekke i arkivsystemet (Joark)

Dersom en skal sjekke i arkivet, trenger en enten selv tilgang til joark, dette får en gjennom tjenestliggjemmel.

Eller en får bistand fra [team dokument i slack](https://nav-it.slack.com/archives/C6W9E5GPJ)

### Nyttige spørringer i joark

1. Dersom en skal sjekke en bestemt journalpost
```
select * from joark.t_journalpost jp where jp.k_fagomrade='AAP' AND jp.opprettet_kilde_navn='soknad-api' AND jp.journalpost_id="journalpostIDen Limes inn her";
```
2. Dersom en skal sjekke alle journalposter som er lagt til av soknad-api
```
select * from joark.t_journalpost jp where jp.k_fagomrade='AAP' AND jp.opprettet_kilde_navn='soknad-api'
```
