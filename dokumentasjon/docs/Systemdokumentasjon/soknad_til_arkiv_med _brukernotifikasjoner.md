# Fra søknad til arkiv

``` mermaid
sequenceDiagram
    Soknad->>Soknad: Start soknad
    Soknad->>+Api: Hent fra baktjenester
    Api->>+Registertjenester: Henter data fra baktjenester
    Registertjenester->>-Api: Lever person og saksinformasjon
    Api->>-Soknad: Lever person og saksinformasjon
    Soknad->>+Mellomlagring: Mellomlagre soknad
    Soknad->>+Mellomlagring: Gjennoppta soknad
    Mellomlagring->>-Soknad: Lever mellomlagret
    Api->>+Midlertidig_dokumentlager: Last opp vedlegg
    Soknad->>+Api: Send inn soknad
    Api->>+Midlertidig_dokumentlager: ?? soknad
    Api->>+Pdfgen: Generer PDF
    Pdfgen->>-Api: Lever PDF
    Api->>+Arkiv: Arkiver journalpost
    Api->>+Minesider: Lag oppgave eller beskjed i mine sider
    Minesider->>brukernotifikasjon: Send ut ekstern notifikasjon
```
