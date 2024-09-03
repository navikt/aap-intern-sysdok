# Felleskomponenter

Vi har dratt ut noe felles funksjonalitet til biblioteker, som vi har i repoet https://github.com/navikt/aap-kelvin-komponenter .

## Motor

Funksjonalitet for å kjøre asynkrone jobber basert på implementasjoner av `JobbUtfører`-interfacet.

Krever at tabellene `JOBB` og `JOBB_HISTORIKK` er opprettet, se [her](https://github.com/navikt/aap-kelvin-komponenter/blob/main/motor/src/test/resources/flyway/V0.1__modell.sql).

TODO: flyt-diagram av logikk

## dbconnect

Wrapper rundt `javax.sql`, med funksjonalitet for å sikre transaksjonshåndtering.
