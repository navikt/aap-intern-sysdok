# Teknisk beskrivelse

Postmottak er inngangsportalen for alle dokumenter, digitale eller fysiske, som skal til AAP.

Følgende applikasjoner som Team AAP forvalter utgjør til sammen postmottak:

| App                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| aap-postmottak-backend | [Github](https://github.com/navikt/aap-postmottak-backend) \| [Swagger](https://aap-postmottak-backend.intern.dev.nav.no/swagger-ui/index.html) \| [Grafana - Postmottak](https://grafana.nav.cloud.nais.io/d/fdyxzbonzgidcc/postmottak?orgId=1&from=now-1h&to=now&timezone=browser) \| [Grafana - Kafka Streams](https://grafana.nav.cloud.nais.io/d/PRwEuOJ4k/aap-kafka-streams?orgId=1&from=now-6h&to=now&var-app=dokumentinnhenting&var-cluster=000000020) |
| aap-saksbehandling         | [Github](https://github.com/navikt/aap-saksbehandling) \| [Frontend](https://kelvin.ansatt.dev.nav.no/postmottak/)                                                                                                                                                                                                                                                                                                                                                    |
| aap-fss-proxy          | [Github](https://github.com/navikt/aap-fss-proxy) \| [Swagger](https://aap-fss-proxy.intern.dev.nav.no/swagger-ui/index.html)                                                                                                                                                                                                                                                                                                                                  |

## Overordnet arkitektur

Nedenfor vises en forenklet skisse over komponentene i Postmottak.

```mermaid
flowchart LR
    kafka@{shape: das, label: Kafka} --> fordeler
    subgraph Postmottak backend
        fordeler[Fordeler] --> arenaVideresender[Arena videresender]
        fordeler --> kelvinVideresender[Kelvin videresender]
    end
    arenaVideresender --aap-fss-proxy--> arena[Arena]
    arenaVideresender --> Gosys
    kelvinVideresender --> behandlingsflyt[Kelvin]
    frontend[Postmottak frontend] --> kelvinVideresender
```

| Komponent           | Beskrivelse                                                                                                                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Fordeler            | Postmottak har en egen komponent for fordeling av dokumenter. Denne komponenten tar imot dokumenter fra Kafka, og sender de videre til riktig system basert på regler i henhold til lanseringsstrategi. |
| Arena videresender  | Denne komponenten erstatter gamle KRUT, bestående av jfr-arena og jfr-manuell, for tema AAP. Den håndterer journalføring og oppgaveopprettelse for de dokumentene som skal til Arena.                   |
| Kelvin videresender | Dette er det nye postmottaket for Kelvin. Her håndteres journalføring, temaavklaring, kategorisering og digitalisering av dokumenter, samt videresending til Behandlingsflyt.                           

Fordeleren og Arena videresender skal fjernes når AAP er helt ute av Arena.

### Flyt og steg

Postmottak bruker mange av de samme konseptene som i [Behandlingsflyt](../06_Behandlingsflyt/teknisk.md) inkludert flyt-
og stegorkestrator.

Postmottaks flyt består av to delflyter. Disse er funksjonelt beskrevet [her](./funksjonell.md#kelvin-dokumentflyt).
Teknisk ser de slik ut:

```mermaid
---
title: Journalføringsflyt
---
flowchart LR
    start((Start)) --> 
    AvklarTemaSteg -->
AvklarSakSteg -->
SettFagsakSteg -->
JournalføringSteg-->
VideresendSteg -->
avslutt(((Avslutt)))
VideresendSteg --> dokflyt(((Send til dokumentflyt)))
```

```mermaid
---
title: Dokumentflyt
---
flowchart LR
    start((Start)) --> 
    KategoriserDokumentSteg -->
DigitaliserDokumentSteg -->
OverleverTilFagsystemSteg -->
avslutt(((Avslutt)))

```

### Integrasjoner

```mermaid
flowchart LR
    post[Postmottak backend]
    kafka[Kafka]
    ja[Joark/Saf]
    ar[Arena]
    be[Behandling]
    op[Oppgave]
    ts[Tilgang]
    proxy[AAP fss proxy]
    api[AAP api intern]
    pdl[PDL]
    norg[norg]
    gosys[Gosys]
    frontend[Postmottak frontend]
    post -->|Hent journalpost fra topic| kafka
    post -->|Hent saksnummer| be
    post -->|Send strukturert dokument| be
    post -->|Ferdigstill journalpost| ja
    post -->|Opprett/lukk oppgave| op
    post -->|Sjekk saksbehandlers tilgang| ts
    post --> proxy
    proxy -->|Send til Arena| ar
    post --> api
    api -->|Hent saker i Arena| ar
    post -->|Hent persondata| pdl
    post -->|" Finn enhet (ikke Kelvin) "| norg
    post -->|" Opprett/lukk oppgave "| gosys
    frontend --> post


```

### Jobboversikt

Postmottak tar i motor for jobbhåndtering fra [felleskomponenter](../../teknisk/felles_komponenter.md#motor).
Flytdiagrammet viser hvilke jobber som trigger hverandre. Eksterne triggere (typisk api-kall) er ikke med i diagrammet.

```mermaid
flowchart
    start((Kafka Streams)) -- Innkommende journalpost --> temaDes{Har tema blitt endret fra AAP?}
    temaDes -->|Ja| prosesser[ProsesserBehandlingJobbUtfører]
    temaDes -- Nei --> fordeler[FordelingsRegelJobbUtfører]
    fordelerDes{Skal til Arena?} -- Ja --> legeerklæringDes
    fordelerDes -- Nei --> prosesser
    subgraph Motor
        fordelingVidersend[FordelingVideresendJobbUtfører] --> fordelerDes
        fordeler --> fordelingVidersend
        subgraph ArenaVidersender
            legeerklæringDes{Er legeerklæring?}
            legeerklæringDes -- Nei --> søknad{Er søknad?}
            søknad -- Nei --> ettersendelse{Er ettersendelse?}
            ettersendelse -- Ja --> arenaAuto[AutomatiskJournalføringJobbUtfører]
            ettersendelse -- Nei --> arenaManuell[ManuellJournalføringJobbUtfører]
            søknad -- Ja --> søknadJobb[SendSøknadTilArenaJobbUtfører]
            søknadJobb --> sakDes{Har aktiv sak i Arena?}
            sakDes -- Ja --> arenaAuto
            sakDes -- Nei --> arenaManuell

        end
        subgraph KelvinVideresender
            prosesser --> stoppet[StoppetHendelseJobbUtfører]
            gjenoppta[GjenopptaBehandlingJobb] -- 0 0 7 * * * --> gjenoppta
        end
    end


```

### Andre diagrammer

Flyten her er lett forenklet i at oppgaver åpnes og lukkes for hvert avklaringsbehov med tilhørende kall til Tilgang,
men for saksbehandler vil dette oppleves sømløst.

```mermaid
---
 title: Ustrukturert dokument som skal digitaliseres, og skal til Behandlingsflyt
---
sequenceDiagram
    autonumber
    actor Saksbehandler
    participant Joark
    participant Postmottak
    participant Behandlingsflyt
    participant Oppgave
    participant Tilgang
    Joark ->> Postmottak: Ny journalpost på tema AAP
    Postmottak ->> Oppgave: Opprett oppgave
    Saksbehandler ->> Oppgave: Plukk oppgave
    Postmottak ->> Tilgang: Kan saksbehandler løse oppgave
    Saksbehandler ->> Postmottak: Avklar tema
    Saksbehandler ->> Postmottak: Avklar sak
    Saksbehandler ->> Postmottak: Avklar kategori
    Saksbehandler ->> Postmottak: Digitaliser dokument
    Postmottak ->> Oppgave: Lukk oppgave
    Postmottak ->> Behandlingsflyt: Strukturert dokument

```
