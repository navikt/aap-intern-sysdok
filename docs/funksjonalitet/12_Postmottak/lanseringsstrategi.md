# Lanseringsstrategi

Det er postmottaks ansvar å ivareta Kelvins lanseringsstrategi. Oppdaterte regler for hvilke saker som ikke skal til Kelvin finnes på [Confluence](https://confluence.adeo.no/display/PAAP/Unntakstilfeller+ved+lansering).
Journalpostene fordeles automatisk basert på et regelsett.

## Implementerte regler
Før lansering har vi en overstyrende regel som sender alle saker til Arena:
|KunArenaRegel|Returnerer alltid false|
|---|---|

Når vi skal begynne å rulle ut saker til Kelvin, aktiverer vi lanseringsreglene.
Følgende regler er implementert i postmottak, og samtlige må være oppfylt for at en sak skal sendes til Kelvin:

|Regel| Beskrivelse                                                                |Aktivert i testmiljø|
|---|------------------------------------------------------------------------------|-----------:|
|Aldersregel| `24 <= søkers alder < 60`                                                    | Ja |
|ArenaHistorikkRegel| Søker har ingen vedtak i Arena på tema AAP, uansett aktiv-status. Denne skal etterhvert utvides til å tillate 52 uker gamle saker (ikke implementert) | Ja |
|Enhetsregel| Enheten, som blir utledet basert på brukers geografiske tilknytning og eventuelt oppfølgingskontor fra sykefraværsoppfølgingen, finnes i en liste over godkjente enheter  | Nei |
|MaksAntallPersonerIKelvinRegel|Kun et gitt antall personer skal ha saker i Kelvin. Dette tallet kan økes fortløpende.| Nei |
|ErIkkeReisestønadRegel|Reisestønad skal alltid til Arena| Ja |
|ErIkkeAnkeRegel|Anke skal ikke behandles i Kelvin| Ja |
|SøknadRegel|Kun søknad kan føre til opprettelse av sak i Kelvin | Nei |

I tillegg overstyrer følgende regler de ovennevnte:
|KelvinSakRegel|Søker som har en sak i Kelvin skal alltid til Kelvin|
|---|---|

## Gradvis opptrapping
Kelvin lanseres først på et fåtalls kontorer i Vest-Viken og Innlandet. Vi bruker ikke enhet for å bestemme om en sak skal til Kelvin, men geografisk tilknytning. Det vil si at vi kan støtte fordeling basert på kommune, bydel og evt. utland.
Etter hvert som vi får erfaring med å sende saker til Kelvin, vil vi gradvis øke antall geografiske tilknytninger som støttes. Disse legges til i listen over godkjente tilknytninger i koden.

Lenger ut i løpet vil vi deaktivere aldersregelen. Når siste sak er ute av Arena, vil vi kunne sanere `Fordeler`-komponenten i postmottak i sin helhet, inkludert fordelingsregelene.

## Teknisk implementasjon
Reglene implementerer et sealed interface, og kjøres på hver enkelt journalpost som kommer inn. Resultatet av hver evaluering lagres i tabellen `REGEL_EVALUERING`.  `REGELSETT_RESULTAT`-tabellen inneholder resultatet av alle reglene for en journalpost, det vil si fagsystemet som journalposten sendes til. Det er uavklart hvor lenge vi skal ta vare på denne dataen.
