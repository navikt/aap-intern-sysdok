# Teknisk beskrivelse

Grafana Kommer™️

## flyter
Dokumentinnhenting står ansvarlig for 3 deler:
* Bestilling av legeerklæring
* mottak av legeerklæring
* DokumentSøk

Grunnet feilmarginer i eksterne systemer vil mottak av legeerlæring være nødt til å lytte på både inkommende legeerklæringer og dialogmeldinger.

### Dialogmelding
Da leger teknisk sett kan svare på en bestilling ved å sende inn legeerklæring som vedlegg til en ny dialogmelding er vi nødt til å lytte på padm2.
Det er ingen garanti at dialogmeldingen vil være relevant og vi blir nødt til å ta noen forhåndsregler.
1. Dersom det eksisterer en bestilling på en lege erklæring på bruker som dialogmelding gjelder, vil vi journaleføre dialogmeldingen på sakane.
2. Dersom det ikke eksisterer bestilling, men bruker har en åpen AAP sak, vil dialogmeldingen bli midlertidig journalført på AAP, for manuell sjekk i postmottak.
3. Dersom hverken bestilling eller sak eksisterer, vil vi se bort fra dialogmeldingen.

```mermaid
---
title: Ny dialogmelding
---
sequenceDiagram
  participant p as padm2
  participant d as dokumentInnhenting
  participant k as kelvin
  participant s as saf
  activate p
  p->>d: nyDialogmelding(filter)
  deactivate p
  d->>d: sjekkBestilling
  activate s
  d-->>s: journalfør på bestilling
  d->>k: sjekkSak
  d-->>s: midlertidig Journalføring
```


### Elektronisk legeerklæring
*her kan du skrive henrik*

### DokumentSøk
Ved behandling av sak, 
