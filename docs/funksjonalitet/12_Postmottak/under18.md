# Håndtere søkere under 18 år

Se [Mural](https://app.mural.co/t/navdesign3580/m/navdesign3580/1786084434143/a6a42df894c66558e8688be6f0de1635d7f46b59). Noe på [Confluence her](https://confluence.adeo.no/spaces/PAAP/pages/772223163/%C2%A7+11-4+Alder+%E2%80%93+bruker+over+67+eller+under+18).

## Sekvensdiagram

```mermaid
sequenceDiagram
    actor Barn as Bruker (barn)
    participant Postmottak
    participant Gosys
    actor Foresatte
    participant Kelvin

    Barn->>Postmottak: Søker på papir (kommer inn via scanning)
    activate Postmottak
    Postmottak->>Postmottak: Saksbehandler plukker oppgaven,<br />viser info om at bruker er under 18 år
    Postmottak->>Postmottak: Journalfører søknaden på "generelt"

    alt Over 17 år og 9 md.
        Postmottak->>Gosys: Utfører arbeid i Gosys (printe forside, etc)
    else Under 17 år og 9 md.
        Postmottak->>Barn: Går i dialog med bruker om å "henlegge"
        alt Bruker svarer ja
            Note over Postmottak: Henlegger - saken stopper her
        else Bruker svarer nei
            Postmottak->>Gosys: Oppretter Gosys-oppgave??
        end
    end
    deactivate Postmottak

    activate Gosys
    Gosys->>Gosys: Lager utgående post, forside og legger ved samtykkeskjema
    Gosys->>Foresatte: Sender brev med søknad + samtykkeskjema i post
    deactivate Gosys

    Foresatte->>Foresatte: Mottar brev fra Nav med søknad og samtykkeskjema
    Foresatte->>Postmottak: Signerer samtykke og sender søknad + samtykke<br />tilbake til Nav (i post, kommer inn via scanning)

    activate Postmottak
    Postmottak->>Postmottak: Plukker oppgaven og ber saksbehandler sjekke samtykke

    alt Ikke godkjent
        Postmottak->>Gosys: Utfører arbeid i Gosys på nytt
    else Godkjent
        Postmottak->>Postmottak: Journalfører og oppretter ny sak i Kelvin
        Postmottak->>Postmottak: Digitaliserer søknaden
        Postmottak->>Kelvin: Overleverer søknad
    end
    deactivate Postmottak

    Note over Kelvin: Behandlingen kan starte i Kelvin
```
