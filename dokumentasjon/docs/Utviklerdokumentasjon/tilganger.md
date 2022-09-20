# Nødvendige tilganger og oppsett for å utvikle
___

For å utvikle i teamet trenger en noen tilganger.<br/>
Forutsetninger:
- Maskinen er satt opp for utvikling i NAV (nicedevice, kubectl, logs, kibana, etc).
- Generell tilgang til [GCP er gitt for din NAV bruker](https://console.cloud.google.com/)

| Tilgang         | Hva           | Hvordan                                                                                               |
|-----------------|---------------|-------------------------------------------------------------------------------------------------------|
| Github repoer   | all utvikling | Fås av Richard med å meldes inn i [AAP teamet](https://github.com/orgs/navikt/teams/aap/repositories) |
| Amplitude      | frontend      | Se [Amplitude](#Amplitude)                                                                            |
| Sentry         | frontend      | Se [Sentry](#Sentry)                                                                                  |
 |                |               |                                                                                                       | 
|                |               |                                                                                                       | 
|                |               |                                                                                                       | 

#### Amplitude

For å få tilgang til Amplitude må du legge til Amplitude på https://myapps.microsoft.com. Etter at du har gitt deg selv tilgang her må en annen utvikler i teamet legget deg til i riktig Space i Amplitude.

Amplitude brukes for å logge ulike `eventer` eller ting som brukere gjør i appene våre. Dette kan for eksempel være `startet søknad`, `åpnet ekspanderbart panel` eller `trykket på lenke`. Se [Analytic Taxonomy](https://github.com/navikt/analytics-taxonomy) for en oversikt over hvilke eventer vi kan logge.

Logging av eventer til Amplitude går via en proxy i NAV som fjerner personidentifiserende informasjon som IP-adresse. Det er allikevel viktig at vi ikke legger ved informasjon i et event som kan brukes til å reidentifisere en person. Indirekte personopplysninger som alder, bosted og kjønn kan også brukes til å reidentifisere en person.

#### Sentry

For å få tilgang til Sentry må du legge til Sentry på https://myapps.microsoft.com. Etter at du har gitt deg selv tilgang her må en annen utvikler i teamet legget deg til i riktig prosjekt i Sentry.

Vi bruker Sentry til å måle performance i frontendappene våre. Dette inkluderer tid brukt på sidelasting og hvor stor andel av brukere som opplever feil. Vi bruker også Sentry til automatisk rapportering av feil som oppstår i brukers nettleser.
