# Tilgang-plugin

Tilgang-pluginen er en http-interceptor som kaller tilgang-tjenesten etter autentisering. Den kan installeres på en
route for å autorisere endepunkt basert på tilgang til sak, tilgang til behandling, tilgang til rolle, tilgang til
journalpost, eller basert på godkjente applikasjoner (azp). 

Den håndterer både obo-token og client-credentials-token.

Pluginen gir 403 ved mangelende tilgang.

Se utfyllende dokumentasjon [på github](https://github.com/navikt/aap-tilgang/blob/main/plugin/README.md)

## Hvordan installere

Tilgang-pluginen kaller tilgang-tjenesten. Før man kan ta i bruk, må man derfor legge til påkrevde config-verdier:

    - name: INTEGRASJON_TILGANG_URL
      value: http://tilgang
    - name: INTEGRASJON_TILGANG_SCOPE
      value: api://dev-gcp.aap.tilgang/.default

Husk også å legge til tilgang i outbound rules:

    accessPolicy:
        outbound:
            rules:
              - application: tilgang

I moduler der pluginen brukes:

    api("no.nav.aap.tilgang:plugin:$tilgangVersjon")

I moduler der pluginen ikke blir brukt direkte, men der man må implementere interfaces som pluginen eksponerer:

    api("no.nav.aap.tilgang:api-kontrakt:$tilgangVersjon")

