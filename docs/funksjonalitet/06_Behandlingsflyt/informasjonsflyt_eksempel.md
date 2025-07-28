# Barnetillegg informasjonsflyt

Eksempel på hvordan informasjon flyter fra søknad, register til saksbehandlerløsningen.

```mermaid
sequenceDiagram
    participant S as Søknad
    participant M as MottattDokumentRepository
    participant SS as SøknadService<br />(Informasjonkrav)
    participant A as BarnService<br />(Informasjonskrav)
    participant BR as BarnRepository
    participant BS as BarnetilleggSteg
    actor SB as Saksbehandler
    participant AL as AvklarBarnetilleggLøser
    participant BT as BarnetilleggRepository
    
    S ->> M: Søknad lagres i<br />MottattDokumentRepository.
    par
        SS ->> BR: Lagrer oppgitte<br />barn i søknaden.
        SS ->> M: Merker søknaden<br />som behandlet.
    end
    A ->> BR: Kaller PDL og lagrer ned fnr<br />og dødsdato for barn vi finner<br />i PDL (både oppgitt i søknad og ikke).
    BS ->> SB: Steget regnet ut om saksbehandler<br />trenger å ta stilling til ukjente barn.
    SB ->> AL: Saksbehandler fyller inn<br />opplysninger om barn som<br />ikke ble funnet i PDL.
    AL ->> BR: Disse lagres som VurdertBarn
    BS ->> BT: Steget regnet ut tidslinje over<br />barnetillegg og lagrer.
    
```

Den strukturerte dataen i søknaden lagres i tabellen `mottatt_dokument`. Når søknaden mottas, leses den strukturerte dataen og lagres i relevante repositories. I dette tilfellet leses informasjon om oppgitte barn, og lagres i `BarnRepository`.

Før barnetilleggsteget kjøres, kjøres `BarnService`, som henter ned barn fra PDL. Her hentes også ned informasjon om barn som ble oppgitt i søknaden _hvis_ de oppga fødselsnummer.

Barnetilleggsteget trenger å finne ut av hvor mange og hvor lenge søker har rett til barnetillegg. Hvis PDL har informasjon om barn, kan dette avgjøres automatisk. Hvis ikke, må saksbehandler ta stilling til "manuelle barn".

Når alle barn er tatt høyde for, lagres en tidslinje over barnetillegg (faktisk en tidslinje med av `Set<BarnIdentifikator>`) i `BarnetilleggRepository`.

Denne informasjonen brukes deretter for å regne ut tilkjent ytelse senere.
