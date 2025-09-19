# Klage

Klager på AAP-vedtak behandles i to instanser: først i fagsystemet, deretter hos Nav Klageinstans i Kabal.

Samarbeidskanal på slack med Kabal: `#aap-kabal-integrasjon`

## Klagebehandling i Kelvin

Når en klage dukker opp i postmottaket, vil den bli journalført på saken klagen gjelder i Kelvin. Man vil måtte sette
kravdato, og hvorvidt klagen tilhører en eksisterende klage, eller om det skal opprettes en ny behandling av type <i>
Klage</i>.

Det kan være flere åpne klagebehandlinger på en sak.

Resultatet av klagebehandlingen vil føre til avslått på formkrav, omgjøring, delvis omgjøring eller opprettholdelese.

### Formkrav

Dersom klagen ikke overholder formkravene (på annet enn ikke overholdt frist), vil det bli sendt ut et forhåndsvarsel
til bruker.
Bruker må da sende inn ny klage innen fristen som er satt i forhåndsvarselet. Hvis dette ikke blir gjort, avvises klagen
på formkrav, og brev blir sendt til bruker.

### Omgjøring

Dersom klagen tas til følge, vil det blir automatisk opprettet revurdering på vedtaket det klages på, med valgte
hjemler (mappet til årsaker).

### Opprettholdelse

Dersom førsteinstans ikke tar klagen til følge, vil det bli opprettet en klagebehandling i Kabal for videre behandling.
Det sendes ut brev til bruker om at vedtaket opprettholdes.

### Delvis omgjøring

Det vil bli opprettet revurdering for valgte hjemler for omgjøring, og hjemler for opprettholdelse vil bli sendt videre
til Kabal for videre behandling. Brev om hjemlene som er opprettholdelse vil bli sendt til bruker.

## Svar fra Kabal

Behandlingsflyt lytter på hendelser fra kabal på `klage.behandling-events.v1`.
Dersom det finnes en klagebehandling som matcher kildereferanse på hendelsen, opprettes det en behandling av type `SvarFraAndreinstans`.

:::info

Dersom en hendelse kommer inn med kilde `KELVIN`, men med en kildereferanse som vi enten ikke gjenkjenner, eller som ikke kan parses, opprettes det en jobb av type `hendelse.kafka.feilhåndterer`. Da vil konsumeringen fortsette. Denne jobben håndteres videre i `paw-patrol`. Som oftest innebærer dette at det har skjedd en feil på Kabal sin side. De må da gjøres oppmerksom på feilen i `#aap-kabal-integrasjon`. Jobben kan avbrytes dersom det er avklart at ny melding med korrigert kilde eller kildereferanse resendes.

Øvrige deserialiseringsfeil vil stoppe konsumeringen, og må håndteres ved å opppdatere skjema.

:::

Her må saksbehandler ta stilling til konsekvensen av svaret fra Kabal. Dette kan typisk være å trigge en revurdering dersom Kabal mener at vedtak skal omgjøres, gjøre ingenting dersom Kabal er enig, eventuelt opprette ny klagebehandling.
Det er én behandling av type `SvarFraAndreinstans` per hendelse. Det kan komme flere hendelser for samme klagebehandling.


