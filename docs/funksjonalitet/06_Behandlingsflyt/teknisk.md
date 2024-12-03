# Teknisk beskrivelse

Swagger-dokumentasjon: https://aap-behandlingsflyt.intern.dev.nav.no/swagger-ui/index.html

Grafana-dashboard: https://grafana.nav.cloud.nais.io/d/fdti727n7u6m8c/behandlingsflyt?orgId=1

## Kjøre lokalt

I IntelliJ, finn klassen `TestApp`, og kjør den derfra. Appen vil da kjøre på `localhost:8080`. Alternativt, for å unngå
å starte IntelliJ:

```
./gradlew runTestApp
```

i rotmappen.

Swagger-dokumentasjon blir tilgjengelig på http://localhost:8080/swagger-ui/index.html.
For å gjøre autentiserte kall trengs JWT-token fra "fake Azure AD" (startet i `Fakes`-klassen). "Fake AD" kjører
på `localhost:8081`, og du kan få token ved å kjøre

```
curl -s -XPOST http://localhost:8081/token  | jq -r '.access_token' | pbcopy
```

Nå kan API-kall gjøres i Swagger UI ved å trykke på "Authorize"-knappen og lime inn token. For å gjøre API-kall i
Swagger i dev må _on behalf of_-token genereres i Ida (men det har jeg aldri fått til).

## Tidslinjer/segmenter (TODO)

## Flytdiagram FlytOrkestrator

```mermaid
flowchart LR
    subgraph ForberedBehandling
        HB[Hent Behandling] --> HAV[HentAvklaringsbehov]
        HAV --> PV{På vent?}
        PV -- ja --> LAV
        PV -- nei --> OppdaterFaktaGrunnlag
        LAV[LøsAvklaringsbehovPåVent]
        LAV --> FPV{Fortsatt\npå vent?}
        FPV -- ja --> BO((Return))
        FPV -- nei --> TF[Tilbakefør til korrekt steg]
        TF --> OppdaterFaktaGrunnlag
        OppdaterFaktaGrunnlag --> ENDR{Endringer\n i faktagrunnlag?}
        ENDR -- ja --> Tilbakefør
        Tilbakefør --> BO
    end

    subgraph ProsesserBehandling
        HB2[Hent Behandling] --> HAV2[HentAvklaringsbehov]
        HAV2 --> PV2{På vent?}
        PV2 -- ja --> PVL[Løs avklaringspunkt med utløpt frist]
        PVL --> PV3{Fortsatt på vent?}
        PV3 -- ja --> BO2
        PV3 -- nei --> LøsGjeldendeSteg
        PV2 -- nei --> LøsGjeldendeSteg
        LøsGjeldendeSteg --> ERTBF{Er tilbakeføring?}
        ERTBF -- ja --> TF2[Tilbakefør]
        TF2 --> UtledNesteSteg
        ERTBF -- nei --> UtledNesteSteg
        UtledNesteSteg --> ASD{Kan fortsette?}
        ASD -- ja --> LøsGjeldendeSteg
        ASD -- nei --> BO2((Return))

    end
    ForberedBehandling --> ProsesserBehandling
```

## State-machine for StegOrkestrator

```mermaid
---
title: StegOrkestrator pr. 25. september 2024
---
stateDiagram-v2
    [*] --> START: [StegOrkestrator.utfør()]
    [*] --> TILBAKEFØRT: [StegOrkestrator.utførTilbakefør()]
    START --> OPPDATER_FAKTAGRUNNLAG: Fortsett
    OPPDATER_FAKTAGRUNNLAG --> UTFØRER: Fortsett
    UTFØRER --> [*]: TilbakeførtFraBeslutter
    UTFØRER --> [*]: TilbakeførtFraKvalitetssikrer
    UTFØRER --> AVKLARINGSPUNKT: FunnetAvklaringsbehov
    UTFØRER --> AVKLARINGSPUNKT: Fortsett
    AVKLARINGSPUNKT --> [*]: Stopp
    AVKLARINGSPUNKT --> AVSLUTTER: Fortsett
    AVSLUTTER --> [*]: Fortsett
    TILBAKEFØRT --> [*]: Fortsett
```
