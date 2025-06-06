# Teknisk beskrivelse

## Flyt mellom applikasjoner

```mermaid
flowchart
    sanity-brev -- oppdatere brev --> sanity-content-lake
    behandlingsflyt -- bestill brev --> brev
    dokumentinnhenting -- bestill brev --> brev
    brev -- brev --> brev-sanity-proxy
    brev-sanity-proxy -- innhold --> sanity-content-lake
    brev -- generer pdf --> saksbehandling-pdfgen
    brev -- journalfør brev --> dokarkiv
    brev -- distribuer journalpost --> dokdistfordeling
    brev -- hent journalpost --> saf
    brev -- hent personinfo --> pdl-api
    brev -- hent ansattinfo --> nom-api
    brev -- hent enhetinfo --> norg2
    sanity-content-lake[Sanity Content Lake]
```

| Applikasjon                                                                                           | Formål                                                                                                            |
|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| [brev](https://github.com/navikt/aap-brev)                                                            | Håndterer bestilling, journalføring og distribusjon av brev                                                       |
| [behandlingsflyt](../06_Behandlingsflyt/teknisk.md)                                                   | Bestiller alle brev til bruker gjennom brev-applikasjonen                                                         |
| [dokumentinnhenting](../13_Dokumentinnhenting/teknisk.md)                                             | Genererer, journalfører og ekspederer brev til behandler gjennom brev-applikasjonen                               |
| [sanity-brev](https://github.com/navikt/aap-sanity-brev)                                              | Editering av brev for redaktører(Sanity studio). Definerer typer for schemas og queries.                          |
| [brev-sanity-proxy](https://github.com/navikt/aap-brev-sanity-proxy/)                                 | Henter og fletter innhold fra Sanity. Bruker typer fra aap-sanity-brev. Mapper til et felles format for aap-brev. |
| [saksbehandling-pdfgen](https://github.com/navikt/aap-saksbehandling-pdfgen/)                         | Genererer PDF                                                                                                     |
| [dokarkiv](https://confluence.adeo.no/spaces/BOA/pages/387098101/Arkivering+i+fagarkivet)             | Arkivering i fagarkivet                                                                                           |
| [dokdistfordeling](https://confluence.adeo.no/spaces/BOA/pages/329252897/Dokumentdistribusjon+domene) | Distribusjon av journalposter                                                                                     |
| [saf](https://confluence.adeo.no/display/BOA/saf)                                                     | Henter informasjon om journalposter for validering                                                                |
| [pdl-api](https://pdl-docs.ansatt.nav.no/ekstern/index.html)                                          | Henter navn og adressebeskyttelse                                                                                 |
| [nom-api](https://navikt.github.io/nom/)                                                              | Henter navn og org-tilknytning på en ansatt                                                                       |
| [norg2](https://navikt.github.io/norg2/)                                                                      | Henter enhetsnummer, -navn og -type                                                                               |
| [Sanity Content Lake](https://aap-brev.ansatt.dev.nav.no/studio/structure)                            | Holder på alle tekster som er definert og publisert i Sanity studio. Her kan redaktør redigere teskter.           |

## Flyt i brev

```mermaid
stateDiagram-v2
    state "API: Bestill brev" as bestill_brev
    state "API: Oppdater brev" as oppdater_brev
    state "API: Forhåndsvis brev" as forhandsvis_brev
    state "API: Avbryt brev" as avbryt_brev
    state "API: Ferdigstill brev" as ferdigstill_brev
    state "Skal ferdigstille automatisk?" as skal_ferdigstille_automatisk
    state "Kan ferdigstille automatisk?" as kan_ferdigstille_automatisk
    state "Kan ferdigstille?" as kan_ferdigstille
    state "Valider" as valider
    state "Hent brevmal" as hent_brevmal
    state "Flett faktagrunnlag" as flett_faktagrunnlag
    state if_skal_ferdigstille_automatisk <<choice>>
    bestill_brev --> valider
    valider --> hent_brevmal
    hent_brevmal --> flett_faktagrunnlag
    flett_faktagrunnlag --> skal_ferdigstille_automatisk
    skal_ferdigstille_automatisk --> if_skal_ferdigstille_automatisk
    if_skal_ferdigstille_automatisk --> Stopp: nei
    if_skal_ferdigstille_automatisk --> kan_ferdigstille_automatisk: ja
    state if_kan_ferdigstille_automatisk <<choice>>
    kan_ferdigstille_automatisk --> if_kan_ferdigstille_automatisk
    if_kan_ferdigstille_automatisk --> Feil: nei
    if_kan_ferdigstille_automatisk --> prosesser_bestilling: ja
    state if_kan_ferdigstille <<choice>>
    ferdigstill_brev --> kan_ferdigstille
    kan_ferdigstille --> if_kan_ferdigstille
    if_kan_ferdigstille --> Feil: nei
    if_kan_ferdigstille --> prosesser_bestilling: ja
    state if_skal_ferdigstille_automatisk <<choice>>
    prosesser_bestilling: Prosesser bestilling
    state prosesser_bestilling {
        [*] --> JournalførBrevSteg
        JournalførBrevSteg --> TilknyttVedleggSteg
        TilknyttVedleggSteg --> FerdigstillJournalpostSteg
        FerdigstillJournalpostSteg --> DistribuerJournalpostSteg
        DistribuerJournalpostSteg --> [*]
        JournalførBrevSteg: Journalfør brev
        TilknyttVedleggSteg: Tilknytt vedlegg
        FerdigstillJournalpostSteg: Ferdigstill journalpost
        DistribuerJournalpostSteg: distribuer journalpost
    }
```
