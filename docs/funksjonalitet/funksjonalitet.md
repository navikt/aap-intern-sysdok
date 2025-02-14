---
sidebar_position: 1
---

# Funksjonell beskrivelse

Hensikten med de ulike løsningene Team AAP leverer, er å sikre kritisk funksjonalitet i dialog mellom NAV og innbyggere på ytelsen Arbeidsavklaringspenger (AAP), samt effektiv og lik behandling.

Vårt fokus er å skape brukergevinster, og å gjøre brukerreisen helhetlig god.

Noen kontaktpunkter er til for å muliggjøre saksbehandling, andre er til for å gi god veiledning og informasjon til innbyggere.

## Komponent-diagram
Detaljer om de ulike komponentene i Team AAP sin løsning finner du i menyen til venstre.
```mermaid
graph TD
KA[Kalkulator]
SK[Søknad] --> IS[Innsending]
IS --> PM[Postmottak]
MA[Mine AAP] --> IS
IS --> PDF
MK[Meldekort]
PM --> Behandlingsflyt[Behandlingsflyt]
Behandlingsflyt --> OP[Oppgavestyring]
Behandlingsflyt <--> TS[Tilgang]
Behandlingsflyt <--> Dokumentinnhenting
Dokumentinnhenting --> BR
Ø[Utbetal]
Behandlingsflyt -.-> Ø
PM --> TS
PM --> OP
Behandlingsflyt --> BR[Brev]
Behandlingsflyt --> ST[Statistikk]
OP --> ST
PM --> APII
subgraph Datadeling
APIA[API Arena]
APII[API Intern]
AHP[Arena Hendelses-Proxy]
API[API Ekstern] --> APIA
end
APII --> Behandlingsflyt
APII --> APIA
OP --> TS
```

