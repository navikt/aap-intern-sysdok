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

## App-arkitektur

Overordnet skisse av arkitektur:

```mermaid
graph LR
BB[Behandlingsflyt]
OPPG[OppgaveStyring]

subgraph StatistikkApp
api --> service
service --> db
end

BB -. avgi statistikk .-> api
OPPG -. (ikke implementert) .-> api
db --> B[(Postgres)]
db --> C[(BigQuery)]
```

Ideen med å ha både en Postgres-database og et BigQuery-datasett, er at vi "eier" Postgres-databasen, og vi tenker på BigQuery-datasettet som "for eksterne", og i den forstand bør det være stabilt og ikke endre skjema veldig ofte. Det gir oss også mulighet til å implementere for eksempel produksjonsstyring uten å involvere BigQuery.

Per nå har man prøvd å være streng med "lag-grenser". Dette innebærer å skille på DTO-er fra forskjellige kilder, og i noen tilfeller vil det føles som mye konvertering mellom objekter.


## Tester

Testdekningen er (per nå) høy, og det er brukt en blanding av mocking og TestContainers for å teste.
