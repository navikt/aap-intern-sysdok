# AGENTS.md

Agentinstruksjoner for GitHub Copilot og OpenCode. Begge leser denne filen og skills i `.agents/skills/`. Andre verktøy brukes ikke, så ikke legg til `CLAUDE.md` eller lignende filer.

Repoet er Team AAPs interne systemdokumentasjon, bygget med Docusaurus. Innholdet ligger som Markdown og MDX i `docs/`. Siden publiseres på <https://aap-sysdoc.intern.nav.no>.

## Arbeidsspråk er norsk

- All tekst og dokumentasjon skrives på norsk bokmål med æ, ø og å: dokumentasjon, AGENTS.md, skills, kodekommentarer, commit-meldinger, PR-beskrivelser og UI-tekst.
- Skriv «Nav», ikke «NAV».
- Domeneord er norske, også i kode: `bestilling`, `meldekort`, `søknad`, `vedtak`.
- Kodenære ord og etablerte fagtermer beholdes på engelsk: `fetch`, `handler`, `request`, `payload`, `outbox`, `props`, `topic`.
- Typer og felt i flytdiagram-modellen (`Flow`, `FlowNode`, `label`, `details` osv.) er kodeord og forblir engelske.
- Id-er og filnavn for flytdiagrammer bruker kun `a-z`, `0-9` og bindestrek fordi de havner i URL-er. Bytt æ, ø og å med ae, o og a.

## Stack

- Docusaurus 3 (classic preset), React, Yarn
- Mermaid for enkle diagrammer i Markdown
- Tailwind og Infima for styling
- `@xyflow/react` (React Flow) for de klikkbare flytdiagrammene

## Struktur

```text
docs/                                         Dokumentasjonen. Mappestrukturen styrer menyen.
docs/funksjonalitet/                          «Applikasjoner», én mappe per app
docs/funksjonalitet/12_Postmottak/flytdiagrammer/  MDX-sider for flytdiagrammene til postmottak
src/flytdiagrammer/flows/                     Diagramdata for flytdiagrammene
src/components/Flytdiagram/                   Lerret, bokser og sidepanel for flytdiagrammene
scripts/validate-flows.mts                    Validerer flytdata
.agents/skills/                               Skillen update-flow-diagram
```

## Kommandoer

```bash
yarn start            # http://localhost:3000
yarn validate-flows   # sjekker flytdata
yarn build            # statisk bygg til build/
```

`yarn build` feiler på døde interne lenker (`onBrokenLinks: "throw"`).

## Flytdiagrammer for postmottak

Undersiden Applikasjoner → Postmottak → Flytdiagrammer viser klikkbare flytdiagrammer. Klikk på en boks åpner et sidepanel med tekst og kode (ofte SQL). Det finnes ingen redigering i UI-et. Agenter oppdaterer diagrammene ved å endre datafilene.

- Last skillen `update-flow-diagram` i `.agents/skills/update-flow-diagram/SKILL.md` før du endrer et diagram.
- Kjør `yarn validate-flows` og `yarn build` etter hver endring.
- Importer i `src/flytdiagrammer/flows/` bruker eksplisitt `.ts`-endelse, slik at `scripts/validate-flows.mts` kan kjøres i ren Node.
- Komponentene i `src/components/Flytdiagram/` bruker Infima-variabler (`--ifm-*`), slik at diagrammet virker i både lys og mørk modus. Ikke hardkod farger.

### Kildekode for flytene

Flytene beskriver kode i andre repoer. Agenten har lesetilgang til disse (i cplt via `allow.read`), men skal ikke endre dem.

- `../aap-postmottak-backend` har de fleste flytene vi beskriver. Fordelingen skjer i `AvklarFordelingSteg` (`flyt/src/main/kotlin/no/nav/aap/postmottak/forretningsflyt/steg/fordeling/`). Reglene ligger i `flyt/src/main/kotlin/no/nav/aap/fordeler/` (`FordelerRegelService`), og `Regelresultat.skalTilKelvin` avgjør om saken går til Kelvin. Hver regel er en viktig boks i diagrammet.
- Kant-til-kant-sjekken ligger i `ArenaService.harOppbruktRettighet` (`flyt/src/main/kotlin/no/nav/aap/fordeler/arena/`) og styres av Unleash-togglen `KantTilKantV1`. Steget sender søknaden til Kelvin hvis reglene eller kant-til-kant sier Kelvin.
- `../aap-arenaoppslag` henter data fra Arena-databasen. Her ligger implementasjonen og SQL-spørringene. Postmottak kaller arenaoppslag gjennom `ArenaoppslagGatewayImpl` (`klienter/src/main/kotlin/no/nav/aap/postmottak/klient/arena/`). Endepunktene ligger i `app/src/main/kotlin/no/nav/aap/arenaoppslag/ApiRoute.kt`, tjenestene i `service/` og SQL-en i `database/`.

Begge repoene har egne agentinstruksjoner som gir domenekontekst:

- Postmottak: `AGENTS.md` og skillen `.agents/skills/postmottak-dokumentflyt/` (særlig `references/fordeling-og-arena.md`).
- Arenaoppslag: `AGENTS.md` og skillen `.agents/skills/jdbc-repository/`.

Dokumentasjonen i kilderepoene og i `docs/` kan være utdatert. Koden er fasit. Sjekk alltid koden før du tegner eller skriver, og si fra til brukeren hvis dokumentasjonen og koden sier ulike ting.

## Regler

- Legg aldri hemmeligheter, ekte personopplysninger eller fødselsnumre i dokumentasjonen eller flytdetaljene.
- Flytdetaljene skal forklare logikken og hvordan appene henger sammen: hvilken klasse som kaller hvilket endepunkt, hvilken rute og tjeneste som tar imot, hvilke spørringer som kjører og hva som returneres. Ikke ta med infrastruktur som cluster, sone, ingress-URL-er, token-oppsett, timeouts eller retry-innstillinger.
- Siden er statisk. Komponenter som trenger nettleseren (som React Flow) må pakkes i `BrowserOnly`.
