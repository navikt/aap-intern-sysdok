# Teknisk beskrivelse

Swagger-dokumentasjon: https://aap-behandlingsflyt.intern.dev.nav.no/swagger-ui/index.html

Grafana-dashboard: https://grafana.nav.cloud.nais.io/d/fdti727n7u6m8c/behandlingsflyt?orgId=1

Les også [readme](https://github.com/navikt/aap-behandlingsflyt)

## Tidslinjer/segmenter (TODO)

## FlytOrkestrator

Flytorkestratoren har ansvar for å drive flyten til en gitt behandling. Typen behandling styrer hvilke steg som skal
utføres.

Jobben `flyt.prosesserBehandling` sparker i gang henholdsvis forbered- og prosesser behandling.
FlytOrkestratoren kjører i en transaksjon. Savepoints settes underveis i flyten
(se [StegOrkestrator](#StegOrkestrator)), men kan også kjøres atomært, f.eks. meldekortbehandlingen.

### Forbered behandling

Har ansvar for å sette behandlingen i en oppdatert tilstand i form av å innhente opplysninger for stegene man allerede
har prosessert og vurdere om man er nødt til å behandle steget på nytt hvis det er oppdaterte opplysninger.

### Prosesser behandling

Har ansvar for å drive prosessen fremover, stoppe opp ved behov for besluttningsstøtte av et menneske og sørge for at at
stegene traverseres i den definerte rekkefølgen i flyten. Flytene defineres i typen behandlingen.
[StegOrkestratoren](#StegOrkestrator) kalles for det gjeldende steget.

### Diagrammer

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

## StegOrkestrator

Håndterer den definerte prosessen i et gitt steg, flytter behandlingen gjennom de forskjellige fasene internt i et
steg.

| Fase                   | Beskrivelse                                                                                                                                   | Savepoint |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|:---------:|
| START                  | Teknisk markør for at flyten har flyttet seg til et gitt steg                                                                                 |     ✅     |
| OPPDATER_FAKTAGRUNNLAG | Oppdaterer faktagrunnlag                                                                                                                      |     ✅     |
| UTFØRER                | Utfører forrettningslogikken i steget ved å kalle på stegets utfør-metode                                                                     |           |
| AVKLARINGSPUNKT        | Vurderer om maskinen har bedt om besluttningstøtte fra et menneske og stopper prosessen hvis det er et punkt som krever stopp i dette steget. |           |
| AVSLUTTER              | Teknisk markør for avslutting av steget                                                                                                       |           |

### State-machine for StegOrkestrator

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

## Informasjonskrav / Oppdater faktagrunnlag

Steg kan ha informasjonskrav. Et informasjonskrav har ansvar for å hente inn relevant informasjon og oppdatere
faktagrunnlaget. Dette skjer både i flytorkestratoren og i stegorkestratoren. I flytorkestratoren hentes
informasjonskrav for alle foregående steg, slik at behandlingen kan dras tilbake til riktig steg dersom faktagrunnlaget
har endret seg. I stegorkestratoren hentes informasjonskrav for det gjeldende steget.
Et steg kan ha flere informasjonskrav, men disse må være uavhengige av hverandre. Det vil si at faktagrunnlaget som er
oppdatert i ett informasjonskrav ikke kan brukes i oppdater-metoden til et annet.

Informasjonskravene oppdateres asynkront.

## Avklaringsbehov

Behandlingsflyt prøver å fullføre en behandling på egenhånd. Dersom et steg ikke kan fullføres automatisk, opprettes et
avklaringsbehov som stopper opp behandlingen. Steget vil ikke fullføres før behovet er blitt løst. Hvordan et
avklaringsbehov løses, avhenger av behovets <i>definisjon</i>.
Den finner man i enum-klassen `Definisjon`

Merk: `Avklaringsbehov` i koden er et spesifikt avklaringsbehov som er opprettet når flyten stopper opp. Den peker på en definisjon, men har også flere egenskaper som f.eks. hvilket steg det ble opprettet i, når det ble opprettet og hvem som opprettet det. Avklaringsbehovhistorikken brukes videre i [oppgavehåndtering](./07_Oppgave/teknisk.md).  

### Definisjon

| Egenskap        | Beskrivelse                                                                                                                                   | Eksempel: `AVKLAR_STUDENT`     |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| kode            | fire-sifret ekstern referanse                                                                                                                 | `5001`                         |
| type            | Hvordan behovet trigges                                                                                                                  | `MANUELT_PÅKREVD`              |
| løsesISteg      | Hvilket steg behovet løses i. Flere behov kan løses i samme steg, men et behov kan kun løses i ett steg. Flere steg kan opprette det samme behovet. | `StegType.AVKLAR_STUDENT`      |
| løsesAv         | Liste over roller som kan løse behovet. Brukes bl.a. til oppgavehåndtering og tilgangskontroll                                                | `Rolle.SAKSBEHANDLER_NASJONAL` |
| kreverToTrinn   | Hvorvidt beslutter skal ta stilling til løsningen av behovet                                                                                  | `true`                         |
| kvalitetssikres | Hvorvidt kvalitetssikrer skal ta stilling til løsningen av behovet                                                                            | `false`                        |
| defaultFrist    | Kun relevant for avklaringsbehov av type `VENTEPUNKT`                                                                                         | `null`                         |

NB: Definisjon skal ikke endres - dette kan brekke gamle og åpne behandlinger. Eventuelle endringer gjøres ved å opprette en ny definisjon med unik kode, og deprekere den gamle.


## DB-diagram for samordning-tabeller

![](../../bilder/samordning.png)
