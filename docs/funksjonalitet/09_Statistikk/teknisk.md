---
sidebar_position: 1
---

# Teknisk beskrivelse

[Github](https://github.com/navikt/aap-statistikk) | [Swagger](https://aap-statistikk.intern.dev.nav.no/swagger-ui/index.html) | [Grafana](https://grafana.nav.cloud.nais.io/d/edqu3y0nhmxhcb/statistikk?orgId=1) | [Nais Console](https://console.nav.cloud.nais.io/team/aap/dev-gcp/app/statistikk) | [Adeo](https://logs.adeo.no/app/r?l=DISCOVER_APP_LOCATOR&v=8.13.4&lz=N4IgjgrgpgTgniAXKANgQwHYHMJq1JEAa2nhABpxSFEQ0AHelASwGM0AXZgewwAJEfADogAzh07NxzIkREgAvpVHcYHJAG0NIAAJcAtlHFp99CiAAmR1iAC6tyq24oI%2BjKM0gUUAG5QU5oaiongElFAYPqzoweYMTGySvOb03BZ2lMwYVgAehACcAGxQhQAsABysAAwAtPnlVWg1AIzNUPk15QDMjTVQzQDsAEZDFmVDpRZD5lkcsD5oAbRoEBzc5gBmzChzMB6IGg6WnGgAasxQAO4Akum0RSUV1XUNTa3tnT1N%2FcOj45PTSgGKAAJUw%2BCQoA2MG4%2BkIGG4lxqACZSgALAD0aPMa3hiMUlBgUGhRjR1wwuwWS1AVOgSEKVUZVUo9BWogIiA4MGgCgUQA%3D%3D%3D) | [Google Cloud BigQuery-konsoll](https://console.cloud.google.com/bigquery?ws=!1m4!1m3!3m2!1saap-dev-e48b!2stester)

## Kjøre lokalt

Fra IntelliJ, kjør `TestApp`-klassen. Evt kjør `./gradlew runTestApp`.

Swagger-UI kan da åpnes på: http://0.0.0.0:8080/swagger-ui/index.html

For å gjøre autentiserte kall trengs JWT-token fra "fake Azure AD" (startet i `Fakes`-klassen). "Fake AD" kjører på `localhost:8081`, og du kan få token ved å kjøre

```
curl -s -XPOST http://localhost:8081/token  | jq -r '.access_token' | pbcopy
```

Nå kan API-kall gjøres i Swagger UI ved å trykke på "Authorize"-knappen og lime inn token.

## Hente test-token i dev

Se detaljer på [NAIS docs](https://docs.nais.io/auth/tokenx/how-to/generate/).

Besøk denne URL:

```
https://azure-token-generator.intern.dev.nav.no/api/m2m?aud=dev-gcp:aap:statistikk
```

Logg inn som en saksbehandler. Du vil få JSON som respons. Kopier `access_token`-verdien og lim den inn i [Swagger UI](https://aap-statistikk.intern.dev.nav.no/swagger-ui/index.html). Nå kan API testes i dev.

## Gjøre dump av testdatabasen for lokal utvikling

Sett opp proxy til databasen via NAIS-kommandolinjeverktøyet, se [her](https://doc.nais.io/persistence/postgres/how-to/personal-access/).

Deretter kjør en dump slik:

```
docker run  --rm -p 5432:5432 postgres:16 pg_dump -T public.jobb -T public.jobb_historikk --clean -h host.docker.internal -p 5432  -U ditt.navn@nav.no -d hendelser  > dump.sql
```

Erstatt `mitt.navn@nav.no` med din NAV-epost.

Kjør opp test-appen (se over), og finn begynnelsen på navnet på den kjørende Postgres-containeren, f.eks `0eb43`.

Deretter kjør:

```
docker exec -i  0eb43 psql -U test -d test < dump.sql
```

Nå er den lokale databasen overskrevet med dumpen fra dev.

## Roller til servicebruker

Gå til den aktuelle BigQuery-tabellen, og klikk på "Manage permissions". Se bildet:

![Manage permissions i BigQuery](../../bilder/bq_permissions.png)

Gi service-brukeren `BigQuery data viewer`-tilgang.

![Manage permissions i BigQuery](../../bilder/bq_permissions_2.png)

:::info

Etterhvert™ bør vi sette dette opp med Terraform (eller lignende), men per nå er det klikk i GUI.

:::

## Gjøre endringer på skjema i BigQuery

Å legge til nye kolonner i skjemaet støttes av SDK-et, men om datatype skal endres, må DDL brukes.

Siden dette er en engangsoperasjon, er det enkleste å gjøre i konsollet.

Her er eksempel på hvordan endre `tekniskTid` fra `DATETIME` til `TIMESTAMP`-type.

 1. Kopier sak-tabellen for å kunne teste endringer.
 2. I konsollet, legg til en ny kolonne:
    ```sql
     alter table `tester.sak_copy` add column tekniskTid2 timestamp;
    ```
 3. Denne er nå tom, så oppdater den med verdier fra den eksisterende kolonnnen:
    ```sql
    update `tester.sak_copy` set tekniskTid2 = timestamp(tekniskTid) where true;
    ```
 4. Til slutt drop den gamle, og rename den nye:
    ```sql
    alter table `tester.sak_copy` drop column tekniskTid;
    alter table `tester.sak_copy` rename column tekniskTid2 to tekniskTid;
    ```
    
For å bevare konsistens, gjør endring stegvis:
 1. Legg til ny kolonne i kode og deploy (slik at begge feltene blir skrevet til).
 2. Oppdater `tekniskTid2` for eldre innslag.
 3. Kjør steg 4. Dette vil føre til at innslag feiler, siden `tekniskTid2` ikke eksisterer mer, og jobben vil bli retryet.
 4. Deploy kodeendring hvor `tekniskTid2` ikke refereres til lenger.
 
 
:::warning

Jeg har ikke 100% tenkt gjennom alle samtidighetsproblemer som kan skje her. Men jeg tror at om rekkefølgen over overholdes, burde dette gi trygg migrering.

:::

## App-arkitektur

Overordnet skisse av arkitektur:


```mermaid
graph LR
BB[Behandlingsflyt]
OPPG[Oppgave]
POST[Postmottak]
B[(Postgres)]
C[(BigQuery)]

subgraph StatistikkApp

subgraph Api
  hendelse[behandling-hendelser]
end

subgraph Motor

LagreAvsluttetBehandlingTilBigQueryJobb
LagreOppgaveHendelseJobb
LagreOppgaveJobb
LagrePostmottakHendelseJobb
LagreSakinfoTilBigQueryJobb
LagreStoppetHendelseJobb

LagreOppgaveHendelseJobb --> LagreOppgaveJobb

end
hendelse --> LagreStoppetHendelseJobb
end

LagreStoppetHendelseJobb --> B
LagreOppgaveHendelseJobb --> B
LagreOppgaveJobb <--> B
LagreSakinfoTilBigQueryJobb --> C
LagreAvsluttetBehandlingTilBigQueryJobb --> C
hendelse --> LagreOppgaveHendelseJobb
LagreOppgaveJobb --> B
LagreOppgaveHendelseJobb --> B
B --> LagreOppgaveJobb

BB -. avgi statistikk .-> Api
OPPG -. oppgave-endringer .-> Api
POST --> Api

B -- Replikere tabeller --> C
```

Data fra hendelser (stopp i behandlinger i postmottak og behandlingsflyt, og oppgave-hendelser) brukes for å bygge opp en rikere modell i Postgres, slik at å lagre data i BigQuery ikke krever flere spørringer.

Enkelte tabeller blir replikert til BigQuery via Datastream.

Ideen med å ha både en Postgres-database og et BigQuery-datasett, er at vi "eier" Postgres-databasen, og vi tenker på BigQuery-datasettet som "for eksterne", og i den forstand bør det være stabilt og ikke endre skjema veldig ofte. Det gir oss også mulighet til å implementere for eksempel produksjonsstyring uten å involvere BigQuery.


### Databaseskjema

Eksportert fra IntelliJ (koble til database, vis diagram, og eksporter til Mermaid, deretter fjerne syntaksfeil (`id:id` -> `id id`))

Per 13/9-2024:
```mermaid
classDiagram
direction BT
class behandling {
   bigint sak_id
   uuid referanse
   varchar(100) type
   timestamp(3) opprettet_tid
   bigint forrige_behandling_id
   bigint id
}
class behandling_historikk {
   bigint behandling_id
   bigint versjon_id
   boolean gjeldende
   timestamp(3) oppdatert_tid
   timestamp(3) mottatt_tid
   varchar(20) status
   varchar(100) siste_saksbehandler
   varchar(50) gjeldende_avklaringsbehov
   varchar(50) soknadsformat
   varchar(100) venteaarsak
   varchar(100) steggruppe
   bigint id
}
class bigquery_kvittering {
   bigint sak_snapshot_id
   bigint behandling_snapshot_id
   timestamp(3) tidspunkt
   bigint id
}
class flyway_schema_history {
   varchar(50) version
   varchar(200) description
   varchar(20) type
   varchar(1000) script
   integer checksum
   varchar(100) installed_by
   timestamp installed_on
   integer execution_time
   boolean success
   integer installed_rank
}
class grunnlag {
   varchar(10) type
   bigint behandling_id
   bigint id
}
class grunnlag_11_19 {
   bigint grunnlag_id
   numeric(21,5) grunnlag
   boolean er6g_begrenset
   boolean er_gjennomsnitt
   jsonb inntekter
   bigint id
}
class grunnlag_ufore {
   bigint grunnlag_id
   numeric(21,5) grunnlag
   varchar(20) type
   bigint grunnlag_11_19_id
   integer uforegrad
   jsonb ufore_inntekter_fra_foregaende_ar
   integer ufore_ytterligere_nedsatt_arbeidsevne_ar
   bigint id
}
class grunnlag_yrkesskade {
   numeric(21,5) grunnlag
   bigint beregningsgrunnlag_id
   varchar(10) beregningsgrunnlag_type
   integer terskelverdi_for_yrkesskade
   numeric andel_som_skyldes_yrkesskade
   integer andel_yrkesskade
   integer benyttet_andel_for_yrkesskade
   numeric andel_som_ikke_skyldes_yrkesskade
   numeric antatt_arlig_inntekt_yrkesskade_tidspunktet
   integer yrkesskade_tidspunkt
   numeric grunnlag_for_beregning_av_yrkesskadeandel
   numeric yrkesskadeinntekt_ig
   numeric grunnlag_etter_yrkesskade_fordel
   bigint id
}
class jobb {
   varchar(50) status
   varchar(50) type
   bigint sak_id
   bigint behandling_id
   text parameters
   text payload
   timestamp(3) neste_kjoring
   timestamp(3) opprettet_tid
   bigint id
}
class jobb_historikk {
   bigint jobb_id
   varchar(50) status
   text feilmelding
   timestamp(3) opprettet_tid
   bigint id
}
class person {
   varchar(19) ident
   bigint id
}
class relaterte_personer {
   bigint behandling_id
   bigint person_id
   bigint id
}
class sak {
   varchar(19) saksnummer
   bigint person_id
   bigint id
}
class sak_historikk {
   boolean gjeldende
   timestamp(3) oppdatert_tid
   bigint sak_id
   varchar(15) sak_status
   bigint id
}
class tilkjent_ytelse {
   bigint behandling_id
   bigint id
}
class tilkjent_ytelse_periode {
   timestamp(3) fra_dato
   timestamp(3) til_dato
   numeric(21,5) dagsats
   numeric(21,5) gradering
   bigint tilkjent_ytelse_id
   bigint id
}
class versjon {
   varchar(100) versjon
   bigint id
}
class vilkar {
   text vilkar_type
   bigint vilkarresult_id
   bigint id
}
class vilkarsperiode {
   timestamp(3) fra_dato
   timestamp(3) til_dato
   text utfall
   boolean manuell_vurdering
   text innvilgelsesaarsak
   text avslagsaarsak
   bigint vilkar_id
   integer id
}
class vilkarsresultat {
   bigint behandling_id
   bigint id
}

behandling  -->  behandling : forrige_behandling_id  id
behandling  -->  sak : sak_id id
behandling_historikk  -->  behandling : behandling_id id
behandling_historikk  -->  versjon : versjon_id id
bigquery_kvittering  -->  behandling_historikk : behandling_snapshot_id id
bigquery_kvittering  -->  sak_historikk : sak_snapshot_id id
grunnlag  -->  behandling : behandling_id id
grunnlag_11_19  -->  grunnlag : grunnlag_id id
grunnlag_ufore  -->  grunnlag : grunnlag_id id
grunnlag_ufore  -->  grunnlag_11_19 : grunnlag_11_19_id id
jobb  -->  behandling : behandling_id id
jobb  -->  sak : sak_id id
jobb_historikk  -->  jobb : jobb_id id
relaterte_personer  -->  behandling : behandling_id id
relaterte_personer  -->  behandling_historikk : behandling_id id
relaterte_personer  -->  person : person_id id
sak  -->  person : person_id id
sak_historikk  -->  sak : sak_id id
tilkjent_ytelse  -->  behandling : behandling_id id
tilkjent_ytelse_periode  -->  tilkjent_ytelse : tilkjent_ytelse_id id
vilkar  -->  vilkarsresultat : vilkarresult_id id
vilkarsperiode  -->  vilkar : vilkar_id id
vilkarsresultat  -->  behandling : behandling_id id
```


## Tester

Testdekningen er (per nå) høy, og det er brukt en blanding av mocking og TestContainers for å teste.


## Tabeller i BigQuery

### `oppgave_hendelser`

Hver rad er en hendelse knyttet til en oppgave.

| Kolonne    | Beskrivelse |
| -------- | ------- |
| id | *INT64*: Primærnøkkel. Unike radteller. |
| oppgave_id | *INT64*: Fremmednøkkel. Radteller i `oppgave`-tabell. |
| identifikator | *INT64*: Identifikator for oppgavehendelse. |
| type | *STRING*: Unike verdier:  |
| mottatt_tidspunkt | *TIMESTAMP*: [Beskrivelse] |
| saksnummer | *STRING*: [Beskrivelse] |
| behandling_referanse | *STRING*: [Beskrivelse] |
| journalpost_id | *INT64*: [Beskrivelse] |
| enhet | *STRING*: [Beskrivelse] |
| avklaringsbehov_kode | *STRING*: [Beskrivelse] |
| status | *STRING*: [Beskrivelse] |
| reservert_av | *STRING*: [Beskrivelse] |
| reservert_tidspunkt | *TIMESTAMP*: [Beskrivelse] |
| opprettet_tidspunkt | *TIMESTAMP*: [Beskrivelse] |
| endret_av | *STRING*: [Beskrivelse] |
| endret_tidspunkt | *TIMESTAMP*: [Beskrivelse] |
| datastream_metadata | *STRUCT uuid STRING source_timestamp INT64>*: [Beskrivelse] |
