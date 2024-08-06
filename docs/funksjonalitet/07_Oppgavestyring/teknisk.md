# Teknisk beskrivelse

Swagger-dokumentasjon: https://aap-oppgavestyring.intern.dev.nav.no/swagger-ui/index.html


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
    varchar(50) gjelderverdi
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
    varchar(7) opprettet_av "Nav ident"  
  }
  FILTER_TILDELT {
    bigserial id PK
    bigint oppgave_filter_id FK
    varchar(7) navident
    boolean hovedfilter
  }
```

`OPPGAVE_API_REF`-tabellen er ikke tatt i bruk, da det er usikkert om vi skal integrere mot Gosys
