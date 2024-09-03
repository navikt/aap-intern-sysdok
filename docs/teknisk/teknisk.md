---
sidebar_position: 1
---

# Teknisk beskrivelse

## Repoer

| Funskjonsområde  | Repo                                                            | Kort beskrivelse                                                                                                                                                                                                               |
|------------------|-----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Innbygger nav.no | [Søknad](https://github.com/navikt/aap-soknad)                  | Søknad om arbeidsavklaringspenger for innlogget bruker.                                                                                                                                                                        |
| Innbygger nav.no | [Mine AAP](https://github.com/navikt/aap-innsyn-dittnav)        | Innsysnløsning og landingsside for innlogget bruker.                                                                                                                                                                           |
| Innbygger nav.no | [Innsending](https://github.com/navikt/aap-innsending)          | Backend for innsending av digitale søknader og ettersendelser.                                                                                                                                                                 |
| Innbygger nav.no | [Oppslag](https://github.com/navikt/aap-oppslag)                | Backend for Mine AAP og innsending som slår opp mot registertjenester.                                                                                                                                                         |
| Innbygger nav.no | [Kalkulator](https://github.com/navikt/aap-kalkulator-frontend) | Uinlogget løsning for innbyggere som skal beregne hva de får i støtte.                                                                                                                                                         |
| Innbygger nav.no | [Pdfgen](https://github.com/navikt/aap-pdfgen)                  | Backend applikasjon som konverteer søknad og bilde-vedlegg til PDFA.                                                                                                                                                           |
| Deling av data   | [AAP-api](https://github.com/navikt/aap-api)                    | AAP-API tilbyr AAP-data til eksterne konsumenter som enten har hjemmel til å hente AAP-data eller et samtykke fra bruker.                                                                                                      |
| Deling av data   | [AAP-api-intern](https://github.com/navikt/aap-api-intern)      | AAP-API Intern tilbyr AAP-data til interne konsumenter i NAV.                                                                                                                                                                  |
| Deling av data   | [AAP-arenaoppslag](https://github.com/navikt/aap-arenaoppslag)  | AAP-arenaoppslag tilbyr historiske data fra Arena til AAP-API.                                                                                                                                                                 |
| Postmottak       | [AAP-mottak](https://github.com/navikt/aap-mottak)              | AAP-mottak skal erstatte jfr-manuell og jfr-arena for alle inngående dokumenter (journalposter) på tema AAP og håndtere oppgave opprettelse på riktig NAV-enhet koblet til riktig mottaker system. (gosys, arena eller Kelvin) |
| Statistikk       | [AAP Statistikk](https://github.com/navikt/aap-statistikk)      | Statistikk for etterlevelseskrav.                                                                                                                                                                                              |
| Tilgangsstyring  | [AAP Tilgangsstyring](https://github.com/navikt/aap-tilgang)    | Tilgangsstyring                                                                                                                                                                                                                |


| Del av løsning | Teknologi beskrivelse                                                 |
|----------------|-----------------------------------------------------------------------|
| Klient         | NEXT.js, React, Typescript                                            |
| Baksystem      | Ktor og Kotlin                                                        |
| Infrastruktur  | Postgres-database for forretningslogikk                               |
| Kafka          | Hendelsesbasert kommunikasjon mellom systemer i NAV og feilhåndtering |
| Redis          | Mellomlagring av søknad og vedlegg                                    |

