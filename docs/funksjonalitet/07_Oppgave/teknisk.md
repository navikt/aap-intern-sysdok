# Teknisk beskrivelse
[Github](https://github.com/navikt/aap-oppgave) | [Swagger](https://aap-oppgave.intern.dev.nav.no/swagger-ui/index.html)
### Kontekstdiagram

```mermaid
graph TD
    Behandlingsflyt -- Oppdater avklaringbehov status --> Oppgave((Oppgave))
    Postmottak -- Oppdater avklaringbehov status --> Oppgave
    Oppgave -- Lagrer oppgaver --> DB[(Database)]
    Oppgave -- Oppdaterer ved åpning og lukking av oppgaver --> Statistikk
    Saksbehandler-frontend -- Viser, plukker og administrerer oppgaver --> Oppgave
    Oppgave -- Sjekker tilgang til oppgave --> Tilgang
    Oppgave -- Henter geo - tilhørighet og skjerming --> PDL
    Oppgave -- Henter egen - ansatt --> NOM
    Oppgave -- Finn enhet geo - tilknytning --> NORG2
    Oppgave -- Hent enheter for innlogget bruker --> MsGraph
```

## Hvordan opprettes en oppgave?

Kelvin har to applikasjoner som tar i bruk oppgaveløsningen: [Postmottak](../12_Postmottak/teknisk.md)
og  [Behandlingsflyt](../06_Behandlingsflyt/teknisk.md).
Begge sender hendelser til oppgave når behandlingen stopper opp. Denne hendelsen inneholder informasjon om
avklaringsbehov med historikk. Oppgave verken oppretter eller løser avklaringsbehov, men har logikk for å avgjøre
hvorvidt en oppgave skal opprettes eller oppdateres gitt behandlingshistorikken.

## Hvordan er køer implementert?

Køer i Kelvins oppgaveløsning er implementert som et sett forhåndsdefinerte filtre på oppgaver. Disse filtrene er
lagret i databasen. På sikt skal det lages et grensesnitt for å opprette og vedlikeholde proprietære filtre.

Et filter kan filtrere oppgaver basert på avklaringsbehovkoder, behandlingstyper og enehter. Enhetsfilteret kan
inkludere eller ekskludere enheter. Eksempler på filtre er:

| Navn                         | Behandlingstyper                    | Avklaringsbehovkoder | Enheter                                                       |
|------------------------------|-------------------------------------|----------------------|---------------------------------------------------------------|
| Førstegangsbehandling kontor | Førstegangsbehandling               | 5003, 5004...        | INKLUDER ALLE, EKSKLUDER 4491, EKSKLUDER 4483, EKSKLUDER 4402 |
| NAY saksbehandler            | Førstegangsbehandling, Revurdrering | 5001, 5008...        | INKLUDER 4491                                                 |

```mermaid
erDiagram
    filter {
        bigint id PK
        varchar(100) navn
        varchar(100) beskrivelse
        boolean slettet
        timestamp(3) opprettet_tidspunkt
        timestamp(3) endret_tidspunkt
    }

    filter_avklaringsbehovtype {
        bigint id PK
        bigint filter_id FK
        varchar(4) avklaringsbehovtype
    }

    filter_behandlingstype {
        bigint id PK
        bigint filter_id FK
        varchar(40) behandlingstype
    }

    filter_enhet {
        bigint id PK
        bigint filter_id FK
        varchar(255) enhet "default 'ALLE'"
        varchar(10) filter_modus "default 'INKLUDER'"
    }

    filter 1 to many(1) filter_avklaringsbehovtype: ""
    filter 1 to many(1) filter_behandlingstype: ""
    filter 1 to many(1) filter_enhet: ""

```