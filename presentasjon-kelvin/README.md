# presentasjon-kelvin

Beamer-presentasjon om Kelvin, skrevet i Org-mode og eksportert til PDF med
`org-beamer-export-to-pdf`.

Diagrammer skrives som PlantUML-blokker rett i org-fila og genereres på nytt for
hvert bygg.

### Lokalt

Nødvendige kommandoer: `emacs` (eller `emacs-nw`), `latexmk`, `plantuml`,
`rsvg-convert`. `build.sh` bruker `emacs-nw` hvis den finnes, ellers `emacs`.
Du kan overstyre med `EMACS=/sti/til/emacs ./build.sh`.

### Docker

Kun Docker. Alt annet ligger i imaget. Nyttig i sandkasser eller CI der Emacs
ikke kan kjøres, eller på maskiner uten TeX.

## Bygge

```bash
./build.sh                 # lokalt, bygger presentasjon.org
./build.sh --docker        # i container
./build.sh min-fil.org     # annen org-fil
```

`DOCKER=1 ./build.sh` gjør det samme som `--docker`.

Første `--docker`-kjøring bygger imaget automatisk (~3 min, ~4 GB). Senere
kjøringer gjenbruker det. Vil du bygge på nytt:

```bash
docker build -t presentasjon-kelvin:latest .
```

Containeren kjører som din egen bruker, så genererte filer eies av deg, ikke
root.

### Eksport fra Emacs

`C-c C-e l P` i org-buffere fungerer også. `.dir-locals.el` setter
`org-latex-pdf-process` slik at SVG-konverteringen skjer på samme måte som i
`build.sh`.

## Filer

|Fil               |Beskrivelse                                   |
|------------------|----------------------------------------------|
|`presentasjon.org`|Selve presentasjonen (kilde)                  |
|`navtheme.sty`    |Beamer-tema med Nav-farger                    |
|`build.sh`        |Byggeskript, lokalt eller i Docker            |
|`svg2pdf.sh`      |Konverterer SVG til PDF før LaTeX kjøres      |
|`Dockerfile`      |Byggemiljø med Emacs, TeX Live, PlantUML, rsvg|
|`.dir-locals.el`  |Gjør Emacs-eksport lik `build.sh`             |

Genererte filer (`presentasjon.tex`, `presentasjon.pdf`, `vei.svg`, `vei.pdf`)
er resultater av bygget og kan trygt slettes.

## Hvordan byggesteget henger sammen

1. Org eksporterer til LaTeX og kjører PlantUML-blokkene, som skriver `vei.svg`.
2. `svg2pdf.sh` konverterer nye/endrede SVG-er til PDF med `rsvg-convert`.
3. `latexmk` kjører `pdflatex` og lager `presentasjon.pdf`.

Steg 2 er nødvendig fordi `pdflatex` ikke leser SVG. Org eksporterer SVG-lenker
som `\includesvg`, som normalt krever `svg.sty` + Inkscape + `-shell-escape`.
I stedet definerer `navtheme.sty` en enkel `\includesvg` som inkluderer den
ferdig konverterte PDF-en.

## Legge til diagrammer

```org
#+begin_src plantuml :file diagram.svg :exports results :noweb yes
<<nav-plantuml-common>>
<<nav-plantuml-sequence>>
Alice -> Bob : Hei
#+end_src

#+ATTR_LATEX: :width \linewidth :height .75\textheight :options keepaspectratio
#+RESULTS:
[[file:diagram.svg]]
```

`nav-plantuml-common` gir alle diagrammer fargene fra `navtheme.sty`.
Bruk også `nav-plantuml-sequence` for sekvensdiagrammer eller
`nav-plantuml-activity` for aktivitetsdiagrammer; for komponentdiagrammer
kan du sette egne `skinparam`-verdier etter den felles referansen.
De navngitte blokkene i `presentasjon.org` er kun for noweb og kjøres ikke alene.

To ting er lett å trå feil på:

- `#+ATTR_LATEX:` må stå **over** `#+RESULTS:`. Legger du den mellom
  `#+RESULTS:` og lenka, mister Babel koblingen til resultatet og setter inn et
  duplikat av bildet ved neste eksport.
- Bruk `keepaspectratio` sammen med både `:width` og `:height`. Setter du bare
  `:height`, skaleres brede diagrammer ut over høyre marg og blir beskåret.

## Temaet

`navtheme.sty` gir et moderne, flatt uttrykk med Nav-rød som hovedfarge:

- **Skrift:** Source Sans (Navs merkevareskrift) via `sourcesanspro`, med Source
  Code Pro til kode. Dette er den største grunnen til at slidene ikke ser
  «beamer-aktige» ut.
- **Kort:** Blokker (`***`-nivået) rendres som flate kort med kjølig grå
  bakgrunn og en rød aksentkant til venstre, via `tcolorbox` – ikke beamers
  avrundede, skyggelagte blokker.
- **Tittellinje:** Ren, flat tittel med en kort rød «fane»-strek under.
- **Tittelside:** Full rød flate med myke geometriske former for dybde.

Endre farger, skrift og kort-stil der, ikke i org-fila. Fargene ligger som
`\definecolor`-linjer øverst i fila (kjølige, Aksel-inspirerte gråtoner).

Source Sans og Source Code Pro følger med i full TeX Live (både `mactex-no-gui`
lokalt og `texlive-fonts-extra` i Docker-imaget).

## Feilsøking

**`! Undefined control sequence. \includesvg`**
`navtheme.sty` er ikke lastet. Sjekk at org-fila har
`#+LATEX_HEADER: \usepackage{navtheme}`, og at `navtheme.sty` ligger i samme
katalog.

**Diagrammet viser gammelt innhold**
`vei.pdf` er utdatert i forhold til `vei.svg`. Skjer hvis SVG-konverteringen
ikke kjørte — typisk ved eksport fra Emacs uten at `.dir-locals.el` er godkjent.
Slett `vei.pdf` og bygg på nytt.

**Emacs krasjer med `NSColorListNotEditableException`**
Skjer i enkelte sandkasse-/servermiljøer på macOS. Bruk `./build.sh --docker`.

**PlantUML-syntaksfeil på `ø`, `æ` eller `å`**
Manglende UTF-8-locale. I Docker er dette allerede satt; lokalt, sjekk at
`LANG` inneholder `UTF-8`.

## Kjente begrensninger

- Docker-imaget pinner PlantUML-versjonen, men Debian- og TeX Live-pakkene
  flyter. Bygget er altså rimelig reproduserbart, men ikke bit-identisk over
  tid.
- `--docker` bruker ikke `.dir-locals.el`; den gjelder kun eksport fra Emacs.
- `#+AUTHOR:` må stå i org-fila. Containeren har ingen `user-full-name`, så uten
  den blir forsida seende "unknown" ut.
