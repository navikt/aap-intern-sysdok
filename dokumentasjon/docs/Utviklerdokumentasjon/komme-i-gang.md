# Komme i gang som utvikler

Dette er en liten oversikt over hva som skal til for å komme i gang som ny utvikler i Team Innbygger.


## Tilganger

For å få tilgang til Team Innbygger sine GitHub repoer må du være lagt til i `navikt` organisasjonen på GitHub, og være lagt inn i gruppen `aap` i Azure AD.

### Våre repoer på github

| Repoer                                                              | Teknologi                    | Beskrivelse                                                                                                                                            | 
|---------------------------------------------------------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------| 
| [AAP Kalkulator](https://github.com/navikt/aap-kalkulator-frontend) | NEXT.JS                      | AAP-Kalkulatoren er et hjelpemiddel som kan bli brukt for å få et estimat om hva du kan få i AAP støtte.                                               |
| [ AAP søknader](https://github.com/navikt/aap-soknad)               | NEXT.JS                      | Felles frontend for søknad for AAP og Søknad AAP utland                                                                                                |
| [Mine AAP](https://github.com/navikt/aap-innsyn)                    | NEXT.JS                      | Sentral side for innbygger og saksinformasjon<br/> - Ettersendelse av dokumentasjon<br/> - Utlisting av dokumenter tilknyttet saken<br/> - Informasjon |
| [AAP søknad API](https://github.com/navikt/aap-soknad-api)          | JAVA 17<br/>Kotlin<br/>maven | Sentral Backend for Innbygger<br/> - integrasjoner mot forretningstjenester<br/> - Kafka for brukernotifikasjoner<br/>                                 |
| [PDF generator](https://github.com/navikt/aap-pdfgen)               | Shell                        |                                                                                                                                                        |
| [AAP-Domain](https://github.com/navikt/aap-domain)                  | JAVA 17<br/>Kotlin<br/>maven | Felles domenemodell                                                                                                                                    |
| [AAP-FSS-Proxy](https://github.com/navikt/aap-fss-proxy)            | JAVA 17<br/>Kotlin<br/>maven | Proxy for baktjenester                                                                                                                                 |

## Frontend

Frontend-appene i Team Innbygger er bygget på NextJS. Vi bruker `yarn` som byggeverktøy, og deploy skjer til Nais via GitHub Actions.

### Tilgang til GitHub Package Registry

Flere av avhengighetene vi bruker blir kun publisert på GitHub sitt Package Registry. For å kunne installere disse lokalt må du derfor sette opp yarn til å bruke `https://npm.pkg.github.com` i stedet for `https://npmjs.com`.

- Lag/forny access token med repo og read:packages [rettigheter i github]( https://github.com/settings/tokens). husk enable sso
- Login på npm med `npm login --scope=@navikt --registry=https://npm.pkg.github.com` og benytt github brukernavn, epost og tokenet du nettopp genererte

### Node versjon

Vi følger LTS release for NodeJS. For tiden er dette versjon `16.X`. Oppsett av NodeJS på egen maskin varierer avhengig av operativsystem.

#### Oppsett på MacOS og Linux

For MacOS og Linux er det anbefalt å bruke `nvm` (Node Version Manager). NVM lar oss enkelt ta i bruk spesifikke versjoner av NodeJS, og gjør det lett å bytte til ulike versjoner når det er behov for det. NVM kan installeres gjennom Homebrew (MacOS) eller tilsvarende pakkehåndteringsverktøy for Linux-distroer.

Når NVM er installert kan LTS versjon av Node installeres med `nvm install --lts`. For å ta i bruk LTS-versjon av kjører du `nvm use --lts`. Du kan sjekke at du kjører riktig versjon av Node med `node -v` som skal gi følgende output:

```sh
$ node -v
v16.13.0
```

### Bygg og utvikling av frontend lokalt

Etter å ha klonet et repo første gang, eller dersom det har vært gjort endringer i `package.json` eller `yarn.lock` må du kjøre `yarn` for å installere avhengighetene til appen. Denne kommandoen trigger også eventuelle `postinstall scripts` som lokal patching av avhengigheter og oppsett av `pre-commit hooks` for linting og prettifying av kode.

NextJS-appene startes lokalt med `yarn dev` og tester kjøres med `yarn test` (eventuelt `yarn test --watch` for å kontinuerlig kjøre tester under utvikling). Andre måter å starte appen på, og andre scripts vil være dokumentert i repoets egen README eller `package.json`.

#### Bruk av ENV-variabler

Vi bruker ENV-variabler for konfigurasjon av frontendappene våre. ENV-variabler for de ulike miljøene som ikke er _hemmelige_ ligger i `.nais/[MILJØ].env`. Disse blir kopiert inn i appen under bygging i GitHub Actions. Har du behov for å bruke noen av disse variablene ved utvikling lokalt kan de kopieres inn i `.env.local` lokalt (Denne filen ignoreres av Git, og skal ikke sjekkes inn).

ENV-variabler som er hemmelige skal _ikke_ legges inn i kildekoden. I disse tilfellene bruker vi `Secrets` i GitHub repoet, eller injecting av ENV-variabler via Nais.

Som standard vil alle ENV-variabler i NextJS kun være tilgjengelig på serversiden. For å eksponere en variabel ut til nettleser må den prefikses med `NEXT_PUBLIC_`.

#### Mocking av backend

Ved utvikling lokalt kan det være nyttig å mocke responser fra backend. Dette gjøres ved å sette `NEXT_PUBLIC_ENVIRONMENT="localhost"` i `.env.local`.

### Måling og logging av feil

Vi bruker Amplitude for å gjøre målinger i frontendappene, og Sentry for å måle performance og logge feil.

#### Amplitude

For å få tilgang til Amplitude må du legge til Amplitude på https://myapps.microsoft.com. Etter at du har gitt deg selv tilgang her må en annen utvikler i teamet legget deg til i riktig Space i Amplitude.

Amplitude brukes for å logge ulike `eventer` eller ting som brukere gjør i appene våre. Dette kan for eksempel være `startet søknad`, `åpnet ekspanderbart panel` eller `trykket på lenke`. Se [Analytic Taxonomy](https://github.com/navikt/analytics-taxonomy) for en oversikt over hvilke eventer vi kan logge.

Logging av eventer til Amplitude går via en proxy i NAV som fjerner personidentifiserende informasjon som IP-adresse. Det er allikevel viktig at vi ikke legger ved informasjon i et event som kan brukes til å reidentifisere en person. Indirekte personopplysninger som alder, bosted og kjønn kan også brukes til å reidentifisere en person.

#### Sentry

For å få tilgang til Sentry må du legge til Sentry på https://myapps.microsoft.com. Etter at du har gitt deg selv tilgang her må en annen utvikler i teamet legget deg til i riktig prosjekt i Sentry.

Vi bruker Sentry til å måle performance i frontendappene våre. Dette inkluderer tid brukt på sidelasting og hvor stor andel av brukere som opplever feil. Vi bruker også Sentry til automatisk rapportering av feil som oppstår i brukers nettleser.

#### Applikasjonslogger

Applikasjonslogger på serversiden plukkes opp automatisk av NAIS og tilgjengeliggjøres på https://logs.adeo.no.

Vi bruker `pino` for logging på serversiden, og disse loggene formateres med `@elastic/ecs-pino-format` for at de skal parses riktig.

## Backend
- Applikasjonene bygger på Maven Java 17. Kotlin brukes som språk.
- InteliJ benyttes som IDE i NAV, men kan bruke det en foretrekker.

### Oppsett for lokal utvikling
