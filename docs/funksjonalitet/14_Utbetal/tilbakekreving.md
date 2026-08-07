# Tilbakekreving

Løsningen for tilbakekreving i AAP muliggjør visning og behandling i Kelvin mot NAV-intern tilbakeløsning.

## Saksbehandler-representasjon
AAP saksbehandler får se tilbakekrevingsoppgaver i Kelvin og kan åpne behandlingen i Tilbake via Åpne lenke fra oppgavelista i Kelvin.

### Kelvin UI
![Kelvin Oppgave UI](../../bilder/kelvin-oppgave-ui.png)

### Tilbake UI
![Tilbake UI](../../bilder/tilbake-ui.png)

## System-representasjon

### Komponentdiagram

```mermaid
flowchart RL

    subgraph Tilbakeløsningen
        TilbakeUI[familie-tilbake-frontend] --> Tilbake[familie-tilbake]
    end

    subgraph AAP
        Behandlingflyt -->|REST API| Oppgave
        Saksbehandling -->|REST API| Oppgave
        Behandlingflyt --> Behandlingsflyt-DB[(DB)]
        Oppgave --> Oppgave-DB[(DB)]
    end

    Tilbake --> |Kafka-topic<br>behandling_endret| Behandlingflyt
    Behandlingflyt -->  |Kafka-topic<br>fagsystem_info| Tilbake
```

### Data-representasjon

#### Datautveksling i integrasjon mellom Tilbake og Kelvin

##### kafka melding fra Tilbake til Kelvin: behandling_endret
```json
{
    "hendelsestype": "behandling_endret",
    "versjon": 1,
    "eksternFagsakId": "000000",
    "hendelseOpprettet": "2025-10-24T10:21:49.076434",
    "eksternBehandlingId": null,
    "sakOpprettet": "2025-10-24T10:21:49.064877",
    "varselSendt": null,
    "behandlingsstatus": "OPPRETTET", # TIL_FORHÅNDSVARSEL | TIL_BEHANDLING | AVSLUTTET
    "totaltFeilutbetaltBeløp": "2000.00",
    "saksbehandlingURL": "https://tilbakekreving.intern.nav.no/fagsystem/TS/fagsak/000000/behandling/99c195f6-716e-4dc0-a7ce-baddf5475e7a",
    "fullstendigPeriode": {
      "fom": "2021-01-01",
      "tom": "2021-01-01"
    }
}
```
##### kafka melding fra Tilbake til Kelvin: fagsysteminfo_behov
```json
{
  "hendelsestype": "fagsysteminfo_behov",
  "versjon": 1,
  "eksternFagsakId": "4UA79Qo",
  "kravgrunnlagReferanse": "EEio2tWRTS6BwG9FRfl6Zg==",
  "hendelseOpprettet": "2026-01-13T12:15:27.087202255"
  }
```
##### kafka melding fra Kelvin til Tilbake: fagsysteminfo_svar
```json
{
  "hendelsestype": "fagsysteminfo_svar",
  "versjon": 1,
  "eksternFagsakId": "123456",
  "hendelseOpprettet": "2025-01-13T12:30:45.00000",
  "mottaker": {
    "type": "PERSON",
    "ident": "32132132111"
  },
  "revurdering": {
    "behandlingId": "654321",
    "årsak": "NYE_OPPLYSNINGER",
    "årsakTilFeilutbetaling": "Bruker sluttet på tiltaket",
    "vedtaksdato": "2025-01-12",
    "utvidPerioder": [
      {
        "kravgrunnlagPeriode": {
          "fom": "2023-01-01",
          "tom": "2023-01-01"
        },
        "vedtaksperiode": {
          "fom": "2023-01-01",
          "tom": "2023-01-31"
        }
      }
    ]
  }
}
```

#### Behandlingsflyt-Database
```mermaid
erDiagram
    TILBAKEKREVINGSBEHANDLING {
        BIGINT ID
        BIGINT SAK_ID
        UUID TILBAKEKREVING_BEHANDLING_ID
        VARCHAR EKSTERN_FAGSAK_ID
        TIMESTAMP HENDELSE_OPPRETTET
        VARCHAR EKSTERN_BEHANDLING_ID
        TIMESTAMP SAK_OPPRETTET
        DATE VARSEL_SENDT
        VARCHAR BEHANDLINGSSTATUS
        NUMERIC TOTALT_FEILUTBETALT_BELOP
        VARCHAR TILBAKEKREVING_SAKSBEHANDLING_URL
        DATERANGE FULLSTENDIG_PERIODE
        BOOLEAN AKTIV
        VARCHAR VENTE_GRUNN
        DATE GJENOPPTAS
    }
    TILBAKEKREVINGHENDELSE {
        INT ID
        INT SAK_ID
        INT TILBAKEKREVING_BEHANDLING_ID
        INT EKSTERN_FAGSAK_ID
        DATETIME HENDELSE_OPPRETTET
        INT EKSTERN_BEHANDLING_ID
        DATETIME SAK_OPPRETTET
        DATETIME VARSEL_SENDT
        STRING BEHANDLINGSSTATUS
        DECIMAL TOTALT_FEILUTBETALT_BELOP
        STRING TILBAKEKREVING_SAKSBEHANDLING_URL
        STRING FULLSTENDIG_PERIODE
        INT VERSJON
        STRING VENTE_GRUNN
        DATETIME GJENOPPTAS
    }
```

#### Oppgave-Database
```mermaid
erDiagram
    OPPGAVE {
        UUID ID
        STRING SAKSNUMMER
        STRING BEHANDLING_REF
        STRING JOURNALPOST_ID
        TIMESTAMP BEHANDLING_OPPRETTET
        STRING AVKLARINGSBEHOV_TYPE
        STRING STATUS
        STRING RESERVERT_AV
        TIMESTAMP RESERVERT_TIDSPUNKT
        STRING OPPRETTET_AV
        TIMESTAMP OPPRETTET_TIDSPUNKT
        STRING ENDRET_AV
        TIMESTAMP ENDRET_TIDSPUNKT
        STRING BEHANDLINGSTYPE
        INT VERSJON
        STRING PERSON_IDENT
        STRING ENHET
        STRING OPPFOLGINGSENHET
        TIMESTAMP PAA_VENT_TIL
        STRING PAA_VENT_AARSAK
        STRING VEILEDER_ARBEID
        STRING AARSAKER_TIL_BEHANDLING
        STRING VENTE_BEGRUNNELSE
        BOOLEAN FORTROLIG_ADRESSE
        STRING RETUR_AARSAK
        STRING RETUR_BEGRUNNELSE
        STRING RETUR_AARSAKER
        STRING RETUR_RETURNERT_AV
        STRING VEILEDER_SYKDOM
        BOOLEAN ULESTE_DOKUMENTER
        STRING AARSAK_TIL_OPPRETTELSE
        STRING RESERVERT_AV_NAVN
        BOOLEAN ER_SKJERMET
        BOOLEAN UTLOEPT_VENTEFRIST
        STRING SISTE_PAA_VENT_AARSAK
        STRING SISTE_VENTE_BEGRUNNELSE
        STRING FORRIGE_KVALITETSSIKRER_IDENT
        STRING FORRIGE_KVALITETSSIKRER_NAVN
    }

    TILBAKEKREVING_OPPGAVE_VAR {
        UUID ID
        UUID OPPGAVE_ID
        STRING TILBAKEKREVING_URL
        DECIMAL BELOP
    }
```
