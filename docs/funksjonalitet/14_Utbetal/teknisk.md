# Teknisk beskrivelse

## Nyttige lenker

* API dokumentasjon for aap-utbetal: https://aap-utbetal.intern.dev.nav.no/swagger-ui/index.html
* API dokumentasjon for Helved utbetaling: https://helved-docs.intern.dev.nav.no/v3/doc/kom_i_gang

## Flyter
### #1: Tilkjent ytelse fra Behandlingsflyt til Helved Utbetaling

```mermaid
flowchart LR
    Behandlingslyt["`**Behandlingsflyt**
                    Sender tilkjent ytelse
                    til Utbetal
                    når vedtak iverksettes`"]
    Utbetal["`**Utbetal**
            Mottar tilkjent ytelse
            og lagrer denne og
            lager task for å utlede
            utbetalinger`"]

    OpprettUtbetalingUtfører["`**OpprettUtbetalingUtfører**
                            Deler opp utbetaling i eventuelle endinger
                            og nye utbetalinger. Utbetalingene lagres
                            og task for sending av utbetaling opprettes
                            per utbetaling. Status på utbetaling er nå OPPRETTET.`"]

    OverførTilØkonomiJobbUtfører["`**OverførTilØkonomiJobbUtfører**
                                Konverterer utbetaling til Helved-utbetaling
                                sitt format, og sender utbetalingene enten som
                                en ny utbetaling eller endring av eksisterende
                                utbetaling. Utbetalings status 
                                settes til SENDT.`"]                                     
                            
    Behandlingslyt --REST--> Utbetal --Motor--> OpprettUtbetalingUtfører --Motor---> OverførTilØkonomiJobbUtfører


```

### #2: Hent kvitteringer for utbetalinger

```mermaid
flowchart LR

    SjekkKvitteringFraØkonomiUtfører["`**SjekkKvitteringFraØkonomiUtfører**
                                        Henter alle utbetalinger med status
                                        SENDT og prøver å hente status
                                        på disse fra Helved-utbetaling.
                                        Dersom det er mottatt kvittering,
                                        så settes status enten til
                                        BEKREFTET eller FEILET.`"]
    
    MotorHentKvitteringer["`CRON: Trigges hvert
                            10. minutt`"]

    MotorHentKvitteringer --Motor--> SjekkKvitteringFraØkonomiUtfører
```

## Hovedfunksjoner

### #1: Mottar tilkjent ytelse fra behandlingsflyt ved veedtak

```mermaid
sequenceDiagram
Behandlingsflyt->>Utbetal: Ny tilkjent ytelse (vedtak)
Utbetal->>Utbetal: Sjekk om alle tidligere utbetalinger er bekreftet (ellers returner LOCKED)
Utbetal->>Utbetal: Sjekk at tilkjent ytelse ikke er duplikat (ellers returner CONFLICT)
Utbetal->>Database: Opprett rad i SAK_UTBETALING dersom den ikke eksisterer
Utbetal->>Database: Lagre tilkjent ytelse
Utbetal->>Utbetalmotor: Opprett task for å opprette utbetalinger(saksnummer, behandlingRef)

```

### #2: Opprett utbetalinger for gitt behandling/tilkjent ytelse
```mermaid
sequenceDiagram
    Utbetalmotor->>Utbetal: Start opprett utbetalinger(saksnummer, behandlingRef)
    Utbetal->>Database: Hent tilkjent ytelse for behandling
    Utbetal->>Database: Hent sak-utbetaling for sak
    Utbetal->>Database: Hent tidligere utbetalinger for sak
    Utbetal->>Utbetal: Bygg tidslinje for tidligere utbetalinger
    Utbetal->>Utbetal: Beregn utbetalinger(endringer og ny) utifra tilkjent ytelse og tidligere utbetalinger
    Utbetal->>Database: Lagrer de beregnede utbetalingene
    Utbetal->>Utbetalmotor: Opprett tasker for sending av alle beregnede utbetalinger(utbetalingId)
```

### #3: Overfør utbetaling til Helved-utbetaling

```mermaid
sequenceDiagram
Utbetalmotor->>Utbetal: Start overfør utbetaling(utbetalingId)
Utbetal->>Database: Hent utbetaling
Utbetal->>Utbetal: Konverter utbetaling til Helved datamodell
Utbetal->>HelvedUtbetaling: Send utbetaling (POST for ny, PUT for endring og DELETE for opphør)
Utbetal->>Database: Oppdater status til SENDT(utbetalingId) på utbetaling
```

### #4: Behandle kvittering

```mermaid
sequenceDiagram
Utbetalmotor->>Utbetal: Behandle kvitteringer (trigges hvert 10. min.)
Utbetal->>Database: Hent alle utbetalinger som mangler kvittering
loop For hver utbetaling som mangler kvittering
    Utbetal->>HelvedUtbetaling: Hent status for utbetaling
    Utbetal->>Database: Oppdater status på utbetaling dersom OK eller FEILET
end
```
