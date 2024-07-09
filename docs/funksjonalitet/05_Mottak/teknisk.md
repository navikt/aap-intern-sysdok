# Teknisk beskrivelse

## Repo

Repo kan finnes [her](https://github.com/navikt/aap-mottak).

## Oppsett av Kafka

Kafka-konfigen og klasser for å sette opp Kafka kan finnes i 
[aap-libs](https://github.com/navikt/aap-libs). Denne kan hentes
inn som avhengigheter.

Kafka startes da fra [App](https://github.com/navikt/aap-mottak/blob/main/app/main/mottak/App.kt) 
når appen starter:
```kotlin
fun Application.server(
    config: Config = Config(),
    kafka: Streams = KafkaStreams(),
) {
    val prometheus = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)

    install(MicrometerMetrics) {
        registry = prometheus
        meterBinders += LogbackMetrics()
    }

    environment.monitor.subscribe(ApplicationStopping) {
        kafka.close()
    }

    val topology = MottakTopology(config, prometheus)

    kafka.connect(
        topology = topology(),
        config = config.kafka,
        registry = prometheus,
    )
}
```

### Topologien

Topologien er ganske enkel:
```kotlin
    consume(topics.journalfoering) // Konsumer meldinger på topic
        .filter { record -> record.temaNytt == "AAP" } // Filtrer bort alt som ikke er AAP
        .filter { record -> record.journalpostStatus == "MOTTATT" } // Alle journalføringshendelser legges på topic, men vi er bare interessert i nye
        .filter { record -> record.mottaksKanal !in listOf("EESSI") } // Filtrer bort visse kommunikasjonskanaler
        .processor(MeterConsumed(registry)) // Metrikker
        .map { record -> saf.hentJournalpost(record.journalpostId) } // Gjør om hendelse til en representasjon av journalposten
        .filter { jp -> jp.harFortsattTilstandMottatt() } // Ekstra sikring for å fjerne ting som kan ha endret status i mellomtiden
        .map { jp -> enhetService.enrichWithNavEnhet(jp) } // Legg på behandlende enhet på journalpost for videre ruting
        .forEach(::håndterJournalpost) // Send journalpost til rett sted
```

## Eksterne avhengigheter

- JOARK-topic: Alle hendelser i JOARK (arkivering, journalføring, endring, kassering...) legges på et topic som vi konsumerer.
- SAF: GraphQL-oppslag som vi bruker for å gjøre om hendelsen på JOARK-topicet til en faktisk journalpost med innhold (hendelsen inneholder for eksempel ikke personident).
- Enhetsoppslag består av 3 avhengigheter
  - PDL: For å hente geografisk tilhørighet (gt) og adressebeskyttelse
  - Skjerming: For å finne ut om personen er ansatt i NAV og skal skjermes
  - NORG: Kombinerer gt, skjerming og adressebeskyttelse for å finne riktig NAV-enhet
- Behandlingsflyt: Brukes for å finne eller opprette sak knyttet til søknad, samt sende over søknadsdata
- JOARK-rest: Brukes for å oppdatere metadata på journalpost, samt endelig journalføre
- FSS-proxy: Brukes for å kontakte Arena sine SOAP-endepunkt ifm sjekk av sak
- Oppgave-API: Brukes for å opprette oppgaver som kommer i GOSYS, dersom det trengs