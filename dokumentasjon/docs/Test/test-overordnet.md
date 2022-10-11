---
sidebar_position: 1
---

#Overordnet om test

# Våre tester

## Test i kode

### Enhetstester

_Enhetstesting_ er en kontinuerlig prosess som pågår under hele utviklingsfasen.
Måten en gjennomfører enhetstesten på, skal sikre en uavhengig vurdering av enhetstestresultatet og der
det er hensiktsmessig skal enhetstesten gjennomføres så automatisert som mulig.

Enhetstest skal omfatte test av alle kodelinjer i nyutviklet kode.
Enhetstest har fokus på ny og endret kode i den enkelte modulen uavhengig av andre moduler eller grupper
av andre moduler.

### Integrasjonstest

Formålet er under integrasjonstesten å teste funksjonaliteten med sammensatte moduler.

Eksempler er test av interne grensesnitt mellom våre egne applikasjoner og grensesnitt mot registertjenester som PDL (persondatatjester) og KRR for selve søknaden og utlisting av dokumenter for inbygger på mine arbeidsavklaringspenger.

## Systemtesting
Team Innbygger tester systemene på vegne av en som søker om arbeidsavklaringspenger fra søknad blir påbegynt til den er mottatt og arkivert i arkivet. 

I forbindelse med søknadsprosessen tester vi funksjoner som for eksempel at søker skal kunne gjenoppta en påbegynt, men ikke innsendt søknad, at de skal kunne ettersende vedlegg, at de får varsel om manglende vedlegg og innsending av dette. 

Ettersendelse på tema arbeidsavklaringspenger blir også håndtert via Mine arbeidsavklaringspenger og generell ettersendelse på tema. 

### Fortrolig og strengt fortrolige innbyggere
For personer som er i kategoriene fortrolig og strengt fortrolig tester vi at de ikke kommer opp noe informasjon tilknyttet deres status. 

Dersom søker har barn i disse kategoriene, håndteres det i henhold til skjerming. 


## Brukertesting

Team Innbygger tester med ekte brukere under utvikling av nye innbyggerflater, og benytter løpende brukerundersøkelser på eksisterende flater. Vi bruker Test-min-løsning i tillegg til ordinær brukertesting. Vi har som mål å alltid brukerteste før release av større endringer.

I tillegg bruker vi brukerundersøkelser for personbrukere via Hotjar, Task Analytics og Amplitude, som målepunkter for brukerverdi og brukeropplevelse.
Når det gjelder interne brukere (våre kolleger i NAV), har vi brukerpaneler fast annenhver uke med NAV-kontor og NAY. 

## Testdata
NAVS testmiljø benytter bare fiktive brukere og fiktive saksbehandlere med riktige rettigheter. Brukerene opprettes enten i Dolly som er internt system i NAV for å opprette personer med fiktive fødselsnumre og familier. Saksbehandlere opprettes i Ida som er internt system for å gi fiktive saksbehandlere rettigheter i saksbehandlingssystemer.
