# Lanseringsstrategi

Det er postmottaks ansvar å ivareta Kelvins lanseringsstrategi. Oppdaterte regler for hvilke saker som ikke skal til Kelvin finnes på [Confluence](https://confluence.adeo.no/display/PAAP/Unntakstilfeller+ved+lansering).

## Implementerte regler
Følgende regler er implementert i postmottak, og samtlige må være oppfylt for at en sak skal sendes til Kelvin:

|Regel| Beskrivelse                                                                  |
|---|------------------------------------------------------------------------------|
|Aldersregel| `18 <= søkers alder < 62`                                                    |
|ArenaSakRegel| Søker har ingen saker i Arena, uansett aktiv-status                          |
|GeografiskTilknytningRegel| Søkers geografisk tilknytning finnes i en liste over godkjente tilknytninger |

I tillegg overstyrer følgende regel de ovennevnte:

|KelvinSakRegel|Søker har en sak i Kelvin|
|---|---|

## Gradvis opptrapping
Kelvin lanseres først på et fåtalls kontorer i Vest-Viken og Innlandet. Vi bruker ikke enhet for å bestemme om en sak skal til Kelvin, men geografisk tilknytning. Det vil si at vi kan støtte fordeling basert på kommune, bydel og evt. utland.
Etter hvert som vi får erfaring med å sende saker til Kelvin, vil vi gradvis øke antall geografiske tilknytninger som støttes. Disse legges til i listen over godkjente tilknytninger i koden.

Lenger ut i løpet vil vi deaktivere aldersregelen. Når siste sak er ute av Arena, vil vi kunne sanere `Fordeler`-komponenten i postmottak i sin helhet, inkludert fordelingsregelene.

## Teknisk implementasjon
Reglene implementerer et sealed interface, og kjøres på hver enkelt journalpost som kommer inn. Resultatet av hver evaluering lagres i tabellen `REGEL_EVALUERING`.  `REGELSETT_RESULTAT`-tabellen inneholder resultatet av alle reglene for en journalpost, det vil si fagsystemet som journalposten sendes til. Det er uavklart hvor lenge vi skal ta vare på denne dataen.