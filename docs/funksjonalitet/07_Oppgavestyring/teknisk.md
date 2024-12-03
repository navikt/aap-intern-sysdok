# Teknisk beskrivelse

Swagger-dokumentasjon: https://aap-oppgavestyring.intern.dev.nav.no/swagger-ui/index.html

## Informasjonsflyt

```mermaid
---
title: Plukk oppgave
---
sequenceDiagram
  actor s as Saksbehandler
  participant o as Oppgavestyring
  participant t as Tilgang
  activate s
  activate o
  s->>o: hendtOppgaver(filter)
  o->>o: finnOppgaverForFilter
  activate t
  o->>t: filtrerOppgaver(Saksbehandler, oppgaveMetadata)
  t-->>o: svar(oppgaverSaksbehandlerKanBehandle)
  deactivate t
  o-->>s: svar(oppgaver)
  s->>o: velgOppgave
  o-->>s: redirectTilSaksbehandling
  deactivate o
  deactivate s
```

```mermaid
---
title: Opprett oppgave
---
sequenceDiagram
  participant b as Behandlingsflyt
  participant o as Oppgavestyring
  participant p as PDL
  activate b
  activate o
  b->>o: hendelse
  alt nytt avklaringsbehov
  o->>o: opprettOppgave
  o->>p: hentNavnForPersonNummer
  else ingen endring
  else avklaringsbehov lukket
  o->>o: lukkAvklaringsbehov
  end
```

## Logisk datamodell

```mermaid
classDiagram
  Oppgave o-- Utfører
  Oppgave o-- Tildelt
  class Oppgave {
    +String behandlingsreferanse
    +String saksnummer
    +Avklaringsbehovstatus status
    +Behandlingstype behandlingstype
    +Avklaringsbehovtype avklaringsbehovtype
    +String gjelderverdi
    +LocalDateTime avklaringsbehovOpprettetTidspunkt
    +LocalDateTime behandlingOpprettetTidspunkt
    +String personnummer
    +String personNavn
    +LocalDateTime tidsstempel
    +Utfører utfører
    +Tildelt tildelt
    +lukkOppgave() 
  }
```

## Fysisk datamodell

```mermaid
erDiagram
  OPPGAVE ||--o| UTFORER : blir_utfoert_av
  OPPGAVE ||--o| TILDELT : er_tildelt
  OPPGAVE ||--o| OPPGAVE_API_REF : har_referanse_i_oppgave_api
  OPPGAVE {
    bigserial id PK
    varchar(50) saksnummer
    varchar(50) behandlingsreferanse
    varchar(50) status
    varchar(50) avklaringsbehovtype
    varchar(50) gjelderverdi "ikke i bruk enda"
    varchar(50) personnummer
    varchar(255) personnavn
    timestamp(3) avklaringsbehov_opprettet_tidspunkt
    timestamp(3) behandling_opprettet_tidspunkt
    timestamp(3) tidsstempel
  }
  UTFORER {
    bigserial id PK
    bigint oppgave_id FK
    varchar(50) IDENT
    timestamp(3) tidsstempel
  }
  TILDELT {
    bigserial id PK
    bigint oppgave_id FK, UK
    varchar(50) ident
    timestamp(3) tidsstempel
  }
  OPPGAVE_API_REF {
    bigint oppgave_id PK, FK
    bigint oppgave_api_id UK
  }
  OPPGAVE_FILTER ||--o{ FILTER_TILDELT : tildelt
  OPPGAVE_FILTER {
    bigserial id PK
    varchar(50) tittel
    varchar(255) beskrivelse
    text filter_json
    timestamp(3) opprettet_tid
    varchar(7) opprettet_av "Navident"  
  }
  FILTER_TILDELT {
    bigserial id PK
    bigint oppgave_filter_id FK
    varchar(7) navident
    boolean hovedfilter
  }
```

`OPPGAVE_API_REF`-tabellen er ikke tatt i bruk, da det er usikkert om vi skal integrere mot Gosys
