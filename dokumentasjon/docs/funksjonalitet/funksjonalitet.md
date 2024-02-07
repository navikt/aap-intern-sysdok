---
sidebar_position: 1
---

# Funksjonalitet
Komponentene våres og koblingen mellom dem. 

```mermaid
graph TD

MA[[<a href='mine_aap'>Mine AAP</a>]] --> PM[[<a href='postmottak'>Postmottak</a>]]
PM --> VT[[<a href='vedtak'>Vedtak</a>]]
VT --> OP[[<a href='oppgavestyring'>Oppgavestyring</a>]]
PM --> OP
VT --> BR[[<a href='brev'>Brev</a>]]
VT --> ST[[<a href='statistikk'>Statistikk</a>]]
OP --> ST
```

