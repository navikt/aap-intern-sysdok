# Test av ny ruting

## Litt om Test

Da vi gikk live med søknaden, var verifikasjonen at dokumentene for 
testperson dukket opp på bruker i gosys + manuell verifikasjon i joark. 
Det ble begrenset til dette, fordi jfr-arena ikke kjørte i q1 miljøet.

## Verifikasjonen for aap-fordeler nå vil være at vi får:
* Opprettet manuell journalføringsoppgaver på lokalenhet i Gosys.
* Opprettet automatisk journalføringsopgpave i Gosys (teknisk) og ny sak med tilknyttet oppgave i Arena.
* Opprettet forvaltningsoppgaver når en ikke klarer å avklare geografisktilknytning (lokalkontor).

## Verifikasjon for søknad:

Opprettet Arena sak og oppgave i Arena (automatisk journalføringsoppave i Gosys) eller 
manuell journalføringsoppgave i GoSys hvis bruker allerede har sak i Arena,
Arena-oppgave dersom journalposten skal automatisk journalføres, 
må det opprettes riktig oppgave i Gosys som er dokumentasjon på at vi har automatisk journalført.

### Verifikasjon av kanaler
En kan enten sende digitalt eller pr post, dette kalles for kanaler.
* Begge kan emuleres via [dolly](https://dolly.ekstern.dev.nav.no/gruppe).
* Digitale søknader kan sendes inn via søknaden i preprod.

### Verifikasjon av ettersendelser
En kan sende inn ettersendelser via den digitale søknaden (påkrevde vedlegg utløst av svar i søknaden) 
eller via **mine arbeidsavklaringspenger**

### Verifikasjon av opprettelse av oppgvaver
(PT gjelder aap-fordeler bare aap søknaden og ettersendelse)
*Verifikasjon av forvaltningsoppgave er litt mer tricky. Der må vi sørge for at testpersonene vi har, 
eksempelvis ikke har en geografisk tilknytning. 
Det finnes sikkert andre scenarioer her, men det kan vi sikkert få hjelp til å finne ut av med #team-intern-samhandling.
I dag utgjør dette 3% av oppgavene som opprettes av jfr-manuell.

## Annen testing 
Ellers så tester vi også i prod. DVS vi kjører rutingen, men oppretter ikke oppgaver her eller der, men logger at den skulle gjort det.
Vi vil da kunne få ut data og fikse gode forretningsmessige målepunkter og luke ut litt bugs før vi kjører en test.Testmiljø:
* Det ukjente vil vi kunne avdekke ved å gå live uten å gjøre noe. Vi håper altså på å finne bugs før vi går live på denne måten.

### Produksjonssetting
Søknaden kjører i dag i q1 miljøet, alle systemene vi forholder oss til er også i det miljøet, 
men det er også en fordel at jfr-arena og jfr-manuell IKKE kjører i det miljøet.

Når vi prodsetter, trenger vi bare at jfr-arena fjerner 2 linjer i 1 fil før vi går live. 
Da vil vi kunne plukke opp alle innkommende dokumenter og overvåke at alt går som det skal. 
jfr-manuell vil heller ikke kreve noe, da vi ikke gir dem beskjed om at det ligger en journalpost som skal håndteres av dem. 
Sikkerhetsnett eksisterer: Sitat fra Ida Stenerud i dokument: 
“Det er applikasjonen doksikkerhetsnett som sørger for at alle journalposter har oppgaver, 
også når de blir glemt av fagsystemet som skulle laget oppgaven.” 
* DVS dersom en journalpost faller mellom 2 stoler, så fikses dette.oppsummert: 
Kompleksiteten rundt testing er minimal og vi har kontroll på faktorene.
