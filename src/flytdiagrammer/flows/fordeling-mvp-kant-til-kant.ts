import type { DetailBlock, Flow } from "./types.ts";

const sendTilKelvin: DetailBlock[] = [
  {
    type: "text",
    content:
      "`AvklarFordelingSteg` lagrer en `AvklarFordelingVurdering` med `system = KELVIN`, vurdert av systembrukeren. Steget lager aldri et avklaringsbehov.\n\nNeste steg, `FordelingVideresendSteg`, oppretter en `Journalføring`-behandling og legger den i kø. Søknaden journalføres deretter på en sak i Kelvin.",
  },
  {
    type: "code",
    language: "sql",
    title: "Lagre vurderingen (Postgres i postmottak)",
    code: `INSERT INTO AVKLAR_FORDELING_VURDERING (VURDERT_AV, FAGSYSTEM, OPPRETTET_TID, KOMMENTAR)
VALUES (:systembruker, 'KELVIN', :naa, 'Automatisk vurdert fordeling');

UPDATE AVKLAR_FORDELING_GRUNNLAG
   SET AKTIV = FALSE
 WHERE BEHANDLING_ID = :behandlingId
   AND AKTIV = TRUE;

INSERT INTO AVKLAR_FORDELING_GRUNNLAG (BEHANDLING_ID, AVKLAR_FORDELING_VURDERING_ID)
VALUES (:behandlingId, :vurderingId);`,
  },
];

const sendTilArena: DetailBlock[] = [
  {
    type: "text",
    content:
      "`AvklarFordelingSteg` lagrer en `AvklarFordelingVurdering` med `system = ARENA`, vurdert av systembrukeren.\n\nNeste steg, `FordelingVideresendSteg`, kaller `ArenaVideresender.videresendJournalpostTilArena`. For en søknad legger den jobben `SendSøknadTilArenaJobbUtfører` i kø. Jobben oppretter en STARTVEDTAK-oppgave i Arena og journalfører søknaden på Arena-saken. Mangler enhet, eller har personen allerede en aktiv sak i Arena, går søknaden til manuell journalføring i Gosys.",
  },
  {
    type: "code",
    language: "sql",
    title: "Lagre vurderingen (Postgres i postmottak)",
    code: `INSERT INTO AVKLAR_FORDELING_VURDERING (VURDERT_AV, FAGSYSTEM, OPPRETTET_TID, KOMMENTAR)
VALUES (:systembruker, 'ARENA', :naa, 'Automatisk vurdert fordeling');

UPDATE AVKLAR_FORDELING_GRUNNLAG
   SET AKTIV = FALSE
 WHERE BEHANDLING_ID = :behandlingId
   AND AKTIV = TRUE;

INSERT INTO AVKLAR_FORDELING_GRUNNLAG (BEHANDLING_ID, AVKLAR_FORDELING_VURDERING_ID)
VALUES (:behandlingId, :vurderingId);`,
  },
];

const maksdatoForklaring: DetailBlock = {
  type: "text",
  content:
    "Ordinær kvote og forlengelse\n\nAAP gis i utgangspunktet i opptil tre år (folketrygdloven § 11-12 første ledd). Det er den ordinære kvoten. Etter § 11-12 andre ledd kan perioden forlenges med opptil to år, altså til sammen fem år.\n\nArena lagrer to maksdatoer per vedtak i viewet `v_vedtak_maxdato`. Arenaoppslag leser dem i spørring 2 under «Hent siste løpende Arena-vedtak»:\n\n`max_dato` blir `maxdatoOrdinaer`: datoen de tre ordinære årene er brukt opp.\n\n`max_unntak_dato` blir `maxdatoUnntak`: datoen forlengelsen er brukt opp, det vil si etter fem år til sammen. Den er tom hvis personen ikke har fått forlengelse.\n\n`maxdatoAap` er `maxdatoUnntak` hvis den finnes, ellers `maxdatoOrdinaer`. Det er den siste datoen personen kan få AAP i Arena.",
};

const arenaKoder: DetailBlock = {
  type: "text",
  content:
    "Koder fra Arena\n\nNavnene kommer fra kodetabellene i Arena: `aktivitetfase`, `vedtaktype`, `vedtakstatus`, `rettighettype` og `vedtakfaktatype`.\n\nAktivitetsfase (`aktfasekode`): `UA` Under arbeidsavklaring, `AU` Arbeidsutprøving, `UVUP` Vurdering for uføre, `FA` Ferdig avklart, `SPE` Sykepengeerstatning.\n\nVedtakstype (`vedtaktypekode`): `O` Ny rettighet, `E` Endring, `G` Gjenopptak, `S` Stans.\n\nVedtaksstatus (`vedtakstatuskode`): `OPPRE` Opprettet, `MOTAT` Mottatt, `REGIS` Registrert, `INNST` Innstilt, `IVERK` Iverksatt, `AVSLU` Avsluttet.\n\nUtfall (`utfallkode`): `JA` Ja, `NEI` Nei, `AVBRUTT` Avbrutt / ikke behandlet, `TRUKK` trukket.\n\nRettighet (`rettighetkode`): `AAP` Arbeidsavklaringspenger, `AA115` § 11-5 nedsatt arbeidsevne, `KLAG1` og `KLAG2` klage, `ANKE` anke.\n\nVedtakfakta (`vedtakfaktakode`): `UNNTAKAAP` Unntak fra maksimal stønadsperiode AAP (J/N), `AAPVILKUNN` Unntaksvilkår gjelder fra, `INNVF` Vedtaksdato.",
};

export const fordelingMvpKantTilKantFlyt: Flow = {
  id: "fordeling-mvp-kant-til-kant",
  title: "Eksisterende fordelingslogikk MVP kant-til-kant",
  description:
    "Hvordan AvklarFordelingSteg i aap-postmottak-backend avgjør om en søknad om AAP går til Kelvin eller Arena. Data om Arena hentes fra aap-arenaoppslag.",
  nodes: [
    {
      id: "soknad-til-fordeling",
      label: "Søknad til fordeling",
      kind: "start",
      position: { x: 0, y: 0 },
      summary: "En søknad om AAP (brevkode `NAV 11-13.05`) kommer inn i steget AVKLAR_FORDELING.",
      details: [
        {
          type: "text",
          content:
            "Steget er `AvklarFordelingSteg` i `flyt/src/main/kotlin/no/nav/aap/postmottak/forretningsflyt/steg/fordeling/`. Det kjører i en `Fordeling`-behandling, inne i motor-jobben `flyt.prosesserBehandling`.\n\nSteget er idempotent. Finnes det allerede en vurdering for behandlingen, avslutter det med `Fullført` uten å gjøre noe mer.\n\nSteget avgjør alltid automatisk. Resultatet er `KELVIN` hvis fordelingsreglene sier Kelvin, eller hvis kant-til-kant-sjekken sier at personen har brukt opp retten sin i Arena. Ellers blir det `ARENA`.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Avgjørelsen i AvklarFordelingSteg.utfør",
          code: `val regelresultat = vurderFordelingRegler(kontekst, innkommendeJournalpost)

val oppbruktRettighetResultat = erRettighetOppbruktIArena(safJournalpost, kontekst)

// Feiler hardt hvis Arena ikke svarer, slik at jobben prøves på nytt i stedet for å rute feil
val kantIKantSakSomSkalTilKelvin =
    if (unleashGateway.isEnabled(PostmottakFeature.KantTilKantV1)) {
        oppbruktRettighetResultat.skalTilKelvin()
    } else {
        false
    }

val system = if (regelresultat.skalTilKelvin() || kantIKantSakSomSkalTilKelvin) {
    AapSystem.KELVIN
} else {
    AapSystem.ARENA
}`,
        },
      ],
    },
    {
      id: "hent-journalpost-og-person",
      label: "Hent journalpost og person",
      kind: "external",
      position: { x: 0, y: 150 },
      summary: "Henter journalposten fra SAF og alle identene til personen fra PDL.",
      details: [
        {
          type: "text",
          content:
            "`JournalpostService.hentSafJournalpost` henter journalposten fra SAF. Brevkoden på hoveddokumentet bestemmer om dokumentet er en søknad.\n\n`tilJournalpostMedDokumentTitler` slår opp brukeren i PDL (`hentAlleIdenterForPerson`) og finner eller oppretter personen i postmottak. Alle reglene bruker denne `Person`-en, med aktiv ident og historiske identer.\n\nMottatt dato er datoen av typen `DATO_REGISTRERT` på journalposten. Den brukes i Arena-oppslagene.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Input til reglene",
          code: `data class RegelInput(
    val journalpostId: Long,
    val person: Person,
    val brevkode: String,      // "NAV 11-13.05" for søknad
    val mottattDato: LocalDate // DATO_REGISTRERT
)`,
        },
      ],
    },
    {
      id: "evaluer-regler",
      label: "Evaluer fordelingsregler",
      kind: "process",
      position: { x: 0, y: 300 },
      summary: "`FordelerRegelService` kjører alle aktive regler og lagrer resultatet.",
      details: [
        {
          type: "text",
          content:
            "Alle aktive regler kjøres, uavhengig av hverandre. Hver regel henter sin egen data og svarer `true` eller `false`. Boksene under viser hvordan `Regelresultat.skalTilKelvin()` kombinerer svarene.\n\nRegelresultatet lagres på den innkommende journalposten. Kjører steget på nytt, gjenbrukes det lagrede resultatet, og reglene evalueres ikke igjen.\n\n`ArenaSakRegel` (har personen noen gang vært i Arena) kjøres også, men brukes bare til logging.\n\n`FordelerRegelService.evaluer` kaller `vurder()` to ganger per regel, én gang for en metrikk og én gang for resultatet. Hvert oppslag skjer derfor to ganger.",
        },
        {
          type: "text",
          content:
            "Aktive regler i prod: `ManueltOverstyrtTilArenaRegel`, `KelvinSakRegel`, `ArenaSakRegel`, `ArenaHistorikkRegel`, `Aldersregel`, `SøknadRegel`, `ErIkkeReisestønadRegel` og `ErIkkeAnkeRegel`.\n\nI dev er `Aldersregel` og `SøknadRegel` slått av.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Regelresultat.skalTilKelvin() (forenklet, uten logging)",
          code: `fun skalTilKelvin(): Boolean {
    val manueltOverstyrtTilArena = regelMap["ManueltOverstyrtTilArenaRegel"] ?: false
    if (manueltOverstyrtTilArena) return false

    val sakFinnesIKelvin = regelMap.getValue("KelvinSakRegel")
    val erIkkeReisestønad = regelMap.getValue("ErIkkeReisestønadRegel")
    val erIkkeAnke = regelMap.getValue("ErIkkeAnkeRegel")

    if (sakFinnesIKelvin && erIkkeReisestønad && erIkkeAnke) return true

    // Resten av reglene må være true, unntatt disse tre
    val reglerTilEvaluering = regelMap.filter {
        it.key != "KelvinSakRegel" &&
            it.key != "ArenaSakRegel" &&
            it.key != "ManueltOverstyrtTilArenaRegel"
    }
    return reglerTilEvaluering.values.all { it }
}`,
        },
        {
          type: "code",
          language: "sql",
          title: "Lagre regelresultatet (Postgres i postmottak)",
          code: `INSERT INTO REGELSETT_RESULTAT (INNKOMMENDE_JOURNALPOST, SYSTEM_NAVN)
VALUES (:innkommendeJournalpostId, :systemNavn); -- KELVIN eller ARENA etter skalTilKelvin()

-- Én rad per regel
INSERT INTO REGEL_EVALUERING (REGEL_RESULTAT_ID, REGEL_NAVN, RESULTAT)
VALUES (:regelResultatId, :regelNavn, :resultat);`,
        },
      ],
    },
    {
      id: "sjekk-dokumenttype",
      label: "Sjekk dokumenttype",
      kind: "process",
      position: { x: 0, y: 450 },
      summary: "Tre regler ser bare på brevkoden. For en søknad gir alle tre `true`.",
      details: [
        {
          type: "text",
          content:
            "Reglene trenger ingen oppslag. De leser brevkoden på hoveddokumentet.\n\n`SøknadRegel` (bare prod): brevkoden er `SØKNAD`.\n\n`ErIkkeReisestønadRegel`: brevkoden er ikke `SØKNAD_OM_REISESTØNAD` eller ettersendelse av den.\n\n`ErIkkeAnkeRegel`: brevkoden er ikke `ANKE` eller ettersendelse av den.\n\nSiden vi vet at dokumentet er en søknad, stopper ingen av disse reglene den. De er derfor ikke egne valg i diagrammet.",
        },
      ],
    },
    {
      id: "manuelt-overstyrt",
      label: "Manuelt til Arena?",
      kind: "decision",
      position: { x: 0, y: 600 },
      summary: "`ManueltOverstyrtTilArenaRegel`: er personen lagt inn for å sendes til Arena?",
      details: [
        {
          type: "text",
          content:
            "Regelen slår opp hver ident personen har i tabellen `manuell_fordeling` i databasen til postmottak. Den er `true` hvis en av identene er overstyrt til `arena`. Personen kan ikke være overstyrt til flere fagsystemer.\n\nEr regelen `true`, gir `skalTilKelvin()` alltid `false`. Overstyringen gjelder bare reglene. Kant-til-kant-sjekken kjører fortsatt og kan sende søknaden til Kelvin.",
        },
        {
          type: "code",
          language: "sql",
          title: "Slå opp overstyring per ident (Postgres i postmottak)",
          code: `SELECT fagsystem
  FROM manuell_fordeling
 WHERE ident = :ident;`,
        },
      ],
    },
    {
      id: "har-kelvin-sak",
      label: "Sak i Kelvin?",
      kind: "decision",
      position: { x: 320, y: 600 },
      summary: "`KelvinSakRegel`: har personen minst én sak i Kelvin?",
      details: [
        {
          type: "text",
          content:
            "Postmottak kaller behandlingsflyt med den aktive identen til personen og får tilbake sakene personen har i Kelvin. Regelen er `true` hvis lista ikke er tom.\n\nEn eksisterende Kelvin-sak vinner over Arena-historikk og alder. For en søknad er `ErIkkeReisestønadRegel` og `ErIkkeAnkeRegel` alltid `true`, så svaret her avgjør alene.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "BehandlingsflytKlient.finnSaker",
          code: `override fun finnSaker(ident: Ident): List<BehandlingsflytSaksInfoTilPostmottak> {
    val request = PostRequest(FinnSaker(ident.identifikator))
    return client.post(url.resolve("/api/sak/ekstern/finn"), request)
        ?: throw UnknownError("Fikk uforventet respons fra behandlingsflyt")
}`,
        },
      ],
    },
    {
      id: "signifikant-arena-historikk",
      label: "Signifikant Arena-historikk?",
      kind: "decision",
      position: { x: 640, y: 600 },
      summary: "`ArenaHistorikkRegel`: har personen noe i Arena som fortsatt kan være i gang eller nylig er avsluttet? Det gjelder AAP-vedtak, § 11-5-vedtak, klager eller anker.",
      details: [
        {
          type: "text",
          content:
            "Regelen ser etter personer som har noe pågående eller nylig avsluttet i Arena. Søknaden fra en slik person skal ikke til Kelvin etter reglene. Den kan likevel havne i Kelvin gjennom kant-til-kant-sjekken.\n\nRegelen er `true` når personen ikke har signifikant historikk. Diagrammet spør motsatt: «ja» betyr at personen har signifikant historikk, og da sier reglene Arena.",
        },
        {
          type: "text",
          content:
            "Slik går kallet på tvers av appene\n\nI postmottak: `ArenaHistorikkRegelInputGenerator` kaller `ArenaoppslagGateway.harSignifikantHistorikk`. Den sender `POST /api/v1/person/historikk/signifikant` med aktiv ident og mottatt dato som `virkningstidspunkt`. Regelen kaller også `POST /api/v1/person/historikk`, men bare for metrikker.\n\nI arenaoppslag: ruten `historikk` i `ApiRoute.kt` slår opp `person_id` med `PersonService.hentPersonId`. Finnes ikke personen i Arena, svarer den «ingen historikk» med en gang. Ellers kaller den `HistorikkService.signifikantHistorikk`, som kjører spørringen i `HistorikkRepository`.\n\nSvaret er `SignifikantHistorikkResponse`. Den inneholder `harSignifikantHistorikk` og lista `signifikanteVedtak` med radene spørringen fant. `harSignifikantHistorikk` er `true` hvis lista ikke er tom. Regelen bruker bare dette feltet. Lista blir logget.",
        },
        {
          type: "text",
          content:
            "Én spørring i fire deler\n\nArenaoppslag kjører én spørring mot tabellen `vedtak`. Den består av fire deler som er satt sammen med `UNION ALL`. Delene er uavhengige av hverandre, og hver del leter etter én type historikk. Alle delene bruker `person_id` fra oppslaget over. Finner én av delene minst én rad, har personen signifikant historikk.\n\nAlle tidsgrensene regnes bakover fra mottatt dato. «78 uker» betyr altså «mottatt dato minus 78 uker».\n\nDel 1, AAP-vedtak: vedtak med rettighet `AAP` som ikke er avbrutt, ugyldiggjort eller etterregistrert. Vedtaket teller hvis det fortsatt gjelder, eller hvis det sluttet for mindre enn 78 uker siden. 78 uker er 52 uker for gjenopptak og 6 måneder for tilbakejustering. Stansvedtak uten til-dato teller hvis de startet for mindre enn 119 uker siden. Den lengre grensen dekker lange pauser, for eksempel foreldrepenger. Avslag eldre enn 78 uker teller ikke. Det gjør heller ikke vedtak som ble opprettet, men ikke behandlet på 52 uker, eller vedtak som ikke er endret på 208 uker.\n\nDel 2, § 11-5-vedtak: vedtak med rettighet `AA115` som ikke er behandlet ennå, og som er endret de siste 26 ukene.\n\nDel 3, klager: klager (`KLAG1`, `KLAG2`) som ikke er avbrutt eller trukket. Klagen teller hvis den fortsatt er under behandling, eller hvis utfallet ble registrert for mindre enn 12 uker siden. Arena lagrer utfallsdatoen som vedtakfaktaen `INNVF` (vedtaksdato), og den er tom mens klagen behandles. Klager som ikke er behandlet på 52 uker, eller som ikke er endret på 156 uker, teller ikke.\n\nDel 4, anker: som klager, men med rettighet `ANKE` og 52 uker etter utfallet i stedet for 12.",
        },
        arenaKoder,
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkRepository: tidsgrensene og hvordan delene settes sammen",
          code: `const val vanligTidsbufferUker = 78L                     // 52 uker gjenopptak + 6 måneder tilbakejustering
const val stansTidsbufferUker = 119L                     // foreldrepenger med 80 % utbetalt, trillinger, alenemor
const val klageTidsbufferUker = 12L                      // buffertid etter klagen er behandlet
const val ankeTidsbufferUker = 52L                       // buffertid etter anken er behandlet
const val maksimalTidUbehandletAA115Uker = 26L           // maksimal behandlingstid for AA115-vedtak
const val maksimalTidUbehandletAAPUker = 52L             // maksimal behandlingstid for AAP-vedtak
const val maksimalTidUbehandletKlageAnkeUker = 52L       // maksimal tid uten utfall for klager og anker
const val nedreGrenseModifisertSidenAAPUker = 52 * 4L    // uendret AAP-vedtak over særlig lang tid
const val nedreGrenseModifisertSidenKlageAnkeUker = 52 * 3L

val query = listOf(
    selectKunRelevanteAapVedtak,   // del 1
    selectKunRelevante11_5Vedtak,  // del 2
    selectKunRelevanteKlager,      // del 3
    selectKunRelevanteAnker,       // del 4
).joinToString("\\nUNION ALL\\n") + "ORDER BY aar DESC, lopenrsak DESC, lopenrvedtak DESC"`,
        },
        {
          type: "code",
          language: "sql",
          title: "Før spørringen: finn person_id fra identene (Oracle, PersonRepository)",
          code: `SELECT person_id
  FROM PERSON
 WHERE fodselsnr IN (:alleIdenter) -- alle folkeregisteridentene fra PDL
   AND person_id_status = 'AKTIV'; -- DUPLIKAT_TIL_BEH og andre feilstatuser filtreres ut`,
        },
        {
          type: "code",
          language: "sql",
          title: "Del 1: AAP-vedtak (Oracle, HistorikkRepository)",
          code: `SELECT sak_id, v.vedtak_id, aar, lopenrvedtak, lopenrsak,
       vedtakstatuskode, vedtaktypekode, fra_dato, til_dato,
       rettighetkode, aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
  FROM vedtak v
 WHERE v.person_id = :personId
   AND (v.utfallkode IS NULL OR v.utfallkode != 'AVBRUTT')
   AND v.rettighetkode = 'AAP'
   -- filtrer ut ugyldiggjorte vedtak
   AND NOT (fra_dato > til_dato AND (til_dato IS NOT NULL AND fra_dato IS NOT NULL))
   -- filtrer ut etterregistrerte vedtak, men behold vedtak som er under behandling
   AND ((fra_dato IS NOT NULL OR til_dato IS NOT NULL)
        OR vedtakstatuskode IN ('OPPRE', 'MOTAT', 'REGIS', 'INNST'))
   AND (
         -- gjelder fortsatt, eller sluttet for mindre enn 78 uker siden
         ((vedtaktypekode IN ('O', 'E', 'G') OR (vedtaktypekode = 'S' AND v.til_dato IS NOT NULL))
           AND (til_dato IS NULL OR til_dato >= :mottattMinus78Uker))
         OR
         -- stans uten til-dato som startet for mindre enn 119 uker siden
         (vedtaktypekode = 'S' AND til_dato IS NULL
           AND (fra_dato IS NULL OR fra_dato >= :mottattMinus119Uker))
       )
   -- avslag (NEI) har åpen til_dato, så ekskluder de gamle
   AND NOT (v.utfallkode IS NOT NULL AND v.utfallkode = 'NEI' AND til_dato IS NULL
            AND (fra_dato IS NOT NULL AND fra_dato <= :mottattMinus78Uker))
   -- opprettet, men ikke behandlet på 52 uker
   AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker)
   -- ikke endret på 208 uker
   AND v.MOD_DATO >= :mottattMinus208Uker`,
        },
        {
          type: "code",
          language: "sql",
          title: "Del 2: § 11-5-vedtak som ikke er behandlet (Oracle, HistorikkRepository)",
          code: `SELECT sak_id, v.vedtak_id, aar, lopenrvedtak, lopenrsak,
       vedtakstatuskode, vedtaktypekode, fra_dato, til_dato,
       rettighetkode, aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
  FROM vedtak v
 WHERE v.person_id = :personId
   AND v.rettighetkode = 'AA115'
   AND v.utfallkode IS NULL                 -- ikke behandlet ennå
   AND v.MOD_DATO >= :mottattMinus26Uker`,
        },
        {
          type: "code",
          language: "sql",
          title: "Del 3: klager (Oracle, HistorikkRepository)",
          code: `-- INNVF får en dato når utfallet av klagen registreres. Er den tom, behandles klagen fortsatt.
SELECT v.sak_id, v.vedtak_id, v.aar, v.lopenrvedtak, v.lopenrsak,
       vedtakstatuskode, vedtaktypekode,
       CAST(NULL AS DATE)                    AS fra_dato,
       TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') AS til_dato,
       v.rettighetkode, v.aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
  FROM vedtak v
  JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
 WHERE v.person_id = :personId
   AND v.rettighetkode IN ('KLAG1', 'KLAG2')
   AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ('AVBRUTT', 'TRUKK'))
   AND vf.vedtakfaktakode = 'INNVF'
   -- under behandling, eller utfall for mindre enn 12 uker siden
   AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus12Uker)
   AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker)
   AND v.MOD_DATO >= :mottattMinus156Uker`,
        },
        {
          type: "code",
          language: "sql",
          title: "Del 4: anker (Oracle, HistorikkRepository)",
          code: `SELECT v.sak_id, v.vedtak_id, v.aar, v.lopenrvedtak, v.lopenrsak,
       vedtakstatuskode, vedtaktypekode,
       CAST(NULL AS DATE) AS fra_dato,
       CAST(NULL AS DATE) AS til_dato,
       v.rettighetkode, v.aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
  FROM vedtak v
  JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
 WHERE v.person_id = :personId
   AND rettighetkode = 'ANKE'
   AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ('AVBRUTT', 'TRUKK'))
   AND vf.vedtakfaktakode = 'INNVF'
   -- under behandling, eller utfall for mindre enn 52 uker siden
   AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus52Uker)
   AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker)
   AND v.MOD_DATO >= :mottattMinus156Uker

-- Etter del 4 sorteres hele resultatet:
ORDER BY aar DESC, lopenrsak DESC, lopenrvedtak DESC`,
        },
        {
          type: "code",
          language: "json",
          title: "Response: SignifikantHistorikkResponse (oppdiktet eksempel)",
          code: `{
  "harSignifikantHistorikk": true,
  "signifikanteVedtak": [
    {
      "sakId": 1234567,
      "statusKode": "IVERK",
      "vedtaktypeKode": "E",
      "fraOgMed": "2025-06-01",
      "tilDato": "2026-12-31",
      "rettighetkode": "AAP",
      "utfallkode": "JA",
      "vedtakId": 7654321,
      "aktivitetsfaseKode": "UA"
    }
  ]
}`,
        },
      ],
    },
    {
      id: "minst-18-ar",
      label: "Minst 18 år?",
      kind: "decision",
      position: { x: 960, y: 600 },
      summary: "`Aldersregel` (bare prod): er personen minst 18 år i dag?",
      details: [
        {
          type: "text",
          content:
            "Regelen henter fødselsdatoen fra PDL med den aktive identen. Alderen regnes mot dagens dato, ikke mottatt dato. Mangler fødselsdato i PDL, er regelen `false`.\n\nDette er den siste regelen som kan stoppe en søknad. Er den `true`, er alle regler som teller i siste del av `skalTilKelvin()` oppfylt: `ArenaHistorikkRegel`, `Aldersregel`, `SøknadRegel`, `ErIkkeReisestønadRegel` og `ErIkkeAnkeRegel`.\n\nI dev er regelen slått av, og da går søknaden alltid videre som «ja».",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Aldersregel.vurder",
          code: `override fun vurder(input: AldersregelInput): Boolean {
    if (input.fødselsdato == null) return false
    val alder = Period.between(input.fødselsdato, input.nåDato).years
    return alder >= MIN_ALDER // 18
}`,
        },
      ],
    },
    {
      id: "kelvin-regler-oppfylt",
      label: "Send til Kelvin",
      kind: "end",
      position: { x: 1280, y: 600 },
      summary: "Alle regler er oppfylt: ingen signifikant Arena-historikk, minst 18 år og en vanlig søknad.",
      details: sendTilKelvin,
    },
    {
      id: "kelvin-har-sak",
      label: "Send til Kelvin",
      kind: "end",
      position: { x: 320, y: 750 },
      summary: "Personen har allerede en sak i Kelvin.",
      details: sendTilKelvin,
    },
    {
      id: "kant-til-kant-pa",
      label: "Kant-til-kant på?",
      kind: "decision",
      position: { x: 0, y: 1050 },
      summary: "Reglene sier Arena. Er feature-togglen `KantTilKantV1` slått på i Unleash?",
      details: [
        {
          type: "text",
          content:
            "Hit kommer søknader der `skalTilKelvin()` gir `false`. Søknaden kan likevel gå til Kelvin hvis personen har brukt opp retten til AAP i Arena. Det kalles kant-til-kant: den nye saken i Kelvin starter der Arena-vedtaket slutter.\n\nSjekken ligger i `ArenaService.harOppbruktRettighet`. Steget kaller den for alle søknader, også når togglen er av og når reglene allerede har sagt Kelvin, for å telle resultatet i en metrikk. Svarer ikke arenaoppslag, feiler steget, og motoren prøver jobben på nytt i stedet for å fordele feil.\n\nEr togglen av, teller ikke resultatet, og søknaden går til Arena.",
        },
      ],
    },
    {
      id: "arena-toggle-av",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 1050 },
      summary: "Reglene sier Arena, og kant-til-kant er slått av.",
      details: sendTilArena,
    },
    {
      id: "hent-siste-lopende-arena-vedtak",
      label: "Hent siste løpende Arena-vedtak",
      kind: "external",
      position: { x: 0, y: 1200 },
      summary: "Ett kall til aap-arenaoppslag, som kjører seks spørringer mot Arena og svarer med siste AAP-vedtak, saken det hører til og 11-12-status.",
      details: [
        {
          type: "text",
          content:
            "Postmottak sender den aktive identen til personen og mottatt dato til aap-arenaoppslag. Arenaoppslag finner personen i Arena, det siste innvilgede AAP-vedtaket som teller på kvoten, saken vedtaket hører til, og om unntaket etter § 11-12 er vurdert. Svaret er en `HistorikkStatusDetaljResponse`.\n\nFordelingen bruker bare `sisteSakOgVedtak` fra svaret. Mottatt dato sendes med som `virkningstidspunkt`, men endepunktet bruker den ikke.",
        },
        {
          type: "text",
          content:
            "Slik går kallet på tvers av appene\n\nI postmottak: `ArenaService.harOppbruktRettighet` kaller `ArenaoppslagGateway.historikkStatusDetalj`. Implementasjonen, `ArenaoppslagGatewayImpl`, sender `POST /api/v1/person/historikk/status/detalj` med identen og mottatt dato i body.\n\nI arenaoppslag: ruten `historikk` i `ApiRoute.kt` tar imot kallet. Den slår opp `person_id` med `PersonService.hentPersonId` og sender den videre til `HistorikkService.hentHistorikkStatusDetalj`. Tjenesten bruker `VedtakService`, `SakOgVedtakService`, `TelleverkService` og `PosteringService`, som igjen kaller repositoryene med SQL-en under.\n\nRequest- og response-typene ligger i `kontrakt`-modulen til arenaoppslag (`no.nav.aap.arenaoppslag.kontrakt.apiv1`). Postmottak bruker den samme modulen som avhengighet, så begge sider har de samme typene.\n\nFår postmottak ikke svar, feiler steget og prøves på nytt senere. Søknaden blir ikke fordelt før arenaoppslag har svart.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Postmottak: ArenaoppslagGatewayImpl",
          code: `override suspend fun historikkStatusDetalj(person: Person, mottattDato: LocalDate): HistorikkStatusDetaljResponse {
    val request = SignifikantHistorikkRequest(person.aktivIdent().identifikator, mottattDato)
    return gjørArenaOppslag<HistorikkStatusDetaljResponse>(
        "/api/v1/person/historikk/status/detalj", request
    ).getOrThrow()
}`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "Arenaoppslag: ruten i ApiRoute.kt",
          code: `post("/person/historikk/status/detalj") {
    val request: SignifikantHistorikkRequest = call.receive()
    val personId = personService.hentPersonId(request.personidentifikator)
        ?: return@post call.respond(HistorikkStatusDetaljResponse.ingen)

    val detaljer = historikkService.hentHistorikkStatusDetalj(personId)

    call.respond(HttpStatusCode.OK, detaljer)
}`,
        },
        {
          type: "code",
          language: "json",
          title: "Request: POST /api/v1/person/historikk/status/detalj",
          code: `{
  "personidentifikator": ":aktivIdent",
  "virkningstidspunkt": ":mottattDato"
}`,
        },
        {
          type: "text",
          content:
            "Slik henger spørringene sammen\n\nArenaoppslag kjører spørringene etter hverandre. Hver spørring bruker en verdi fra en tidligere spørring. Numrene viser til SQL-en lenger ned.\n\n1. Arenaoppslag slår opp alle folkeregisteridentene til personen i PDL. Spørring 1 finner `person_id` i tabellen `PERSON` ut fra identene. Finnes ikke personen, svarer arenaoppslag med alle felt tomme uten å kjøre flere spørringer. Gir identene flere `person_id`-er, feiler kallet.\n\n2. Spørring 2 bruker `person_id` og finner det siste innvilgede AAP-vedtaket som teller på kvoten. Den gir blant annet `vedtak_id`, `lopenrsak`, `aar`, aktivitetsfase, fra- og til-dato og maksdatoene fra viewet `v_vedtak_maxdato`. Gir den ingen rad, blir `sisteSakOgVedtak` tom.\n\n3. Spørring 3 bruker `vedtak_id` fra spørring 2 og leser `UNNTAKAAP` og `AAPVILKUNN` på dette vedtaket. Slik registrerte Arena 11-12-vurderingen etter gammel prosedyre.\n\n4. Spørring 4 bruker `lopenrsak` og `aar` fra spørring 2. De to verdiene er saksnummeret. Spørringen henter saken med `sak_id`, status og datoer.\n\n5. Spørring 5 bruker `sak_id` fra spørring 4 og henter alle vedtakene i saken.\n\n6. Arenaoppslag kjører spørring 3 og spørring 6 med alle `vedtak_id`-ene fra spørring 5. Da får hvert vedtak sine vedtakfakta og vilkårsvurderinger. Ugyldiggjorte vedtak (til-dato før fra-dato) fjernes etterpå.\n\n7. Kotlin-koden finner vedtak i saken som kan inneholde 11-12-vurderingen etter ny prosedyre: et eget 11-12-vedtak eller et stansvedtak. Spørring 3 kjøres på nytt for disse vedtakene. Resultatet blir `unntaksvilkaarInnvilget` og `unntaksvilkaarGjelderFra` (se «Forlenget etter 11-12?»).\n\n8. Telleverket (gjenværende kvote) og datoen for siste AAP-utbetaling hentes med egne spørringer på `person_id`. Fordelingen bruker ikke disse.\n\nSpørring 3 kjører altså opptil fire ganger per kall.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkService.hentHistorikkStatusDetalj (arenaoppslag, med stegnumre)",
          code: `// Steg 1 skjer i ruten: personService.hentPersonId(personidentifikator) ?: return ingen

fun hentHistorikkStatusDetalj(personId: PersonId): HistorikkStatusDetaljResponse {
    // Steg 2 og 3: siste vedtak med maksdato og vedtakfakta for det
    val sisteVedtakMedMaksdato = vedtakService.hentSisteLøpendeVedtakDetalj(personId)

    // Steg 4, 5 og 6: saken, alle vedtakene i den og fakta per vedtak
    val sisteSakMedVedtak = sisteVedtakMedMaksdato?.saksnummer()       // lopenrsak + aar
        ?.let { sakOgVedtakService.hentSakMedVedtak(it) }
        ?.let { sak -> sak.copy(vedtak = sak.vedtak.filter { !it.erUgyldiggjort() }) }

    val sisteSakDetaljer = if (sisteVedtakMedMaksdato != null && sisteSakMedVedtak != null) {
        // Steg 7: 11-12-status for saken
        val (unntaksvilkaarInnvilget, unntaksvilkaarGjelderFra) = hent11_12StatusForSaken(
            sisteVedtakMedMaksdato,
            sisteSakMedVedtak.vedtak,
            sisteVedtakMedMaksdato.sakId
        )
        sisteSakMedVedtak.tilSisteSakDetaljer(
            sisteVedtak = sisteVedtakMedMaksdato,
            unntaksvilkaarInnvilget = unntaksvilkaarInnvilget,
            unntaksvilkaarGjelderFra = unntaksvilkaarGjelderFra,
        )
    } else null

    // Steg 8: brukes ikke i fordelingen
    val kvote = telleverkService.hentTelleverkForPerson(personId)?.let { /* ... */ }
    val sistePosteringsDato = utbetalingService.hentSisteAapUtbetalingForPerson(personId)

    return HistorikkStatusDetaljResponse(kvote, sisteSakDetaljer, sistePosteringsDato)
}`,
        },
        arenaKoder,
        {
          type: "code",
          language: "sql",
          title: "Spørring 1: finn person_id fra identene (Oracle, PersonRepository)",
          code: `SELECT person_id
  FROM PERSON
 WHERE fodselsnr IN (:alleIdenter)
   AND person_id_status = 'AKTIV'; -- DUPLIKAT_TIL_BEH og andre feilstatuser filtreres ut`,
        },
        {
          type: "code",
          language: "sql",
          title: "Spørring 2: siste vedtak som ikke er stanset og teller på kvoten (Oracle, VedtakRepository)",
          code: `WITH nyeste_vedtak AS (
    SELECT rettighetkode, utfallkode, aar, sak_id, vedtak_id, lopenrvedtak, lopenrsak,
           vedtaktypekode, aktfasekode, vedtakstatuskode, fra_dato, til_dato
      FROM (
            SELECT v.sak_id, v.vedtak_id, v.vedtaktypekode, v.aktfasekode,
                   v.fra_dato, v.til_dato, v.vedtakstatuskode,
                   v.lopenrvedtak, v.lopenrsak, v.aar, v.rettighetkode, v.utfallkode,
                   ROW_NUMBER() OVER (
                       PARTITION BY v.person_id
                       ORDER BY v.til_dato DESC NULLS FIRST, v.vedtak_id DESC
                   ) AS rn
              FROM vedtak v
             WHERE v.person_id = :personId -- fra spørring 1
               AND v.rettighetkode = 'AAP'
               AND v.utfallkode = 'JA'
               AND v.vedtakstatuskode IN ('IVERK', 'AVSLU')
               AND v.vedtaktypekode IN ('O', 'E', 'G')
               -- ignorer ugyldiggjorte og etterregistrerte vedtak
               AND v.fra_dato IS NOT NULL
               AND NOT ((v.fra_dato IS NOT NULL AND v.til_dato IS NOT NULL)
                        AND v.fra_dato > v.til_dato)
           )
     WHERE rn = 1
)
SELECT nv.sak_id, nv.aar, nv.vedtak_id, nv.lopenrvedtak, nv.lopenrsak,
       nv.aktfasekode, nv.vedtaktypekode, nv.fra_dato, nv.til_dato,
       nv.vedtakstatuskode, nv.rettighetkode, nv.utfallkode,
       vmd.max_dato, vmd.max_unntak_dato
  FROM nyeste_vedtak nv
  JOIN v_vedtak_maxdato vmd ON vmd.vedtak_id = nv.vedtak_id
 FETCH FIRST 1 ROW ONLY`,
        },
        {
          type: "code",
          language: "sql",
          title: "Spørring 3: vedtakfakta for én eller flere vedtak (Oracle, VedtakfaktaRepository)",
          code: `SELECT vf.vedtak_id, vf.vedtakfaktakode, vf.vedtakverdi, vf.reg_dato, vft.skjermbildetekst
  FROM vedtakfakta vf
  LEFT JOIN vedtakfaktatype vft ON vft.vedtakfaktakode = vf.vedtakfaktakode
 WHERE vf.vedtak_id IN (:vedtakIder);
-- Oracle har ikke listeparametere, så arenaoppslag setter inn id-ene i teksten.
-- UNNTAKAAP = J/N: om unntaket etter § 11-12 er innvilget
-- AAPVILKUNN: datoen unntaksperioden gjelder fra`,
        },
        {
          type: "code",
          language: "sql",
          title: "Spørring 4: saken ut fra saksnummeret (Oracle, SakRepository)",
          code: `SELECT sak.sak_id, sak.aar, sak.sakstatuskode, sakstatus.sakstatusnavn, sak.lopenrsak,
       person.person_id, person.fornavn, person.etternavn, person.fodselsnr,
       sak.reg_dato, sak.dato_avsluttet
  FROM SAK
  LEFT JOIN person ON person.person_id = sak.objekt_id
  LEFT JOIN sakstatus ON sak.sakstatuskode = sakstatus.sakstatuskode
 WHERE LOPENRSAK = :lopenrsak -- fra spørring 2
   AND AAR = :aar             -- fra spørring 2
   AND TABELLNAVNALIAS = 'PERS';`,
        },
        {
          type: "code",
          language: "sql",
          title: "Spørring 5: alle vedtakene i saken (Oracle, VedtakRepository)",
          code: `SELECT v.vedtak_id, v.lopenrvedtak, v.vedtakstatuskode, vs.vedtakstatusnavn,
       v.vedtaktypekode, vt.vedtaktypenavn, v.fra_dato, v.til_dato,
       v.rettighetkode, rt.rettighetnavn, v.utfallkode, v.begrunnelse,
       v.brukerid_ansvarlig, v.brukerid_beslutter, v.vedtak_id_relatert,
       a.aktfasekode, a.aktfasenavn
  FROM vedtak v
  LEFT JOIN vedtaktype vt ON vt.vedtaktypekode = v.vedtaktypekode
  LEFT JOIN vedtakstatus vs ON v.vedtakstatuskode = vs.vedtakstatuskode
  LEFT JOIN aktivitetfase a ON a.aktfasekode = v.aktfasekode
  LEFT JOIN rettighettype rt ON rt.rettighetkode = v.rettighetkode
 WHERE sak_id = :sakId; -- fra spørring 4`,
        },
        {
          type: "code",
          language: "sql",
          title: "Spørring 6: vilkårsvurderinger for vedtakene (Oracle, VilkårsvurderingRepository)",
          code: `SELECT vv.vilkaarvurdering_id, vv.vedtak_id, vv.vilkaarkode, vv.begrunnelse, vv.vurdert_av,
       vt.skjermbildetekst, vt.status_oblig, vt.url_hjelpereferanse, vt.url_lovtekst,
       vt.url_rundskrivtekst, vs.vilkaarstatuskode, vs.vilkaarstatusnavn
  FROM vilkaarvurdering vv
  LEFT JOIN vilkaartype vt ON vt.vilkaarkode = vv.vilkaarkode
  LEFT JOIN vilkaarstatus vs ON vs.vilkaarstatuskode = vv.vilkaarstatuskode
 WHERE vv.vedtak_id IN (:vedtakIder); -- fra spørring 5`,
        },
        {
          type: "text",
          content:
            "Hva som returneres\n\n`telleverk` er gjenværende ordinær og utvidet kvote. `sisteUtbetalingDato` er datoen for siste AAP-utbetaling. Begge kan være tomme, og fordelingen bruker dem ikke.\n\n`sisteSakOgVedtak` (`SisteSakDetaljer`) er tom hvis personen ikke finnes i Arena eller ikke har noe innvilget AAP-vedtak. Ellers inneholder den saken, 11-12-statusen, `sisteVedtak` fra spørring 2 og `vedtakene`, som er alle gyldige vedtak i saken fra spørring 5.\n\nFordelingen bruker disse feltene: `sisteVedtak.aktfaseKode`, `sisteVedtak.fra`, `sisteVedtak.til`, `sisteVedtak.maxdatoOrdinaer`, `sisteVedtak.maxdatoUnntak`, `sisteVedtak.maxdatoAap` og `unntaksvilkaarInnvilget`.\n\nEksempelet under er oppdiktet. Er søknaden mottatt 3. juli 2026 eller senere, gir dette svaret `VedtattAtIkkeForlenges`, og søknaden går til Kelvin.",
        },
        {
          type: "code",
          language: "json",
          title: "Response: HistorikkStatusDetaljResponse (eksempel)",
          code: `{
  "telleverk": {
    "ordineerAAPKvote": 0,
    "utvidetAAPKvote": null
  },
  "sisteSakOgVedtak": {
    "sakId": 1234567,
    "saknummer": "2023-123456",
    "sakStatus": "AKTIV",
    "sakRegistrert": "2023-01-10",
    "sakAvsluttet": null,
    "unntaksvilkaarInnvilget": false,
    "unntaksvilkaarGjelderFra": null,
    "sisteVedtak": {
      "vedtakId": 7654321,
      "aktfaseKode": "UA",
      "vedtaktypeKode": "E",
      "vedtakstatuskode": "IVERK",
      "fra": "2025-06-01",
      "til": "2026-12-31",
      "maxdatoOrdinaer": "2026-12-31",
      "maxdatoUnntak": null,
      "maxdatoAap": "2026-12-31"
    },
    "vedtakene": [
      {
        "sakId": 1234567,
        "statusKode": "IVERK",
        "vedtaktypeKode": "E",
        "fraOgMed": "2025-06-01",
        "tilDato": "2026-12-31",
        "rettighetkode": "AAP",
        "utfallkode": "JA",
        "vedtakId": 7654321,
        "aktivitetsfaseKode": "UA"
      }
    ]
  },
  "sisteUtbetalingDato": "2026-11-04"
}`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "Slik blir maksdatoene i svaret til (VedtakMedMaksdato)",
          code: `VedtakMedMaksdato(
    // ...
    til = tilDato,
    maxdatoOrdinaer = maxdatoOrdinaer,               // v_vedtak_maxdato.max_dato: slutten av de tre ordinære årene
    maxdatoUnntak = maxdatoUnntak,                   // v_vedtak_maxdato.max_unntak_dato: slutten av forlengelsen (fem år)
    maxdatoAap = maxdatoUnntak ?: maxdatoOrdinaer,   // den siste som gjelder
)`,
        },
      ],
    },
    {
      id: "siste-vedtak-ua-au",
      label: "Vedtak i UA eller AU?",
      kind: "decision",
      position: { x: 0, y: 1350 },
      summary: "Er siste AAP-vedtak i aktivitetsfasen «Under arbeidsavklaring» (UA) eller «Arbeidsutprøving» (AU)?",
      details: [
        {
          type: "text",
          content:
            "Hvert AAP-vedtak i Arena har en aktivitetsfase (`aktfasekode`). Navnene kommer fra kodetabellen `aktivitetfase` i Arena.\n\n`UA`: Under arbeidsavklaring\n\n`AU`: Arbeidsutprøving\n\n`UVUP`: Vurdering for uføre\n\n`FA`: Ferdig avklart\n\n`SPE`: Sykepengeerstatning\n\n`UVUP`, `FA` og `SPE` er sterkt knyttet til hver sin paragraf i folketrygdloven, men tilsvarer dem ikke direkte. Fasen `IKKE` (ikke spesifisert) finnes også i Arena, men brukes bare for andre rettighetskoder enn `AAP`.\n\nSvaret er «ja» bare for `UA` og `AU`. Svaret er «nei» for de andre fasene, og når arenaoppslag ikke fant noe vedtak (`sisteSakOgVedtak` er tom). Resultatet er da `IkkeRelevantSøknad`.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "ArenaService.harOppbruktRettighet",
          code: `val sisteSak = historikk.sisteSakOgVedtak
if (sisteSak == null || !sisteSak.erUnderArbeidsAvklaring() && !sisteSak.erUnderArbeidsUtprøving()) {
    return IkkeRelevantSøknad
}

// SisteSakDetaljer
fun erUnderArbeidsAvklaring() = sisteVedtak.aktfaseKode == "UA"
fun erUnderArbeidsUtprøving() = sisteVedtak.aktfaseKode == "AU"`,
        },
      ],
    },
    {
      id: "arena-ingen-aktuell-sak",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 1350 },
      summary: "`IkkeRelevantSøknad`: personen har ikke et AAP-vedtak i UA eller AU i Arena.",
      details: sendTilArena,
    },
    {
      id: "vedtak-frem-i-tid",
      label: "Innvilget AAP for fremtidig periode?",
      kind: "decision",
      position: { x: 0, y: 1500 },
      summary: "Har personen allerede fått AAP innvilget i Arena for en periode som starter etter at søknaden kom?",
      details: [
        {
          type: "text",
          content:
            "Sjekken ser på fra-datoen til siste vedtak. Ligger den etter mottatt dato, har Arena allerede innvilget AAP for en periode som starter etter at søknaden kom. Søknaden er da ikke kant-til-kant, og resultatet er `IkkeRelevantSøknad`.\n\nMangler fra-datoen, er svaret nei.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "harVedtakIArenaSomStarterIFremtiden",
          code: `sisteSak.sisteVedtak.fra?.isAfter(mottattDato) == true`,
        },
      ],
    },
    {
      id: "arena-vedtak-frem-i-tid",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 1500 },
      summary: "`IkkeRelevantSøknad`: personen har allerede innvilget AAP i Arena for en senere periode.",
      details: sendTilArena,
    },
    {
      id: "maksdato-innen-26-uker",
      label: "Maksdato innen 26 uker?",
      kind: "decision",
      position: { x: 0, y: 1650 },
      summary: "Er maksdatoen for AAP i Arena tidligere enn 26 uker etter mottatt dato?",
      details: [
        {
          type: "text",
          content:
            "Sjekken bruker `maxdatoAap`: slutten av forlengelsen hvis personen har fått det, ellers slutten av de tre ordinære årene. Ligger denne datoen 26 uker eller mer etter mottatt dato, har personen søkt for tidlig. Resultatet er da `IkkeRelevantSøknad`.\n\nEn maksdato som allerede er passert, gir også «ja».\n\nMangler `maxdatoAap`, er svaret nei, og søknaden går til Arena som om personen hadde søkt for tidlig.",
        },
        maksdatoForklaring,
        {
          type: "code",
          language: "kotlin",
          title: "maksDatoNærmerSeg",
          code: `private val periodeFørMaksdato = Period.ofWeeks(26)

sisteSak?.sisteVedtak?.maxdatoAap?.isBefore(mottattDato + periodeFørMaksdato) == true`,
        },
      ],
    },
    {
      id: "arena-sokt-for-tidlig",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 1650 },
      summary: "`IkkeRelevantSøknad`: det er 26 uker eller mer til maksdato. Personen har søkt for tidlig.",
      details: sendTilArena,
    },
    {
      id: "forlenget-11-12",
      label: "Forlenget etter 11-12?",
      kind: "decision",
      position: { x: 0, y: 1800 },
      summary: "Er unntaket etter § 11-12 innvilget på saken (`unntaksvilkaarInnvilget == true`)?",
      details: [
        {
          type: "text",
          content:
            "Arenaoppslag utleder `unntaksvilkaarInnvilget` fra `vedtakfakta.UNNTAKAAP` (J/N). Hvor faktaen ligger, avhenger av om 11-12-vurderingen er registrert etter gammel eller ny prosedyre. Arenaoppslag ser i denne rekkefølgen:\n\n1. Fakta på siste løpende vedtak (gammel prosedyre).\n\n2. Et eget 11-12-vedtak etter til-datoen til siste vedtak: type `O`, utfall `NEI`, rettighet `AAP`, fase `AU` eller `UA`, status `IVERK` eller `AVSLU`.\n\n3. Et stansvedtak etter til-datoen: type `S`, utfall `JA`, ellers som over.\n\nFinnes ingen av dem, er verdien `null`: 11-12 er ikke vurdert.\n\n«Ja» her betyr at personen har fått forlengelse. «Nei» dekker både avslag (`false`) og ikke vurdert (`null`).",
        },
        arenaKoder,
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkService.hent11_12StatusForSaken (arenaoppslag)",
          code: `val eget11_12vedtak = vedtakeneISisteSak.filter {
    it.fraOgMed != null &&
        it.fraOgMed.isAfter(sisteLøpendeVedtak?.tilDato) &&
        it.vedtaktypeKode == "O" &&
        it.utfallkode == "NEI" &&
        it.rettighetkode == "AAP" &&
        it.aktivitetsfaseKode in listOf("AU", "UA") &&
        it.statusKode in listOf("IVERK", "AVSLU")
}

val stansvedtakMed11_12 = vedtakeneISisteSak.filter {
    it.fraOgMed != null &&
        it.fraOgMed.isAfter(sisteLøpendeVedtak?.tilDato) &&
        it.vedtaktypeKode == "S" &&
        it.utfallkode == "JA" &&
        it.rettighetkode == "AAP" &&
        it.aktivitetsfaseKode in listOf("AU", "UA") &&
        it.statusKode in listOf("IVERK", "AVSLU")
}

val resultat = when {
    faktaPåLøpendeVedtak != null -> faktaPåLøpendeVedtak
    faktaPåEget11_12Vedtak != null -> faktaPåEget11_12Vedtak
    faktaPåStanset11_12Vedtak != null -> faktaPåStanset11_12Vedtak
    else -> Pair(null, null) // ingen vurdering registrert
}`,
        },
      ],
    },
    {
      id: "forlengelse-brukt-opp",
      label: "Forlengelse brukt opp?",
      kind: "decision",
      position: { x: 640, y: 1800 },
      summary: "Har personen brukt opp hele forlengelsen, altså fem år med AAP til sammen?",
      details: [
        {
          type: "text",
          content:
            "Personen har fått forlengelse etter § 11-12. Hvis til-datoen på siste vedtak ligger høyst 5 dager fra `maxdatoUnntak`, varer vedtaket ut forlengelsen. Personen har da brukt opp alle fem årene. Resultatet er `HarBruktOppForlengelsen`, og søknaden går til Kelvin.\n\nEllers er personen midt i forlengelsen, for eksempel i år én av to. Resultatet er `VedtattForlenget`. Det samme skjer hvis til-dato eller `maxdatoUnntak` mangler.",
        },
        maksdatoForklaring,
        {
          type: "code",
          language: "kotlin",
          title: "erTildatoLikMaksdatoForUnntakInnenforToleranse",
          code: `private val toleranseForLikeDatoer = 5.days

erDatoerInnenforToleranse(sisteSak?.sisteVedtak?.til, sisteSak?.sisteVedtak?.maxdatoUnntak)

private fun erDatoerInnenforToleranse(tilDato: LocalDate?, maksdato: LocalDate?): Boolean =
    if (tilDato == null || maksdato == null) {
        false
    } else {
        val dagerMellom = ChronoUnit.DAYS.between(tilDato, maksdato).days
        dagerMellom.absoluteValue <= toleranseForLikeDatoer
    }`,
        },
      ],
    },
    {
      id: "kelvin-brukt-opp-forlengelse",
      label: "Send til Kelvin",
      kind: "end",
      position: { x: 960, y: 1800 },
      summary: "`HarBruktOppForlengelsen`: personen har brukt opp forlengelsen etter § 11-12 i Arena.",
      details: sendTilKelvin,
    },
    {
      id: "arena-vedtatt-forlenget",
      label: "Send til Arena",
      kind: "end",
      position: { x: 640, y: 1950 },
      summary: "`VedtattForlenget`: personen har forlengelse i Arena som ikke er brukt opp.",
      details: sendTilArena,
    },
    {
      id: "ved-ordinaer-maksdato",
      label: "Ordinær kvote brukt opp?",
      kind: "decision",
      position: { x: 0, y: 1950 },
      summary: "Går til-datoen på siste vedtak til ordinær maksdato, med 5 dagers slingringsmonn?",
      details: [
        {
          type: "text",
          content:
            "Sjekken sammenligner `til` på siste vedtak med `maxdatoOrdinaer`, datoen de tre ordinære årene er brukt opp. Er det høyst 5 dager mellom dem, er svaret ja.\n\nSlingringsmonnet finnes fordi Arena gir ett vedtak per kalenderår når AAP forlenges. Dette er ikke forlengelse etter § 11-12. Kvoten er vanligvis tre år og to dager. Etter to forlengelser er det derfor en rest på omtrent to dager. Arena lager et eget vedtak for de to siste dagene når det er 28 dager igjen av det foregående vedtaket. Med 5 dager slingringsmonn treffer sjekken også når til-datoen ligger et par dager før maksdatoen.\n\nMangler til-dato eller `maxdatoOrdinaer`, er svaret nei.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "erTildatoLikMaksdatoInnenforToleranse",
          code: `erDatoerInnenforToleranse(sisteSak?.sisteVedtak?.til, sisteSak?.sisteVedtak?.maxdatoOrdinaer)`,
        },
      ],
    },
    {
      id: "arena-ikke-ved-maksdato",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 1950 },
      summary: "`IkkeRelevantSøknad`: siste vedtak slutter før de tre ordinære årene er brukt opp.",
      details: sendTilArena,
    },
    {
      id: "unntak-avslatt",
      label: "11-12 avslått?",
      kind: "decision",
      position: { x: 0, y: 2100 },
      summary: "Har Arena vurdert § 11-12 og sagt nei til forlengelse (`unntaksvilkaarInnvilget == false`)?",
      details: [
        {
          type: "text",
          content:
            "De tre ordinære årene er brukt opp. Svaret avhenger av `unntaksvilkaarInnvilget`, som ikke er en vanlig boolean. Den har tre mulige verdier i dag, og kan få flere senere:\n\n`false` (avslått): resultatet er `VedtattAtIkkeForlenges`, og søknaden går til Kelvin.\n\n`null` (ikke vurdert): resultatet er `IkkeRelevantSøknad`, og søknaden går til Arena.\n\n`true` (innvilget): søknaden går til Arena. I praksis kommer ingen søknad hit med denne verdien, fordi «Forlenget etter 11-12?» allerede har sendt dem videre.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Hele vurderingen i ArenaService.harOppbruktRettighet",
          code: `val harKunOppbrukt = when {
    // Bruker har valgt å sende en ny søknad om AAP og ..
    maksdatoErIkkeInnenRimeligTid -> IkkeRelevantSøknad // har søkt for tidlig
    erAlleredeForlenget -> if (tilDatoErLikMaksdatoForUnntak) {
        HarBruktOppForlengelsen // forlengelsen er brukt opp
    } else {
        VedtattForlenget        // forlenget, men ikke ved utløpet
    }
    // vedtaket går ikke til ordinær maksdato, ytelsen kan ikke være oppbrukt
    tilDatoErIkkeLikOrdinærMaksdato -> IkkeRelevantSøknad
    // ordinær kvote er brukt opp og 11-12 er /IKKE/ oppfylt
    skalIkkeForlenges -> VedtattAtIkkeForlenges
    else -> IkkeRelevantSøknad
}

// OppbruktRettighetResultat
fun skalTilKelvin() = this is HarOppbruktRettighet // HarBruktOppForlengelsen eller VedtattAtIkkeForlenges`,
        },
      ],
    },
    {
      id: "kelvin-vedtatt-ikke-forlenges",
      label: "Send til Kelvin",
      kind: "end",
      position: { x: 320, y: 2100 },
      summary: "`VedtattAtIkkeForlenges`: de tre ordinære årene er brukt opp, og Arena har avslått forlengelse etter § 11-12.",
      details: sendTilKelvin,
    },
    {
      id: "arena-11-12-ikke-vurdert",
      label: "Send til Arena",
      kind: "end",
      position: { x: 0, y: 2250 },
      summary: "`IkkeRelevantSøknad`: de tre ordinære årene er brukt opp, men § 11-12 er ikke vurdert i Arena.",
      details: sendTilArena,
    },
    {
      id: "arena-11-12-innvilget",
      label: "Send til Arena",
      kind: "end",
      position: { x: 320, y: 2250 },
      summary: "`IkkeRelevantSøknad`: § 11-12 er innvilget. Skjer ikke i praksis, fordi «Forlenget etter 11-12?» fanger dette tidligere.",
      details: sendTilArena,
    },
  ],
  edges: [
    { from: "soknad-til-fordeling", to: "hent-journalpost-og-person" },
    { from: "hent-journalpost-og-person", to: "evaluer-regler" },
    { from: "evaluer-regler", to: "sjekk-dokumenttype" },
    { from: "sjekk-dokumenttype", to: "manuelt-overstyrt" },

    { from: "manuelt-overstyrt", to: "har-kelvin-sak", label: "nei" },
    { from: "manuelt-overstyrt", to: "kant-til-kant-pa", label: "ja" },
    { from: "har-kelvin-sak", to: "kelvin-har-sak", label: "ja" },
    { from: "har-kelvin-sak", to: "signifikant-arena-historikk", label: "nei" },
    { from: "signifikant-arena-historikk", to: "minst-18-ar", label: "nei" },
    { from: "signifikant-arena-historikk", to: "kant-til-kant-pa", label: "ja" },
    { from: "minst-18-ar", to: "kelvin-regler-oppfylt", label: "ja" },
    { from: "minst-18-ar", to: "kant-til-kant-pa", label: "nei" },

    { from: "kant-til-kant-pa", to: "arena-toggle-av", label: "nei" },
    { from: "kant-til-kant-pa", to: "hent-siste-lopende-arena-vedtak", label: "ja" },
    { from: "hent-siste-lopende-arena-vedtak", to: "siste-vedtak-ua-au" },
    { from: "siste-vedtak-ua-au", to: "arena-ingen-aktuell-sak", label: "nei / udefinert" },
    { from: "siste-vedtak-ua-au", to: "vedtak-frem-i-tid", label: "ja" },
    { from: "vedtak-frem-i-tid", to: "arena-vedtak-frem-i-tid", label: "ja" },
    { from: "vedtak-frem-i-tid", to: "maksdato-innen-26-uker", label: "nei / udefinert" },
    { from: "maksdato-innen-26-uker", to: "arena-sokt-for-tidlig", label: "nei / udefinert" },
    { from: "maksdato-innen-26-uker", to: "forlenget-11-12", label: "ja" },
    { from: "forlenget-11-12", to: "forlengelse-brukt-opp", label: "ja" },
    { from: "forlenget-11-12", to: "ved-ordinaer-maksdato", label: "nei / udefinert" },
    { from: "forlengelse-brukt-opp", to: "kelvin-brukt-opp-forlengelse", label: "ja" },
    { from: "forlengelse-brukt-opp", to: "arena-vedtatt-forlenget", label: "nei / udefinert" },
    { from: "ved-ordinaer-maksdato", to: "arena-ikke-ved-maksdato", label: "nei / udefinert" },
    { from: "ved-ordinaer-maksdato", to: "unntak-avslatt", label: "ja" },
    { from: "unntak-avslatt", to: "kelvin-vedtatt-ikke-forlenges", label: "ja" },
    { from: "unntak-avslatt", to: "arena-11-12-ikke-vurdert", label: "udefinert" },
    { from: "unntak-avslatt", to: "arena-11-12-innvilget", label: "nei" },
  ],
};
