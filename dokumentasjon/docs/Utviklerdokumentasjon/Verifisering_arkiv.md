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
3. Dersom du skal sjekke et dokument eller flere
```
select * from joark.t_dokument_info di where di.opprettet_av='aap:soknad-api';
```
4. Dersom du skal sjekke dokumenter tilknyttet en journalpost
```
select * from joark.t_dokument_info di where di.opprettet_av='aap:soknad-api' AND di.orig_journalpost_id='LIM INN JOURNALPOSTID HER';
```



## Datamodell i joark og relevante tabeller

Datamodellen til joark [finner du her](https://confluence.adeo.no/display/BOA/Fagarkiv+-+Informasjonsmodell).

Selve journalposten er i tabellen som heter T_JOURNALPOST og dokumentene ligger i T_DOKUMENT_INFO

### Hent ut data m status på journalpost knyttet til ReferanseID anonymt

```
select jp.journalpost_id AS Id, jp.journalf_enhet AS Enhet, TO_CHAR(jp.dato_opprettet, 'DD.MM.YY') AS dato_opprettet,TO_CHAR(jp.dato_endret, 'DD.MM.YY') AS dato_endret,jp.innhold AS Tittel,jp.k_journal_s AS jp_status,jp.kanal_referanse_id AS Referanse_ID from joark.t_journalpost jp where jp.k_fagomrade='AAP' AND jp.opprettet_kilde_navn='soknad-api'; order by jp.jp_status desc;
```
Henter ut anonymisert data fra joark, knytter journalpost til behandlende enhet.

### Grupper innsendinger og hvis meg størrelsen
```
SELECT
TO_CHAR(journal.dato_opprettet, 'DD.MM.YY') AS dato_opprettet,
rel.OPPRETTET_KILDE_NAVN,
journal.k_fagomrade AS fagomraade,
count(*) AS antall_dokumenter,
sum(detaljer.FIL_STORRELSE) / 1024 / 1024 AS sum_filesize_mb
FROM
T_JP_DOK_INFO_REL rel
JOIN T_FIL_DETALJER detaljer ON detaljer.DOKUMENT_INFO_ID = rel.DOKUMENT_INFO_ID
JOIN T_JOURNALPOST journal ON journal.JOURNALPOST_ID = rel.journalpost_id
where 
journal.k_fagomrade='AAP' AND journal.opprettet_kilde_navn='soknad-api'
GROUP BY
rel.JOURNALPOST_ID
,TO_CHAR(journal.dato_opprettet, 'DD.MM.YY')
,journal.k_fagomrade, rel.OPPRETTET_KILDE_NAVN
HAVING sum(detaljer.FIL_STORRELSE) / 1024 / 1024 > 100
```