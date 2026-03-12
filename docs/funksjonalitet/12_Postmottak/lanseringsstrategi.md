# Lanseringsstrategi

Det er postmottaks ansvar å ivareta Kelvins lanseringsstrategi. Oppdaterte regler for hvilke saker som ikke skal til
Kelvin finnes på [Confluence](https://confluence.adeo.no/display/PAAP/Unntakstilfeller+ved+lansering).
Journalpostene fordeles automatisk basert på et regelsett.

## Implementerte regler

Følgende regler er implementert i Postmottak, og samtlige må være oppfylt for at en sak skal sendes til Kelvin, utenom ArenaSakRegel. 

| Regel                   | Beskrivelse                                                                                                                                                              | Aktivert i testmiljø |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------:|
| Aldersregel             | `søkers alder >= 18`                                                                                                                                                |                   Nei |
| SignifikantArenaHistorikkRegel     | Søker har ingen signifikante vedtak i Arena på tema AAP. Se egen [dokumentasjon](https://confluence.adeo.no/spaces/PAAP/pages/780350479/Fordeling+av+saker+med+Arena-historikk)                    |                   Ja |
| ArenaSakregel         | Om personen eksisterer i AAP-Arena i det hele tatt                                                                                                                                        |                   Ja |
| Enhetsregel             | Enheten, som blir utledet basert på brukers geografiske tilknytning og eventuelt oppfølgingskontor fra sykefraværsoppfølgingen, finnes i en liste over godkjente enheter |                  Nei |
| ErIkkeReisestønadRegel  | Reisestønad skal alltid til Arena                                                                                                                                        |                   Ja |
| ErIkkeAnkeRegel         | Anke skal ikke behandles i Kelvin                                                                                                                                        |                   Ja |
| SøknadRegel             | Kun søknad kan føre til opprettelse av sak i Kelvin                                                                                                                      |                  Nei |
| ErIkkeGradertUføreRegel | Kelvin skal ikke behandle søknader hvor bruker er gradert ufør, da dette behandlers ulikt i Arena. Fjernes når Arena behandler saker likt på sin side.                   |                   Ja |
| ManueltOverstyrtTilArenaRegel | Manuelt fordele sak til Arena basert på ident                   |                   Ja |

I tillegg overstyrer følgende regler de ovennevnte:
| KelvinSakRegel | Søker som har en sak i Kelvin skal alltid til Kelvin |
|----------------|------------------------------------------------------|

## Gradvis opptrapping
Fordelingen av innkommende saker til Kelvin har blitt trappet opp over tid. 

Lenger ut i løpet vil vi deaktivere aldersregelen. Når siste sak er ute av Arena, vil vi kunne sanere `Fordeler`
-komponenten i postmottak i sin helhet, inkludert fordelingsregelene.

## Teknisk implementasjon

Reglene implementerer et sealed interface, og kjøres på hver enkelt journalpost som kommer inn. Resultatet av hver
evaluering lagres i tabellen `REGEL_EVALUERING`.  `REGELSETT_RESULTAT`-tabellen inneholder resultatet av alle reglene
for en journalpost, det vil si fagsystemet som journalposten sendes til. Det er uavklart hvor lenge vi skal ta vare på
disse dataene.
