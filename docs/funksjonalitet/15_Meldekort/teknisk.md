# Teknisk beskrivelse

AAP-saker i Arena benytter seg av den generelle meldekortløsningen. Det er en egen meldekortløsning for Kelvin-saker.
## Den generelle meldekortløsningen

Den generelle løsningen består av to tjenester:
- https://github.com/navikt/meldekort-frontend
- https://github.com/navikt/meldekort-api

Og benytter følgende fellestjenester:
- For innsending av meldekort: https://github.com/navikt/meldekortkontroll-api
- For informasjon om meldekort: https://github.com/navikt/meldekortservice

Informasjon om meldekort finnes på nav.no. For å vite hvilken meldekortløsning det skal lenkes til, kaller meldekort-frontend `/ansvarlig-system-felles` i Kelvin sin meldekort-backend.
For at man skal rutes til Kelvin-meldekortet, må det ha blitt sendt minst én stoppet-hendelse fra behandlingsflyt (dette skal skje med en gang førstegangsbehandlingen er blitt startet), slik at meldekort-backend vet om saken.
Videre må tidspunktet man gjør forespørselen være innenfor rettighetsperioden for at `Kelvin` skal returneres. Ellers rutes man til felles meldekortløsning.

## Kelvins meldekortløsning
Består av to tjenester:
- Frontend: https://github.com/navikt/aap-meldekort
- Backend: https://github.com/navikt/aap-meldekort-backend

Kelvin sin meldekort-backend mottar hendelser fra behandlingsflyt med meldeperioder, opplysningsbehov og annen informasjon fra behandlingen når den stopper opp. Ut ifra dette blir meldekort opprettet og tilgjengeliggjort for utfylling. Eventuelt varsel til bruker sendes ved å publisere til Kafka-topicet `brukervarsel.topic`.

Det opprettes journalposter for innsendte meldekort, som plukkes opp og journalføres av postmottak, og rutes videre til behandlingsflyt der de behandles. Les mer om hvordan meldekortbehandlingene fungerer [her](../06_Behandlingsflyt/vedtak.md#meldekort-behandling).

### UtfyllingFlyt (TODO)
