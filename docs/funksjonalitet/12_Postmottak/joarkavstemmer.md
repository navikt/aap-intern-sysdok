# Joarkavstemmer

Vi har en nattlig jobb som følger med på om journalføring skjer innen rimelig tid. Tidligere var det Team Dokumenthåndtering sitt "doksikkerhetsnett" som hadde ansvar for dette. Vi har prøvd å bevare samme logikk, se [Confluence](https://confluence.adeo.no/spaces/BOA/pages/366859456/doksikkerhetsnett).



```mermaid

flowchart TD
    finn(Finn ubehandlede journalposter eldre enn 5 dager)
    forhver(Loop: For hver journalpost)

    finn --> forhver
    subgraph loop
    hentregler(Hent tidligere regelresultat)
    hentgosysoppgaver(Finn eksisterende Gosys-oppgaver for denne journalposten)
    forhver --> hentregler
    forhver --> hentgosysoppgaver
    finnesoppgave{Ikke tidligere evaluert i Postmottak, men finnes oppgave i Gosys}
    eldreennkelvin{Ingen evaluering funnet og journalposten er eldre enn Kelvin, april 2025}
    
    hentregler --> finnesoppgave
    hentgosysoppgaver --> finnesoppgave
    
    ikkeeldreennkelviningeneval{Nyere enn Kelvin, men fant ikke noen evaluering.}
    gikktilkelvin{Fant evaluering. Skal den ha gått til Kelvin?}
    
    endloop(Ferdig)
    
    gikktilarenaogfinnesoppgave{"Journalposten gikk til Arena. Finnes det oppgaver på denne?"}
    prøvopprettoppgave{Prøv og opprett journalføringsoppgave. Hvis det feiler, opprett på nytt uten enhet og tema. Hvis det feiler igjen, opprett fordelingsoppgave. Hvis det feiler igjen, log warning.  }
    
    subgraph errorfordel [Log error og opprett fordelingsoppgave]
        logerror(Log error - varsles på Slack.)
        opprettfordelingsoppgave(Opprett fordelingoppgave i Gosys.)
        logerror --> opprettfordelingsoppgave
    end
    
    subgraph error [Log error]
        logerror2(Log error - varsles på Slack.)
    end
    
    
    eldreennkelvin -- "NEI" --> ikkeeldreennkelviningeneval
    ikkeeldreennkelviningeneval -- "JA: Dette burde ikke ha skjedd. Alle journalposter skal gjennom postmottak. Opprett fordelingsoppgave." --> errorfordel
    finnesoppgave -- "NEI" --> eldreennkelvin
    eldreennkelvin -- "JA: Log info." --> endloop
    ikkeeldreennkelviningeneval -- "NEI" --> gikktilkelvin
    finnesoppgave -- "JA: Oppgave finnes, ferdig" --> endloop
    gikktilkelvin -- "JA" --> error
    gikktilkelvin -- "NEI" --> gikktilarenaogfinnesoppgave
    gikktilarenaogfinnesoppgave -- "NEI" --> prøvopprettoppgave
    gikktilarenaogfinnesoppgave -- "JA: Oppgave finnes allerede, avbryter." --> endloop 
    end
    

```
