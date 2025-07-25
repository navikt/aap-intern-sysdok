---
sidebar_position: 1
---

# Applikasjoner

Hensikten med de ulike løsningene Team AAP leverer, er å sikre kritisk funksjonalitet i dialog mellom Nav og innbyggere på ytelsen Arbeidsavklaringspenger (AAP), samt effektiv og lik behandling. Noen kontaktpunkter er til for å muliggjøre saksbehandling, andre er til for å gi god veiledning og informasjon til innbyggere.

## Komponent-diagram
Detaljer om de ulike komponentene i Team AAP sin løsning finner du i menyen til venstre.
```mermaid
graph TD
    subgraph Brukerflate 
    KA
    SK
    MA
    MK[Meldekort]
    end
KA[Kalkulator]
SK[Søknad] --> IS[Innsending]
IS --> PM[Postmottak]
PM --> FSP[fss-proxy]
MA[Mine AAP] --> IS
IS --> PDF
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
APIA[Arena oppslag]
APII[API Intern]
API[API Ekstern] --> APIA
AHP[Arena Hendelses-Proxy]
end
APII --> Behandlingsflyt
APII --> APIA
OP --> TS
```

