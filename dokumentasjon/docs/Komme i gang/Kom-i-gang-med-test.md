# Kom i gang med test

For å teste en AAP søknad, trenger en testperson i [ID-porten](https://eid.difi.no/nb/id-porten) som ikke har et ekte fødselsnummer,
og ha [nivå 4 tilgang](https://www.nav.no/no/nav-og-samfunn/samarbeid/hjelpemidler/digitalisering-av-hjelpemiddelomradet/sikker-innlogging)
for å kunne sende inn en søknad. 
Dette får en enten ved å bruke listen til [Digidir testbrukere](https://docs.digdir.no/docs/idporten/idporten/idporten_testbrukere.html)
eller opprette testbrukeren i [Dolly]() som er vårt eget system for generering av personer med familer og spesielle kriterier.
</br></br>
For å verifisere at dokumenter havner i arkivet, trenger en å opprette en *fiktiv saksbehandler* med riktige rettigheter i [Ida](https://ida.intern.nav.no/)

# Test i teamet

litt om hva vi tester og hvordan vi tester..........

## Våre testbrukere
For å gjøre det enkelere for testing, har vi [*våre egne delte testbrukere*](../dokumentasjon/docs/Test/vaare_testbrukere.md) som vi bruker sammen.

## Test i andre systemer
For å verifisere at søknadene har havnet i arkivet trenger en tilgang til [Gosys]() og [Arena]().

## Våre testmiljøer

Teamet vårt, benytter vi 2 testmiljøer *Labs* og vårt utviklingsmiljø [Dev](https://aap-soknad.dev.nav.no/aap/soknad/standard)
Lenkene til dette finner du snarvei til i toppmenyen på [internkanalen](https://nav-it.slack.com/archives/C032Z3UU4TU).

