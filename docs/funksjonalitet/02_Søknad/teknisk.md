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

#### Tjenester som konsumeres av [postmottak-backend](https://github.com/navikt/postmottak-backend)

**!! Tjenesten er under utvikling !!**

- **Dokarkiv** - For oppslag i NAVS dokumentarkiv: brukes for å oppdatere informasjon tilknyttet saksbehandling og fordeling.
- **aap-tilgang** - Tjeneste for å sjekke NAV-ansatts tilgang til aap-saker.

### Databasemodell i aap-innsending

Som figuren viser er modellen delt i 3:

- Håndtering av søknadslogikk og påkrevde vedlegg som er sendt inn eller mangler
- Håndtering av mellomlagring av søknad.
- håndterer beskjeder som skal sendes til bruker på min side.
