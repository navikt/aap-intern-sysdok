# Systemer som oppretter eller ferdigstiller journalpostene selv på tema AAP
Begreper:
- Å opprette brukes for å beskrive oppretelsen av en journalpost på en person
- Å ferdigstille benyttes som begrep for å beskrive det å opprette oppgave for journalpost i Arene eller Gosys.

## Ny ruting etter Produksjonsetting av AAP-Fordeler
| Applikasjon                                           | Team                                                                           | Kanaler          | Oppretter | Ferdigstill | Kommentar                                      |
|-------------------------------------------------------|--------------------------------------------------------------------------------|------------------|-----------|-------------|------------------------------------------------|
| meldekort-api                                         | Meldekort                                                                      | NAV_NO           | x         | x           | Fortsetter håndtering av meldekort             |
| srveux-app                                            | [ESSSI](https://teamkatalog.nav.no/team/950f0e82-59cb-4dc9-9522-df693b8c76f0)  | EESSI            | x         | x           | Fortsetter håndtering av utvekslede dokumenter |
| [AAP-Fordeler](https://github.com/navikt/aap-routing) | [PO AAP](https://teamkatalog.nav.no/area/fd6b7cda-0659-46c8-ad3e-a78f96689022) | SAKAN-IM, NAV_NO | x         | x           | Tatt over for jfr-arena og jfr-manuell         |

### Utvidet kommentar

- jfr-arena vil kjøre i paralell i en periode før den slås av. Vil påvirke i perioden, men uten alvorlige konsekvenser.
- jfr-manuell vil fortsette å kjøre, dette vil ikke påvirke ny fordeling for aap, da den håndterer både automatisk og manuell.
- Meldekort er i dag en felles løsning for temaene AAP og DAG. For relativt kort tid siden begynte de å arkivere meldekortene i arkivet. Ansavr for løsningen ligger i PO Arbeid med [prodkutleder](https://teamkatalog.nav.no/resource/V136052) i Team Dagpenger.
- EESSI utveksler infromasjon med EU-land og vil fortsette å håndtere dette domenet selv.
- Det er også et sikkerhetsnett som fanger opp nye journalposter som har ligget urørt i over en uke. Dette styres av Team Dokumentløsninger.

## Historisk ruting

Oversikten viser applikasjoner som ruter på tema Arbeidsavklaringspenger. Det er flere team involvert i dette og dette er oversikten over dem vi har fått kartlagt basert på uttrekk.


| Applikasjon               | Team                                                                          | Kanaler            | Oppretter | Ferdigstill | Kommentar                              |
|---------------------------|-------------------------------------------------------------------------------|--------------------|-----------|-------------|----------------------------------------|
| Gosys                     | ISA                                                                           | EKST_OPPS          | x         | x           | ?                                      |
| journalforing-frontend    | ISA                                                                           | SKAN_IM            | ?         | x           | ?                                      | 
| jfr-arena                 | ISA                                                                           | SKAN_IM  NAV_NO    | -         | x           | KRUT- Automatisk journalføring i Arena |
| klage-arkiver-journalpost | Klage                                                                         | NAV_NO             | x         |             |                                        |
| skanmotovrig              | ?                                                                             | SKAN_IM            | x         |             |                                        |
| srvskanmotreferanse       | ?                                                                             | SKAN_IM            | x         |             |                                        | 
| meldekort-api             | Meldekort                                                                     | NAV_NO             | x         | x           |                                        |
| srveux-app                | [ESSSI](https://teamkatalog.nav.no/team/950f0e82-59cb-4dc9-9522-df693b8c76f0) | EESSI              | x         | x           | Må avklare nærmere                     | 
| srvfamilie-ks-opps        | Familie?                                                                      | NAV_NO             | x         |             |                                        | 
| soknadsarkiverer          | Fyllut-sendinn                                                                | NAV_NO             | x         |             |                                        | 
| Salesforce                | teamcrm                                                                       | NAV_NO NAV_NO_CHAT | x         | x           | Samtaler på Nav.no                     | 
| soknad-api                | PO AAP                                                                        | NAV_NO             | x         | -           | Vår egen søknad og mineAAP             | 

