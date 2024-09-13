# Teknisk beskrivelse

Swagger-dokumentasjon: https://aap-statistikk.intern.dev.nav.no/swagger-ui/index.html


[Lenke til Nais Console](https://console.nav.cloud.nais.io/team/aap/dev-gcp/app/statistikk)

Logger: [Adeo](https://logs.adeo.no/app/r?l=DISCOVER_APP_LOCATOR&v=8.13.4&lz=N4IgjgrgpgTgniAXKANgQwHYHMJq1JEAa2nhABpxSFEQ0AHelASwGM0AXZgewwAJEfADogAzh07NxzIkREgAvpVHcYHJAG0NIAAJcAtlHFp99CiAAmR1iAC6tyq24oI%2BjKM0gUUAG5QU5oaiongElFAYPqzoweYMTGySvOb03BZ2lMwYVgAehACcAGxQhQAsABysAAwAtPnlVWg1AIzNUPk15QDMjTVQzQDsAEZDFmVDpRZD5lkcsD5oAbRoEBzc5gBmzChzMB6IGg6WnGgAasxQAO4Akum0RSUV1XUNTa3tnT1N%2FcOj45PTSgGKAAJUw%2BCQoA2MG4%2BkIGG4lxqACZSgALAD0aPMa3hiMUlBgUGhRjR1wwuwWS1AVOgSEKVUZVUo9BWogIiA4MGgCgUQA%3D%3D%3D)

Grafana-dashboard: https://grafana.nav.cloud.nais.io/d/edqu3y0nhmxhcb/statistikk?orgId=1

## Kjøre lokalt

Fra IntelliJ, kjør `TestApp`-klassen.

Swagger-UI kan da åpnes på: http://0.0.0.0:8080/swagger-ui/index.html

For å gjøre autentiserte kall trengs JWT-token fra "fake Azure AD" (startet i `Fakes`-klassen). "Fake AD" kjører på `localhost:8081`, og du kan få token ved å kjøre

```
curl -s -XPOST http://localhost:8081/token  | jq -r '.access_token' | pbcopy
```

Nå kan API-kall gjøres i Swagger UI ved å trykke på "Authorize"-knappen og lime inn token.

## API-kontrakt

Statistikk-appen publiserer et artifakt slik at konsumenter lett kan generere gyldige DTO-er.

Eksempel-bruk: (sjekk nyeste versjon [på Github](https://github.com/navikt/aap-statistikk/packages/2234133))

```gradle
    implementation("no.nav.aap.statistikk:api-kontrakt:0.0.3")
```

## App-arkitektur

Overordnet skisse av arkitektur:


```mermaid
graph LR
BB[Behandlingsflyt]
OPPG[OppgaveStyring]
B[(Postgres)]
C[(BigQuery)]

subgraph StatistikkApp

subgraph Api
  hendelse
  avsluttetBehandling
end

subgraph Motor

lagreHendelseJobb
lagreRåAvsluttetBehandlingJobb
lagreAvsluttetBehandlingJobb

end
hendelse --> lagreHendelseJobb
avsluttetBehandling --> lagreRåAvsluttetBehandlingJobb
end

lagreRåAvsluttetBehandlingJobb --> B
lagreRåAvsluttetBehandlingJobb --> lagreAvsluttetBehandlingJobb
lagreHendelseJobb --> B
lagreAvsluttetBehandlingJobb --> B
lagreAvsluttetBehandlingJobb --> C

BB -. avgi statistikk .-> Api
OPPG -. (ikke implementert) .-> Api
```

Data fra hendelser (stopp i behandlingen) og avsluttet behandling brukes for å bygge opp en rikere modell i Postgres, slik at å lagre data i BigQuery ikke krever flere spørringer.

Ideen med å ha både en Postgres-database og et BigQuery-datasett, er at vi "eier" Postgres-databasen, og vi tenker på BigQuery-datasettet som "for eksterne", og i den forstand bør det være stabilt og ikke endre skjema veldig ofte. Det gir oss også mulighet til å implementere for eksempel produksjonsstyring uten å involvere BigQuery.


### Databaseskjema

Eksportert fra IntelliJ (koble til database, vis diagram, og eksporter til Mermaid)

Per 13/9-2024:

```mermaid
classDiagram
direction BT
class avsluttet_behandling {
   text payload
   bigint id
}
class behandling {
   bigint sak_id
   uuid referanse
   varchar(100) type
   timestamp(3) opprettet_tid
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
   boolean er6g_begrenset
   varchar(20) type
   bigint grunnlag_11_19_id
   integer uforegrad
   jsonb ufore_inntekter_fra_foregaende_ar
   numeric ufore_inntekt_i_kroner
   integer ufore_ytterligere_nedsatt_arbeidsevne_ar
   bigint id
}
class grunnlag_yrkesskade {
   numeric(21,5) grunnlag
   boolean er6g_begrenset
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
class motta_statistikk {
   bigint behandling_id
   bigint sak_id
   varchar(255) status
   bigint id
}
class person {
   varchar(19) ident
   bigint id
}
class sak {
   varchar(19) saksnummer
   bigint person_id
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

behandling  -->  sak : "sak_id id"

grunnlag  -->  behandling : behandling_id id
grunnlag_11_19  -->  grunnlag : grunnlag_id id
grunnlag_ufore  -->  grunnlag : grunnlag_id id
grunnlag_ufore  -->  grunnlag_11_19 : grunnlag_11_19_id id
jobb  -->  behandling : behandling_id id
jobb  -->  sak : sak_id id
jobb_historikk  -->  jobb : jobb_id id
motta_statistikk  -->  behandling : behandling_id id
motta_statistikk  -->  sak : sak_id id
sak  -->  person : person_id id
tilkjent_ytelse  -->  behandling : behandling_id id
tilkjent_ytelse_periode  -->  tilkjent_ytelse : tilkjent_ytelse_id id
vilkar  -->  vilkarsresultat : vilkarresult_id id
vilkarsperiode  -->  vilkar : vilkar_id id
vilkarsresultat  -->  behandling : behandling_id id

```

## Tester

Testdekningen er (per nå) høy, og det er brukt en blanding av mocking og TestContainers for å teste.
