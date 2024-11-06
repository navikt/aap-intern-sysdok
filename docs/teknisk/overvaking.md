# Overvåking

Vi legger Grafana-dashboard i `aap`-mappen: https://grafana.nav.cloud.nais.io/dashboards/f/z2F1_Ap7k/aap



## Oversikt

| App             | Grafana-dashboard                                                                                 | Adeo-logger                                        | Alerts? |
|-----------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------|---------|
| Behandlingsflyt | [Lenke](https://grafana.nav.cloud.nais.io/d/fdti727n7u6m8c/behandlingsflyt?orgId=1)               | [Lenke](https://logs.adeo.no/app/r/s/niCDc "	") |         |
| Innsending      | [Lenke](https://grafana.nav.cloud.nais.io/d/TSvq-GvIk/innsending?orgId=1 "	")                  | [Lenke](https://logs.adeo.no/app/r/s/tczwn "	") | ✅      |
| Statistikk      | [Lenke](https://grafana.nav.cloud.nais.io/d/edqu3y0nhmxhcb/statistikk?orgId=1)                    | [Lenke](https://logs.adeo.no/app/r/s/XL6Dp)        |         |
| Ekstern API     | [Lenke](https://grafana.nav.cloud.nais.io/d/bcb27950-0648-4940-9cfb-3137d9b0405c/aap-api?orgId=1) | [Lenke](https://logs.adeo.no/app/r/s/JiOr7)        |         |
| Oppgave         | [Lenke](https://grafana.nav.cloud.nais.io/d/fdy5hjhfbo3r4c/oppgave?orgId=1 "	")                |                                                    |         |

(Adeo-lenker lages ved å klikke "Share" og så "Short URL")

## Alerts

Alerts defineres i et felles repo: https://github.com/navikt/aap-alerts , og blir farslet på Slack-kanalen `#team-aap-prod-alerts`.

## Infoskjerm på kontoret

Vi har satt opp en Raspberry Pi som viser Grafana-dashboards på en infoskjerm på kontoret.

```mermaid
architecture-beta
    group api(internet)[Infoskjermnett]
    group nais(cloud)[NAIS]
    
    service grafana(server)[Grafana] in nais
    service kelvin(server)[Kelvin] in nais
    service disk(disk)[Prometheus] in nais

    service pi(server)[Raspberry Pi] in api

    disk:L -- R:grafana
    pi:R -- L:grafana
    disk:R -- L:kelvin

```

### Oppsett

Vi fulgte instruksjoner [herfra](https://utvikling.intern.nav.no/teknisk/infoskjerm.html) og [her](https://doc.nais.io/observability/metrics/how-to/grafana-from-infoscreen/?h=).

OS er Ubuntu Desktop. MAC-adressen til Pi-en måtte sendes på Slack-kanalen `#tech-nettverk`. Da fikk vi tilsendt et WiFi-passord slik at vi kunne koble oss til det skjulte nettverket `infoskjerm`. Velg WPA2 som auth-metode.

For Raspberry OS måtte følgende info legges i `wpa_supplicant.conf`-filen, men på Ubuntu kunne dette gjøres i GUI.

```conf
country=NO
update_config=1
ctrl_interface=/var/run/wpa_supplicant
network={
 scan_ssid=1
 ssid="infoskjerm"
 psk="***"
}
```

Her er SSID-verdien navnet på WiFi-nettverket.

Deretter måtte Pi-en restartes. Etterpå kan Grafana nåes på `https://grafana-infoskjerm.nav.cloud.nais.io/`.

Vi har en egen "playlist" i Grafana som autospiller predefinerte dashboard. Trykk [her](https://grafana.nav.cloud.nais.io/playlists/edit/ce34vgscjtqtca) for å redigere.

Om infoskjermen ikke er skrudd på, kan den skrus på med bryteren på Raspberry Pi-en. Den er satt til å starte Firefox automatisk ved oppstart.

Brukernavn/passord: `aap`/`pengerpenger`.
