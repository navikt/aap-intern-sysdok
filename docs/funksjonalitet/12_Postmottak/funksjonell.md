# Funksjonell beskrivelse


## Automatisk- / Delautomatisk- / Manuell-flyt

Per nå så går digitale søknader via søknadsveilederen automatisk igjennom for å ikke knekke eksisterende flyt fra AAP-Mottak. 
En søknad fra søknadsveilederen blir identifisert ved at journalposten har en AAP søknadsbrevkode (`NAV 11-13.05`) og har et tilhørende dokument i JSON format. Alle steg slipper nå kun igjennom manuell søknad, med unntak av Finn sak steget, som også automatisk behandler journalposter hvor bruker ikke har eksisterende saker i fagsystem.

```mermaid
flowchart 
    s((Joark-melding))
    at{AvklarTema}
    fs{FinnSak}
    jf(Journalføring)
    kt{Kategoriser}
    dig{Digitaliser}
    of(((Overlever fagsystem)))
    s --> at
    at-- Ikke digital søknad-->ManuellAt(Manuell)
    ManuellAt --> fs
    at-- else -->fs
    fs--  Ikke-digital søknad og\n Ingen saker på bruker-->ManuellFs(Manuell)
    ManuellFs-->jf
    fs-- else-->jf
    jf-->kt
    kt--  Ikke-digital søknad -->ManuellKt(Manuell)
    ManuellKt-->dig
    kt-- else -->dig
    dig--  Ikke-digital søknad -->ManuellDig(Manuell)
    ManuellDig-->of
    dig-- else -->of
```