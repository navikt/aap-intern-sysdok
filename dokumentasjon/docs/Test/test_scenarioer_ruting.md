

## Test scenarier for AAP-fordeler

**Forutsetning**

For å teste dette, må brukeren (fiktivt fødselsnummer) legges til i Arena. Det skjer ingen automatisk import av disse brukerene.
Kontakt #arena i slack for å få dette gjort.

## Verifisering av korrekt ruting

For verifikasjon trenger en å lage veileder og en NAY saksbehandler på kontorene som skal motta oppgavene.

### Saksbehandlere og veiledere opprettet i IDA

Beskrivelsen av brukerne krever kjennskap til [arbeidsfordelingen i NAV](https://norg2-frontend.intern.nav.no/#/) og [Enheter i NAV](https://norg2-frontend.intern.nav.no/#/enhet/enhetsok)
Veilder og saksbehandler må da har rettigheter til å logge seg på Gosys og i Arena.

* En veileder må da ha samme tilganger som en vanlig veileder ved mottakende lokalkontor.
* En saksbehandler må da ha samme tilganger som en vanlig saksbehandler for koblet NAY kontor.
* En saksbehandler må da ha samme tilganger som en saksbehandler med tilgang til brukere med fortrolig og strengt fortrolig adresser.
* En saksbehandler med tilgang til fordelingsoppgaver [Fordeling](https://norg2-frontend.intern.nav.no/#/enhet/4303)
* En saksbehandler med tilgang til alt (fortrolig, strengt fortrolig, nasjonal tilgang og egen ansatt som en kontrollbruker)

### Brukere som skal sende inn

En trenger forskjellige brukere som sender inn. De forskjellige brukerne må da være både normale brukere, 
ha strengt fortrolig eller fortrolig adresse, og noen brukere bør mangle geografisk lokasjon (utløser opprettelse av forvaltningsoppgave.)

* En bruker sender inn en søknad for første gang.
* En bruker ettersender vedlegg den har blitt pålagt å sende inn basert på svar i søknaden.
* En bruker sender inn vedlegg "annet" som den har mulighet til via mine aap.

#### Bruker A - Ny søker
Bruker er en person som aldri har søkt om AAP tidligere, Den bor i eksempelvis Vestre Aker og oppgaven tilknyttet søknaden skal da ende opp i Arena.
Send inn en AAP søknad, velg svar på et spørsmål som utløser dokumentasjonsbehov. Verifiser at det opprettes oppgave i Arena for 1. gangs søknad for bruker A
Send inn påkrevd vedlegg. Verifiser at det opprettes oppgave i Arena for obligatorisk ettersendelse på 1.gangssøknad for bruker A

#### Bruker B - Har alt søkt om AAP
Brukeren er en bruker som har en aktiv sak i Arena, den har alt en sak som blir behandlet. HEN bor i eksempelvis Vestre Aker. Denne brukeren verifiseres ved at det oprettes manuelle journalføringsoppgaver.
* Send inn ny søknad. verifiser at denne kommer som manuell journalføringsoppgave i Gosys
* Send inn ny ettersendelse, denne skal da oppstå som manuell journalføringsoppgave i Gosys

Forutsetning for bruker B
* bruker B må ha en opprettet bruker i Arena
* bruker må ha en aktiv sak i Arena

#### Bruker C - Fortrolig / strengt fortrolig
Brukeren kan bo hvor som helst i Norge, men siden den har hemmelig adresse, er det NAV Vikafossen som skal behandle oppgavene uansett
samme som  bruker A

#### Bruker D - Fortrolig / strengt fortrolig - Har alt søkt om AAP
Brukeren kan bo hvor som helst i Norge, men siden den har hemmelig adresse, er det NAV Vikafossen som skal behandle oppgavene uansett
samme som bruker B

#### Bruker E - Skjerming
Dersom bruker er ansatt i NAV eller nært familiemedlem er ansatt, skal det behandles basert på egne regler.

