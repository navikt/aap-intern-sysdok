---
sidebar_position: 1
---

# Overordnet oversikt

Hensikten med de ulike løsningene Team søknad og meldeplikt leverer, er å sikre kritisk funksjonalitet i dialog mellom NAV og innbyggere på ytelsen Arbeidsavklaringspenger (AAP).

Vårt fokus er å skape brukergevinster, og å gjøre brukerreisen helhetlig god.

Noen kontaktpunkter er til for å muliggjøre saksbehandling, andre er til for å gi god veiledning og informasjon til innbyggere.

## Prosesser og funksjoner

### Kontaktpunkt Søknad

- Innsending av hovedsøknad for AAP
- Mulighet for å gjennopta en påbegynt, men ikke innsendt søknad
- Legge ved dokumentasjon til søknad
- Kvitteringsside som bekrefter hva som har blitt sendt inn
- [Brukernotifikasjoner](https://navikt.github.io/dittnav-brukernotifikasjoner-intro/) som varsler bruker om påbegynt søknad og manglende dokumentasjon

Søknaden arkiveres pt både som pdf og JSON i JOARK.

### Kontaktpunkt Mine AAP

- Vise innsendte søknader og manglende vedlegg
- Vise innsendt dokumentasjon
- Inngang til Ettersendelse
- Informasjon om veien videre etter innsendt søknad
- Inngang til "Skriv til Oss"

### Kontaktpunkt Ettersendelse

- Ettersende dokumentasjon som er påkrevd basert på svar gitt i søknaden
- Ettersende generell dokumentasjon tilknyttet sak
- Inngang til Ettersendelse fra både Mine AAP og Søknadsveiviseren
- [Brukernotifikasjoner](https://navikt.github.io/dittnav-brukernotifikasjoner-intro/) som varsler bruker om manglende dokumentasjon

## Informasjonsmodell

Denne tegningen viser en oversikt over hvilke informasjonstyper vi har i datamodellen. Den viser hvilken informasjon som samles inn og tas vare på og til hvilke formål.

TODO: Oppdatere informasjonsmodell i mural, legge til tegnforklaring / farger, legge ved eksempler på de ulike informasjonstypene.

Eksempel: Informasjon om innsendte vedlegg i søknaden tas vare på slik at vi vet hvilke vedlegg som mangler, og kan vise dette i Mine AAP.

![Informasjonsmodell](../bilder/Informasjonsmodell-11-22.png)

<!---
Tegningen er hentet herfra
https://app.mural.co/invitation/mural/navdesign3580/1663231311908?sender=sturlehelland7470&key=9cf412d2-8755-499a-8a37-e32922515281
--->

## Tekniskbeskrivelse

Løsningen bygger på [NAIS](https://nais.io) som er kjøreplattform for Google cloud.

| Del av løsning | Teknologi                                                                |
| -------------- | ------------------------------------------------------------------------ |
| Klient         | NEXT.js, Typescript                                                      |
| Baksystem      | Java med Spring boot , kotlin                                            |
| Infrastruktur  | Postgress database for forretningslogikk og GC Buckets for mellomlagring |

### Tekniske tjenester

Tjenester som konsumeres

- Innlogging via [Id-porten](https://eid.difi.no/en/id-porten)
- PDL - Persondatatjeneste for NAV og Skatt
- KRR - Kontakt og reservasjonsregisteret
- Arkivtjeneste for oppslag i NAVS dokumentarkiv
- Brukernotifikasjoner for [pålogget bruker på nav.no](https://nav.no)

Systemene tilbyr ingen eksterne tjenster, kun interne i dialog med hverandre.

### Databasemodell

Som figuren viser er modellen delt i 3:

- Håndtering av søknadslogikk og påkrevde vedlegg som er sendt inn eller mangler
- Håndtering av brukernotifikasjoner tilknyttet søknader, både oppgaver og beskjeder

![databasemodell](../bilder/eksternebeskjednotifikasjoner.png)
