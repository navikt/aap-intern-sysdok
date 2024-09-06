# Felleskomponenter

Vi har dratt ut noe felles funksjonalitet til biblioteker, som vi har i repoet https://github.com/navikt/aap-kelvin-komponenter .

## Avhengigheter mellom pakker

For øyeblikket lastes ikke transitive avhengigheter ned pakker ned (f.eks om man er interessert i `motor`).


```mermaid
flowchart LR
    motor --> dbconnect
    motor -.-> dbtest
    motor-api --> motor
    dbconnect -.-> dbtest
    dbmigrering --> infrastructure
    httpklient --> infrastructure
```

## Motor

Funksjonalitet for å kjøre asynkrone jobber basert på implementasjoner av `JobbUtfører`-interfacet.

Krever at tabellene `JOBB` og `JOBB_HISTORIKK` er opprettet, se [her](https://github.com/navikt/aap-kelvin-komponenter/blob/main/motor/src/test/resources/flyway/V0.1__modell.sql).

TODO: flyt-diagram av logikk

## dbconnect

Wrapper rundt `javax.sql`, med funksjonalitet for å sikre transaksjonshåndtering.
