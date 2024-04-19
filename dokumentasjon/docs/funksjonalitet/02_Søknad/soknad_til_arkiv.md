# Flyt fra søknad til arkiv, Mine AAP og Min side

```mermaid
sequenceDiagram
    Soknad->>Soknad: Start soknad
    Soknad->>+Oppslag: Hent søknadsdata fra baktjenester
    Oppslag->>+Registertjenester: Henter data fra baktjenester
    Registertjenester->>-Oppslag: Lever person og saksinformasjon
    Oppslag->>-Soknad: Lever person og saksinformasjon
    Soknad->>+Innsending: Mellomlagre soknad
    Innsending->>Innsending: Mellomlagre i redis
    Soknad->>+Innsending: Gjennoppta soknad
    Innsending->>-Soknad: Lever mellomlagret søknad
    Innsending->>Innsending: Last opp vedlegg
    Soknad->>+Innsending: Send inn soknad
    Innsending->>+Pdfgen: Generer PDF
    Pdfgen->>-Innsending: Lever PDF
    Innsending->>+Arkiv: Arkiver søknad og vedlegg som pdfa og søknad.json
    Innsending->>Innsending: Slett mellomlagret søknad og data fra Redis
    Innsending->>+Minesider: Lag oppgave eller beskjed i mine sider
    Minesider->>Micro-frontend: Vis saksstatus
```
