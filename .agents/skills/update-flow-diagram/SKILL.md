---
name: update-flow-diagram
description: Legg til, endre, flytt eller fjern bokser, piler og detaljer (tekst, SQL, kode) i de hardkodede flytdiagrammene i src/flytdiagrammer/flows/ (Applikasjoner → Postmottak → Flytdiagrammer). Bruk når noen ber deg oppdatere et diagram, dokumentere hvordan en del av et program virker, lage en ny flyt eller forklare et steg med SQL eller kode.
---

# Oppdater et flytdiagram

Alle diagrammer er TypeScript-data i `src/flytdiagrammer/flows/`. De vises på MDX-sider i `docs/funksjonalitet/12_Postmottak/flytdiagrammer/` via komponenten `<Flytdiagram flowId="..." />`. Det finnes ingen editor og ingen database. Typedefinisjonene i `src/flytdiagrammer/flows/types.ts` er kontrakten. Les dem først.

Innholdet skrives på norsk bokmål med æ, ø og å. Domeneord er norske (`meldekort`, `bestilling`), kodenære ord kan være engelske (`fetchMeldekort`). Se `AGENTS.md`.

## Filer

| Fil | Formål |
| --- | --- |
| `src/flytdiagrammer/flows/types.ts` | `Flow`, `FlowNode`, `FlowEdge`, `DetailBlock` |
| `src/flytdiagrammer/flows/<flyt-id>.ts` | Én fil per flyt, eksporterer én `Flow`-konstant |
| `src/flytdiagrammer/flows/index.ts` | Register. En flyt må stå her for å vises |
| `src/flytdiagrammer/flows/validate.ts` | Sjekker id-er, overlappende bokser og piler til bokser som ikke finnes |

## Bokser viser bare navnet

Boksen viser kun `label`: et enkelt navn på 1–4 ord, f.eks. «Lagre bestilling». Ikke legg tekniske detaljer, statuskoder eller tabellnavn i `label`. Alt annet (`summary`, `details`) vises først når brukeren klikker på boksen.

En `decision` har plass til to linjer med omtrent 17 tegn hver, i mindre skrift enn de andre boksene. Hold valg-navnet på høyst rundt 36 tegn, ellers stikker teksten ut av diamanten.

## Rutenett

Posisjonen er øvre venstre hjørne av boksen, i piksler. En boks er 220 px bred og omtrent 56 px høy. En `decision` er en diamant på 220 × 100 px.

- Kolonner: `x = 0, 320, 640, 960 …` (steg på 320)
- Rader: `y = 0, 150, 300, 450 …` (steg på 150).
- Hovedløpet går rett ned i kolonnen `x = 0`. Forgreninger (feil, sideeffekter) går til høyre.
- En pil mellom bokser på samme rad tegnes side mot side, ellers fra bunn til topp. Ta hensyn til det når du velger posisjon.

## Vanlige oppgaver

### Legg til en boks

1. Legg til en `FlowNode` i `nodes` i flytfilen. Velg en ledig posisjon i rutenettet.
2. Legg til piler i `edges` med node-id-ene i `from` og `to`.
3. Setter du inn midt i et løp: fjern eller flytt den gamle pilen, og skyv boksene under ned én rad (legg 150 til `y`).

```ts
{
  id: "sjekk-kvote",            // kebab-case, kun a-z, 0-9 og bindestrek, unik i flyten
  label: "Sjekk kvote",         // enkelt navn, 1–4 ord, det eneste som vises i boksen
  kind: "decision",             // start | process | decision | database | external | end
  position: { x: 0, y: 300 },
  summary: "Én setning om hva steget gjør.",  // vises øverst i panelet
  details: [
    { type: "text", content: "Forklaring.\n\nNytt avsnitt. `inline-kode` støttes." },
    { type: "code", language: "sql", title: "Hent kvote", code: `SELECT ...` },
  ],
},
```

### Velg `kind`

| kind | Form | Brukes til |
| --- | --- | --- |
| `start` | Svært runde kanter | Inngang: HTTP-endepunkt, Kafka-consumer, planlagt jobb |
| `process` | Firkant | Vanlig logikksteg |
| `decision` | Diamant | Forgrening. Sett `label` på pilene ut, f.eks. `"ja"` / `"nei"` |
| `database` | Firkant | Lesing fra eller skriving til database |
| `external` | Firkant | Kall til andre systemer, Kafka-produsent, køer |
| `end` | Svært runde kanter | Svar eller sluttilstand |

### Legg til eller endre detaljer

`details` er en ordnet liste som vises i sidepanelet.

- `text`: avsnitt skilles med en tom linje (`\n\n`). Backticks gir inline-kode. Ingen annen markdown.
- `code`: `language` er én av `sql`, `kotlin`, `typescript`, `json`, `yaml`, `bash`, `text`. Koden vises med Docusaurus sin `CodeBlock` (Prism). Legger du til et nytt språk i `CodeLanguage` i `types.ts`, må Prism støtte det, og det må ofte legges til i `prism.additionalLanguages` i `docusaurus.config.js`. Bruk en template literal og behold innrykket. Gi en `title` som sier hva kodesnutten gjør.
- `link`: lenke til siden for en annen flyt, f.eks. `{ type: "link", flowId: "signifikant-arena-historikk", text: "Se flyten …" }`. `yarn validate-flows` sjekker at `flowId` finnes. `yarn build` sjekker ikke disse lenkene, fordi panelet bare rendres i nettleseren.

Kopierer du SQL eller kode fra en ekte kodebase, behold tabell- og kolonnenavn nøyaktig som de er. Lim aldri inn hemmeligheter, tokens, ekte personopplysninger eller fødselsnumre. Bytt verdier ut med navngitte parametere (`:kundeId`).

### Piler

```ts
{ from: "lagre-bestilling", to: "publiser-hendelse", label: "BestillingOpprettet", async: true }
```

`async: true` gir en stiplet, animert linje. Bruk det for Kafka, køer og planlagte jobber.

Piler ut av en `decision` heter «ja» eller «nei». Ikke skriv `true`, `false` eller `null` på pilene. Kan verdien mangle (null eller udefinert), skriv det på pilen den går til: «nei / udefinert» eller «ja / udefinert». Har udefinert sin egen gren, heter pilen «udefinert». Sjekk alltid i koden hvordan null håndteres.

### Fjern en boks

Slett noden og alle piler der `from` eller `to` peker på den. Lukk hullet ved å flytte boksene under opp én rad.

### Lag en ny flyt

1. Kopier `src/flytdiagrammer/flows/fordeling-mvp-kant-til-kant.ts` til `src/flytdiagrammer/flows/<ny-id>.ts` og gi eksporten nytt navn.
2. Sett unik `id` i kebab-case, `title` og `description`.
3. Importer den i `src/flytdiagrammer/flows/index.ts` og legg den til i `flows`.
4. Lag `docs/funksjonalitet/12_Postmottak/flytdiagrammer/<ny-id>.mdx` med samme oppsett som `fordeling-mvp-kant-til-kant.mdx`: frontmatter, overskrift, kort beskrivelse og `<Flytdiagram flowId="<ny-id>" />`.
5. Legg til en lenke i listen i `docs/funksjonalitet/12_Postmottak/flytdiagrammer/flytdiagrammer.mdx`.

## Sjekk

Kjør begge før du er ferdig:

```bash
yarn validate-flows   # id-er, overlapp, piler til bokser som ikke finnes
yarn build            # statisk bygg, feiler på døde lenker
```

Åpne deretter `yarn start` → `http://localhost:3000/funksjonalitet/Postmottak/flytdiagrammer/<id>` hvis du kan, og sjekk at ingen piler krysser bokser.
