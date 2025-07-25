# Teknisk beskrivelse
[Grafana](https://grafana.nav.cloud.nais.io/d/bcb27950-0648-4940-9cfb-3137d9b0405c/aap-api?orgId=1)

Api Ekstern:
[Github](https://github.com/navikt/aap-api) | [Swagger](https://aap-api.ekstern.dev.nav.no/swagger)

Api Intern: [Github](https://github.com/navikt/aap-api-intern) | [Swagger](https://aap-api.intern.dev.nav.no/swagger-ui/index.html)

Arena Oppslag: [Github](https://github.com/navikt/aap-arenaoppslag) 

## Autentisering

### Maskinporten

I nais-yaml-fila så definerer man Maskinporten-scopes og knytter disse til konsumentens org.nummer. Dvs at alle nye konsumenter må oppgi orgnr.

```yaml
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        - name: "scope1"
          enabled: true
          product: "aap"
          consumers:
            - name: "konsument1"
              orgno: "11111111"
            - name: "konsument2"
              orgno: "22222222"
        - name: "scope2"
          enabled: true
          product: "aap"
          consumers:
            - name: "konsument3"
              orgno: "33333333"
            - name: "konsument4"
              orgno: "44444444"
```

Konsumenten må også legges til i [Consumers-fila](https://github.com/navikt/aap-api/blob/main/app/main/api/util/Consumers.kt)

Scope må legges til i [Config-fila](https://github.com/navikt/aap-api/blob/main/app/main/api/util/Config.kt)

```kotlin
    data class ScopeConfig(
        val scope1: String= "nav:aap:scope1",
        val scope2: String = "nav:aap:scope2"
    )
```

Ktor-auth må legges til i [App.kt](https://github.com/navikt/aap-api/blob/main/app/main/api/App.kt)

```kotlin
    install(Authentication) {
        maskinporten(MASKINPORTEN_SCOPE1, config.oauth.maskinporten.scope.scope1, config)
        maskinporten(MASKINPORTEN_SCOPE2, config.oauth.maskinporten.scope.scope2, config)
    }
```

Hver nye route som skal tilhøre en konsument må da autentiseres med rett auth.

```kotlin
    authenticate(MASKINPORTEN_SCOPE1)
```

## Eksterne avhengigheter

API'ene henter i dag data fra Arena. Arena er ikke uten videre
tilgjengelig i GCP, så vi har satt opp en [proxy](https://github.com/navikt/aap-arenaoppslag) 
som har ansvar for å gjøre oppslag i Arena. Denne appen kjører i
FSS og har en kobling til dedikerte views i Arena-databasen.
