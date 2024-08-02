# Teknisk beskrivelse

[Github](https://github.com/navikt/aap-tilgang)
[Swagger](https://aap-tilgang.intern.dev.nav.no/swagger-ui/index.html)
[Grafana](https://grafana.nav.cloud.nais.io/d/ddtbde3obr5kwe/tilgang?orgId=1)

Tilgang er en tjeneste for tilgangsstyring i AAP. Den fungerer som et policy decision point (PDP) som evaluerer tilgangsforespørsler fra andre tjenester (PEP) mot et sett med regler/policies. Tjenesten henter informasjon, som brukes som underlagsdata i regelevalueringen, fra PIP-tjenester.

```mermaid
sequenceDiagram
    autonumber
    PEP->>PDP: tilgang?
        box rgba(0, 0, 255, .05) Tilgang 
        participant PDP
        participant Redis
    end
    PDP->>Redis: sjekk cache for underlagsdata
    Redis-->>PDP: underlagsdata?

    alt Cache hit
    else Cache miss
        PDP->>PIP-tjenester: hent underlagsdata
        PIP-tjenester-->>PDP: underlagsdata
    end

    PDP->>PDP: evaluer forespørsel med underlagsdata mot regler
    PDP-->>PEP: ja/nei

```

## PIP-tjenester
### Interne integrasjoner
#### Behandlingsflyt

For å hente identer for en gitt sak.

Dokumentasjon: https://aap-sysdoc.ansatt.nav.no/funksjonalitet/Behandlingsflyt/teknisk

### Eksterne integrasjoner

#### PDL
For å hente adressebeskyttelse og geografisk tilknytning.

Dokumentasjon: https://pdl-docs.ansatt.nav.no/ekstern/index.html

#### MS Graph DB

For å hente AD-grupper som ikke er inkludert i token, deriblant ENHET- og GEO-roller.

#### Skjermingsløsningen
For å sjekke skjermede personer (egen ansatt).

Dokumentasjon: https://navikt.github.io/skjerming/index-intern.html
