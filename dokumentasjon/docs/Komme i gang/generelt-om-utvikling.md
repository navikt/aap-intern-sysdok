# Generelt om utvikling

## Frontend

### Kodestil og linting

Vi bruker `prettier` for formatering av kode. Formatering med prettier følger standard regler, og maksbredde på 120 tegn.

Linting av kode gjøres via `typescript` og `eslint`, med standard oppsett av eslint-regler fra NextJS.

Formatering av kode og linting gjøres som `pre-commit hooks`. Disse blir automatisk installert første gang du kjører `yarn`. Og vil hindre commit og push dersom koden inneholder feil.

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
