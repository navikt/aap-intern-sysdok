# Felleskomponenter

Vi har dratt ut noe felles funksjonalitet til biblioteker, som vi har i repoet https://github.com/navikt/aap-kelvin-komponenter .

API-dokumentasjon kan leses på https://navikt.github.io/aap-kelvin-komponenter/

## Avhengigheter mellom pakker

For øyeblikket lastes ikke transitive avhengigheter ned pakker ned (f.eks om man er interessert i `motor`).


```mermaid
flowchart LR
    motor --> dbconnect
    motor -.-> dbtest
    motor-api --> motor
    motor -- (pga DefaultJsonMapper) --> httpklient
    dbconnect -.-> dbtest
    dbmigrering --> infrastructure
    httpklient --> infrastructure
    server --> httpklient
```

## Motor

Funksjonalitet for å kjøre asynkrone jobber basert på implementasjoner av `JobbUtfører`-interfacet.

Krever at tabellene `JOBB` og `JOBB_HISTORIKK` er opprettet, se [her](https://github.com/navikt/aap-kelvin-komponenter/blob/main/motor/src/test/resources/flyway/V0.1__modell.sql).

Her er en oversikt over de relevante klassene.

```mermaid
flowchart LR

subgraph Motor
  direction LR
  Watchdog
  subgraph ForbrenningsKammer
    Kammer1
    Kammer2
  end
end

FlytjobbRepository
JobbInput

JobbInput -- legg til ny jobb --> FlytjobbRepository
Watchdog -- sjekker om alle kamrene kjører --> ForbrenningsKammer
Kammer1 -- spør om nye jobber --> FlytjobbRepository
Kammer2 -- spør om nye jobber --> FlytjobbRepository
```

### Flytdiagram i et forbrenningskammer

I et forbrenningskammer er det følgende flyt:

```mermaid
sequenceDiagram
Kammer ->> JobbRepository: Spør etter nye jobber
JobbRepository ->> Kammer: Leverer JobbInput (inneholder paremetre + Jobb-objekt)
Kammer ->> JobbUtfører: Utfører jobben.
alt Er en schedulert jobb?
  Kammer ->> JobbRepository: Legg til ny jobb i framtiden
end
alt Suksess?
  Kammer ->> JobbRepository: Marker jobb som kjørt.
else Feilet?
  Kammer ->> JobbRepository: Marker jobb som feilet og lagre stacktrace.
end
```

### Klassediagram for jobber

Skisse på forhold mellom `Jobb`, `JobbUtfører` og `JobbInput`. Jobb-objektene brukes for å konstruere `JobbUtfører`. `JobbInput` er det som lagres i databasen.

```mermaid
classDiagram
class Jobb
<<interface>> Jobb
Jobb : konstruer(dbConnection)

class JobbUtfører
<<interface>> JobbUtfører
JobbUtfører : utfør(input)

class JobbInput

Jobb --|> JobbUtfører

```

## dbconnect

Wrapper rundt `javax.sql`, med funksjonalitet for å sikre transaksjonshåndtering, og bedre null-håndtering.

TODO: presenter public API
