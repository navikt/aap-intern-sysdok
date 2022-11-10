# Morgenrutine for utviklere

Morgenrutinen går ut på at en utvikler "på vakt", sjekker på morningen at teamets produkter kjører uten større problemer. 

Sjekker errors dersom de forekommer, og melder fra i internkanal at morgenrutine er gjennomført, samt evt. problemer.

Morgenvakten kan etter egne mål involvere andre utviklere/fagpersoner for å få løst evt. problemer.

## Sjekkliste for morgenrutine
* Sjekk [logs.adeo.no](https://logs.adeo.no/goto/3e411230-55ef-11ed-b3e8-d969437dd878) for errors.
* Sjekk Grafana boards:
  * [Overordnet](https://grafana.nais.io/d/iCjPTsnVk/aap-innbygger)
  * [Mine AAP](https://grafana.nais.io/d/eruJ1y7Vk/aap-mineaap)
  * [Søknad](https://grafana.nais.io/d/ZF-AUGVVk/aap-soknad)

- Sjekk av amplitude? [PO AAP - Team Innbygger](https://analytics.eu.amplitude.com/nav/space/e-6ciag7t/all)
- [ ] Sjekk av andre ting?
- [ ] Sjekk status på ting i prod
- [ ] Følge med på Snyk / Dependabot / Oppgradere avhengigheter

### GCP Lenker som kan sjekkes
* [GCP  DB Dachboard](https://console.cloud.google.com/home/dashboard?project=aap-prod-9adc)
* [Prod databasen](https://console.cloud.google.com/sql/instances/aap-soknad-api-prod/overview?project=aap-prod-9adc)
* [GCP Buckets](https://console.cloud.google.com/storage/browser?referrer=search&project=aap-prod-9adc&prefix=)
* [GCP Bucket Monitorering](https://console.cloud.google.com/storage/monitoring?project=aap-prod-9adc)

Dette sjekkes dersom vi har problemer i prod med søknader. Merk her er det skarpe data, en skal ikke titte på dette uten at det er behov.

## Hvem, hvor, når?

Vi kjører rullerende "vakt" på ukesbasis. Vaktukene går alfabetisk. Er du opptatt hele eller deler av din uke, er det bare å bytte med noen andre. Gi en kort oppsummering (1-2 setninger) i Slack om hvordan uken har gått.

* Halvor Grizzly (Uke 45)
* Jan Olav (Uke 46)
* Niro (Uke 47)
* Sturle (Uke 48)
* Tor (Uke 49)
* Vetle (Uke 50)
* Øydis (Uke 51)

| Uke  |  Halvor Grizzly  | Jan Olav | Niro | Sturle  | Tor | Vetle | Øydis |
|---|---|---|---|---|---| ---|---|
| 45 | * |   |   |   |   |    |   |
| 46 |   | * |   |   |   |    |   |
| 47 |   |   | * |   |   |    |   |
| 49 |   |   |   | * |   |    |   |
| 50 |   |   |   |   | * |    |   |
| 51 |   |   |   |   |   | *  |   |
| 52 |   |   |   |   |   |    |   |
| 1  |   |   |   |   |   |    |   |
| 2  |   |   |   |   |   |    |   |
| 3  |   |   |   |   |   |    |   |
| 4  |   |   |   |   |   |    |   |
| 5  |   |   |   |   |   |    |   |
| 6  |   |   |   |   |   |    |   |
| 7  |   |   |   |   |   |    |   |
| 8  |   |   |   |   |   |    |   |
| 9  |   |   |   |   |   |    |   |
| 10 |   |   |   |   |   |    |   |
