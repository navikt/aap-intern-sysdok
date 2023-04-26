# Test av ny ruting

## Litt om Test

Da vi gikk live med søknaden, var verifikasjonen at dokumentene for 
testperson dukket opp på bruker i gosys + manuell verifikasjon i joark. 
Det ble begrenset til dette, fordi jfr-arena ikke kjørte i q1 miljøet.

## Verifikasjonen for aap-fordeler nå vil være at vi får:
* Opprettet manuell journalføringsoppgaver på lokalenhet i Gosys.
* Opprettet automatisk journalføringsopgpave i Gosys (teknisk) og ny sak med tilknyttet oppgave i Arena.
* Opprettet forvaltningsoppgaver når en ikke klarer å avklare geografisk tilknytning (lokalkontor).

## Verifikasjon for søknad:

Opprett Arena sak og oppgave i Arena eller manuell journalføringsoppgave i GoSys hvis bruker allerede har sak i Arena.
- Dersom det opprettes oppgave i arena, skal det også opprettes en automatisk journalførings-oppgave i gosys på enhet 9999. Dette for sporbarhet.

### Verifikasjon av søknadsdato
* Når bruker har sendt inn en søknad/dokument, må vi sjekke at innsendingsdato samsvarer med dato for mottatt dokument i Gosys.

### Verifikasjon av kanaler
En kan enten sende digitalt eller pr post, dette kalles for kanaler.
* Begge typer kan genereres via [dolly](https://dolly.ekstern.dev.nav.no/gruppe).
* Digitale søknader kan sendes inn via [søknaden i preprod](https://aap-soknad.dev.nav.no/aap/soknad).

### Verifikasjon av ettersendelser
En kan sende inn ettersendelser via den digitale søknaden (påkrevde vedlegg utløst av svar i søknaden) 
eller via [mine arbeidsavklaringspenger](https://aap-innsyn.dev.nav.no/aap/mine-aap/).

## Verifikasjon av saksbehandling
For å verifisere at oppgaver blir opprettet, trenger en tilgang til Arena og Gosys i Q1.
Test-saksbehandlere opprettes i [Ida](https://ida.intern.nav.no).

### Verifikasjon av opprettelse av oppgaver
* Automatisk journalføring medfører opprettelse av oppgave i Arena.
* Manuell journalføring medfører opprettelse av journalføringsoppgave i Gosys.

#### Hva er fordelingsoppgaver?
En fordelingsoppgave er en oppgave som lages når journalposten eller personregisteret(PDL) mangler informasjon. 
Eksempelvis kan en mangle fødselsnummer, geografisk tilknytning eller annen iformasjon som NAV trenger for å finne riktig enhet.
Disse oppgavene utgjør ca 3% av alle oppgaver som opprettes og settes til en bestemt forvaltningsenhet i NAV.

* Verifikasjon av fordelingsoppgave er litt mer tricky. Der må vi sørge for at testpersonene vi har, 
eksempelvis ikke har en geografisk tilknytning. 


## Testing i produksjon 
Ellers så tester vi også i prod. DVS vi kontrollerer fordelingen på AAP og [logger dette med grafer](https://grafana.nais.io/d/0XRVGY-Vz/routing?orgId=1&refresh=30s). Det opprettes ikke oppgaver, men logges hvor den skulle blitt opprettet.
Vi vil da kunne få ut data og fikse gode forretningsmessige målepunkter og luke ut litt bugs før vi tester i Q1.
* Vi håper altså på å finne bugs før vi går live på denne måten. 

### Produksjonssetting
Søknaden kjører i dag i q1 miljøet, alle systemene vi forholder oss til er også i det miljøet.

* Når vi prodsetter, trenger vi bare at jfr-arena fjerner 2 linjer i 1 fil før vi går live. Da vil vi kunne plukke opp alle innkommende dokumenter og overvåke at alt går som det skal. 
* jfr-manuell vil heller ikke kreve noe, da vi ikke gir dem beskjed om at det ligger en journalpost som skal håndteres av dem. 
* Sikkerhetsnett eksisterer: Sitat fra Ida Stenerud i dokument: 
“Det er applikasjonen doksikkerhetsnett som sørger for at alle journalposter har oppgaver, 
også når de blir glemt av fagsystemet som skulle laget oppgaven.” 
* DVS dersom en journalpost faller mellom 2 stoler, så fikses dette.oppsummert: 
Kompleksiteten rundt testing er minimal og vi har kontroll på faktorene.

#### Manuell verifikasjon
En saksbehandler i POet får nasjonal tilgang for en periode, for kontroll og verifikasjon.
