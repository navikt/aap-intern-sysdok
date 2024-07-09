# Teknisk beskrivelse

Løsningen bygger på [NAIS](https://nais.io) som er kjøreplattform for Google Cloud.

| Del av løsning | Teknologi beskrivelse                                                 |
|----------------|-----------------------------------------------------------------------|
| Klient         | NEXT.js, Typescript                                                   |
| Baksystem      | Ktor og Kotlin                                                        |
| Infrastruktur  | Postgres-database for forretningslogikk og Redis for mellomlagring    |
| Kafka          | Hendelsesbasert kommunikasjon mellom systemer i NAV og feilhåndtering |
| Redis          | Mellomlagring av søknad og vedlegg                                    |

### Tekniske tjenester

Tekniske tjenester er integrasjoner mellom systemer/tjenester.

#### Tjenester som konsumeres av [aap-oppslag](https://github.com/navikt/aap-oppslag)

- **Innlogging** via [Id-porten](https://eid.difi.no/en/id-porten)
- **PDL** - Persondatatjeneste for NAV og Skatt
- **KRR** - Kontakt og reservasjonsregisteret

#### Tjenester som konsumeres av [aap-innsending](https://github.com/navikt/aap-innsending)

- **Arkivtjeneste** for opprettelse av ingående dokumenter i NAVS dokumentarkiv.
- **Microfrontend for min side** for [pålogget bruker på nav.no](https://nav.no)

Systemene tilbyr ingen eksterne tjenester, kun interne i dialog med hverandre.

#### Tjenester som konsumeres av [aap-mottak](https://github.com/navikt/aap-mottak)

**!! Tjenesten er under utvikling !!**

- **PDL** - Persondatatjeneste for NAV og Skatt: brukes for fordeling til riktig behandlende enhet.
- **NORG** - NAV Organisasjonsmaster: brukes for å fordele oppgaven til riktig enhet. Diskresjonskoder _fortrolig_ og _strengt fortrolig_ blir for eksempel behandlet av egen enhet.
- **SAK** - Generell sakssystem fra Arkiv: brukes for å knytte journalpost og oppgave til en journalpost.
- **Arkivtjeneste** - For oppslag i NAVS dokumentarkiv: brukes for å oppdattere informasjon tilknyttet saksbehandling og fordeling.
- **Egenansatt** - Tjeneste som avklarer om innsender er ansatt i NAV og skal behandles av egen ansatt.
- **Arena** - Tjeneste for å opprette AAP-sak og oppgave for behandling av søknad.

### Databasemodell i aap-innsending

Som figuren viser er modellen delt i 3:

- Håndtering av søknadslogikk og påkrevde vedlegg som er sendt inn eller mangler
- Håndtering av mellomlagring av søknad.
- håndterer beskjeder som skal sendes til bruker på min side.
