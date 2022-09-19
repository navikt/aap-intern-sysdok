---
sidebar_position: 2
---

# Komme i gang med utvikling

Dette er en liten oversikt over hva som skal til for å komme i gang som ny utvikler i Team Innbygger.

## Tilganger

For å få tilgang til Team Innbygger sine GitHub repoer må du være lagt til i `navikt` organisasjonen på GitHub, og være lagt inn i gruppen `aap` i Azure AD.

### Tilgang til GitHub Package Registry

Flere av avhengighetene vi bruker blir kun publisert på GitHub sitt Package Registry. For å kunne installere disse lokalt må du derfor sette opp yarn til å bruke `https://npm.pkg.github.com` i stedet for `https://npmjs.com`.

- Lag/forny access token med repo og read:packages [rettigheter i github](https://github.com/settings/tokens). husk enable sso
- Login på npm med `npm login --scope=@navikt --registry=https://npm.pkg.github.com` og benytt github brukernavn, epost og tokenet du nettopp genererte

### Våre repoer på github

| Repoer                                                              | Teknologi                    | Beskrivelse                                                                                                                                            |
| ------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [AAP Kalkulator](https://github.com/navikt/aap-kalkulator-frontend) | NEXT.JS, Typescript          | AAP-Kalkulatoren er et hjelpemiddel som kan bli brukt for å få et estimat om hva du kan få i AAP støtte.                                               |
| [ AAP søknader](https://github.com/navikt/aap-soknad)               | NEXT.JS, Typescript          | Felles frontend for søknad for AAP og Søknad AAP utland                                                                                                |
| [Mine AAP](https://github.com/navikt/aap-innsyn)                    | NEXT.JS, Typescript          | Sentral side for innbygger og saksinformasjon<br/> - Ettersendelse av dokumentasjon<br/> - Utlisting av dokumenter tilknyttet saken<br/> - Informasjon |
| [AAP søknad API](https://github.com/navikt/aap-soknad-api)          | JAVA 17<br/>Kotlin<br/>maven | Sentral Backend for Innbygger<br/> - integrasjoner mot forretningstjenester<br/> - Kafka for brukernotifikasjoner<br/>                                 |
| [PDF generator](https://github.com/navikt/aap-pdfgen)               | Shell                        |                                                                                                                                                        |
| [AAP-Domain](https://github.com/navikt/aap-domain)                  | JAVA 17<br/>Kotlin<br/>maven | Felles domenemodell                                                                                                                                    |
| [AAP-FSS-Proxy](https://github.com/navikt/aap-fss-proxy)            | JAVA 17<br/>Kotlin<br/>maven | Proxy for baktjenester                                                                                                                                 |

## Frontend

Frontend-appene i Team Innbygger er bygget på NextJS. Vi bruker `yarn` som byggeverktøy, og deploy skjer til Nais via GitHub Actions.

[Se også mer generelt om hvordan vi driver med frontendutvikling i teamet](generelt-om-utvikling)

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

## Backend

- Applikasjonene bygger på Maven Java 17. Kotlin brukes som språk.
- InteliJ benyttes som IDE i NAV, men kan bruke det en foretrekker.

### Oppsett for lokal utvikling

Forutsetter at du har satt opp:

- [naicedevice](https://doc.nais.io/device/)<br/>
- Installert maven og java. eks:

```shell
$ brew install maven
$ brew install java
```

Anbefalt å bruke [Homebrew](https://brew.sh/) for lokalt oppsett, alt fra nais-teamet installeres via brew

- sett opp [nais cli](https://doc.nais.io/cli/install/)
- Oppsett for tilgang til dev db for aap_soknad_api<br/>
  [nais dokumentasjon](https://doc.nais.io/persistence/postgres/#personal-database-access) for personlig tilgang til database<br/>
  [posgress i google cloud](https://cloud.google.com/sql/docs/postgres/sql-proxy)<br/>
  Nyttige aliaser å sette opp i din `.env`

```sh
alias dbacess='gcloud projects add-iam-policy-binding aap-dev-e48b --member=user:fornavn.etternavn@nav.no --role=coludsql.admin --condition=“expression=request.time < timestamp(’\’‘2022-09-20T01:38:40Z’\‘’),title=temp_access”'
alias proxy='~/cloud_sql_proxy -instances=aap-dev-e48b:europe-north1:aap-soknad-api-dev=tcp:5432'
```

- Oppsett for å kunne bruke [Dokuments sine Avro-skjemaene i din applikasjon](https://github.com/navikt/teamdokumenthandtering-avro-schemas#oppsett-for-%C3%A5-kunne-bruke-avro-skjemaene-i-din-applikasjon)
- Da bør du være klar til å kjøre

```shell
mvn clean install
```
