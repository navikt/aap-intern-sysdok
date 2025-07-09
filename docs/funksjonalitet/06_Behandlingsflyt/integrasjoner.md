# Integrasjoner

## Integrasjoner med interne apper

### Utgående

| App                                                 | Beskrivelse                                                                                                                |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [Statistikk](../Statistikk/teknisk)                 | Avgir statistikk på behandling underveis (ved behandlingsstopp) og avsluttet behandling for statistikkformål               |
| [Tilgang](../Tilgang/teknisk)                       | Inneholder logikk for å avgjøre om saksbehandlere har rett til forskjellige operasjoner på forskjellige saker/behandlinger |
| [Brev](../Brev/teknisk)                             |                                                                                                                            |
| [Dokumentinnhenting](../Dokumentinnhenting/teknisk) | Utføres bestiller av dialogmeldinger via ISYFO, samt oppslag av leger.                                                     |
| [Oppgave](..Oppgave/teknisk)                        | Sender hendelser til Kelvins oppgaveløsning                                                                                |
| [Meldekort](../Meldekort/teknisk)                   | Sender informasjon om blant annet meldeplikt, meldeperioder og opplysningsbehov                                            |

### Innkommende

| App                                                 | Beskrivelse                                                                              |
|-----------------------------------------------------|------------------------------------------------------------------------------------------|
| Saksbehandling                                      | Behandlingsflyt sin frontend                                                             |
| [Brev](../Brev/teknisk)                             |                                                                                          |
| [Dokumentinnhenting](../Dokumentinnhenting/teknisk) | Statusinformasjon fra aktive dialogmeldinger kan trigge flytlogikk, som å ta sak av vent |
| Paw-patrol                                          |                                                                                          |
| [Postmottak](../Postmottak/teknisk)                 | Journalposter går via Postmottak inn til Behandlingsflyt                                 |

## Integrasjoner med eksterne team

| App                            | Team | Dokumentasjon                                                                                                                                         | Kommentar                                                                                                                   |
|--------------------------------|------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| PDL                            |      | [Dok](https://pdl-docs.ansatt.nav.no/ekstern/index.html)                                                                                              |                                                                                                                             |                                                                                                                         
| SAF                            |      | [Dok](https://confluence.adeo.no/display/BOA/saf)                                                                                                     | SAF (sak- og arkiv-fasade) tilbyr søk mot fagarkivet (Joark/dokarkiv) og sørger for korrekt tilgangsstyring av arkivdataene |
| Yrkesskade-saker               |      | [Github](https://github.com/navikt/yrkesskade/tree/main/apps/saker) [Swagger](https://yrkesskade-saker.intern.dev.nav.no/swagger-ui/index.html)       |                                                                                                                             |
| Institusjonsoppholdsregisteret |      | [Github](https://github.com/navikt/institusjon)                                                                                                       | Noens eksempel kall- og respons [på Confluence](https://confluence.adeo.no/x/yY59HQ)                                        |
| Pensjon Popp: Inntekt          |      | [Github](https://github.com/navikt/popp/tree/main?tab=readme-ov-file) [Swagger](https://pensjon-popp-q2.dev.intern.nav.no/popp/swagger-ui/index.html) |                                                                                                                             |                                             
| PESYS (pensjon-pen)            |      |                                                                                                                                                       | Per i dag (19-07-24) ser det ikke ut til at integrasjonen er fullført.                                                      |                                                  
| MEDL                           |      | [Github](https://github.com/navikt/medlemskap-medl)  [Swagger](https://medlemskap-medl-api.dev.intern.nav.no/swagger-ui/index.html#/)                 |                                                                                                                             |
