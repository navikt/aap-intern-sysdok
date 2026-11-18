import type { DetailBlock, Flow } from "./types.ts";

const ingenSignifikantHistorikk: DetailBlock[] = [
  {
    type: "text",
    content:
      "Arenaoppslag svarer `harSignifikantHistorikk = false` med en tom liste.\n\nI postmottak snur `ArenaHistorikkRegel` svaret og gir `true`. I fordelingsflyten betyr det «nei» på «Signifikant Arena-historikk?». Søknaden kan da gå til Kelvin hvis personen også er minst 18 år.",
  },
  {
    type: "code",
    language: "json",
    title: "Response: SignifikantHistorikkResponse",
    code: `{
  "harSignifikantHistorikk": false,
  "signifikanteVedtak": []
}`,
  },
];

export const signifikantArenaHistorikkFlyt: Flow = {
  id: "signifikant-arena-historikk",
  title: "Signifikant Arena-historikk",
  description:
    "Hvordan aap-arenaoppslag avgjør om en person har signifikant historikk i Arena. Spørringen er delt opp i små steg med forklaring og eksempler.",
  nodes: [
    {
      id: "spor-om-arena-historikk",
      label: "Spør om Arena-historikk",
      kind: "start",
      position: { x: 640, y: 0 },
      summary:
        "`ArenaHistorikkRegel` i postmottak spør arenaoppslag om personen har signifikant historikk i Arena.",
      details: [
        {
          type: "text",
          content:
            "Denne flyten forklarer boksen «Signifikant Arena-historikk?» i flyten «Eksisterende fordelingslogikk MVP kant-til-kant». Den deler den store spørringen i arenaoppslag opp i små steg.\n\nSignifikant historikk betyr at personen har noe i Arena som fortsatt kan være i gang eller nylig er avsluttet. Spørringen ser etter AAP-vedtak, § 11-5-vedtak som ikke er behandlet, klager og anker. Finner den minst ett slikt vedtak, sier fordelingsreglene Arena. Søknaden kan likevel havne i Kelvin gjennom kant-til-kant-sjekken.\n\nAlle tidsgrensene regnes bakover fra datoen søknaden ble mottatt, ikke fra dagens dato. Eksemplene i flyten bruker en søknad mottatt 18. november 2026.",
        },
        {
          type: "text",
          content:
            "Hvor koden ligger\n\nPostmottak: `ArenaHistorikkRegel` i `flyt/src/main/kotlin/no/nav/aap/fordeler/regler/`.\n\nArenaoppslag: ruten i `ApiRoute.kt`, `HistorikkService` i `service/` og spørringen i `database/HistorikkRepository.kt`.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "ArenaHistorikkRegel (forenklet, uten metrikker og logging)",
          code: `// ArenaHistorikkRegelInputGenerator.generer
val historikk = arena.harHistorikk(input.person) // bare til metrikker
val signifikantHistorikk = arena.harSignifikantHistorikk(input.person, input.mottattDato)
return ArenaHistorikkRegelInput(signifikantHistorikk.harSignifikantHistorikk, input.person)

// ArenaHistorikkRegel.vurder: true betyr at regelen ikke stopper søknaden fra Kelvin
override fun vurder(input: ArenaHistorikkRegelInput): Boolean {
    return !input.harSignifikantHistorikkIAAPArena
}`,
        },
      ],
    },
    {
      id: "kall-arenaoppslag",
      label: "Kall arenaoppslag",
      kind: "external",
      position: { x: 640, y: 150 },
      summary:
        "Postmottak sender aktiv ident og mottatt dato til `POST /api/v1/person/historikk/signifikant`.",
      details: [
        {
          type: "text",
          content:
            "`ArenaoppslagGatewayImpl.harSignifikantHistorikk` lager en `SignifikantHistorikkRequest`. Den inneholder den aktive identen til personen og mottatt dato som `virkningstidspunkt`. Mottatt dato er datoen av typen `DATO_REGISTRERT` på journalposten.\n\nI arenaoppslag tar ruten `historikk` i `ApiRoute.kt` imot kallet.\n\n`FordelerRegelService.evaluer` kaller hver regel to ganger, så postmottak gjør dette kallet to ganger per søknad. Regelen kaller også `POST /api/v1/person/historikk`, men bare for å telle i metrikker.",
        },
        {
          type: "code",
          language: "json",
          title: "Request: POST /api/v1/person/historikk/signifikant",
          code: `{
  "personidentifikator": ":aktivIdent",
  "virkningstidspunkt": "2026-11-18"
}`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "Postmottak: ArenaoppslagGatewayImpl",
          code: `override suspend fun harSignifikantHistorikk(
    person: Person, mottattDato: LocalDate
): SignifikantHistorikkResponse {
    val request = SignifikantHistorikkRequest(person.aktivIdent().identifikator, mottattDato)
    val response = harSignifikantHistorikk(request)
    return response
}

suspend fun harSignifikantHistorikk(
    req: SignifikantHistorikkRequest
): SignifikantHistorikkResponse =
    gjørArenaOppslag<SignifikantHistorikkResponse>(
        "/api/v1/person/historikk/signifikant", req
    ).getOrThrow()`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "Arenaoppslag: ruten i ApiRoute.kt",
          code: `post("/person/historikk/signifikant") {
    logger.info("Sjekker om personens AAP-Arena-historikk er signifikant for saksbehandling i Kelvin")
    val request: SignifikantHistorikkRequest = call.receive()
    val personidentifikator = request.personidentifikator
    val personId = personService.hentPersonId(personidentifikator)
        ?: return@post call.respond(SignifikantHistorikkResponse.ingen)

    val response: SignifikantHistorikkResponse = historikkService.signifikantHistorikk(
        personId, request.virkningstidspunkt
    )

    call.respond(response)
}`,
        },
      ],
    },
    {
      id: "finn-personen-i-arena",
      label: "Finn personen i Arena",
      kind: "database",
      position: { x: 640, y: 300 },
      summary:
        "Arenaoppslag henter alle identene til personen fra PDL og leter etter dem i tabellen `PERSON` i Arena.",
      details: [
        {
          type: "text",
          content:
            "En person kan ha hatt flere identer, for eksempel et D-nummer før fødselsnummeret. `PersonService.hentPersonId` henter derfor alle identene fra PDL med `hentAlleIdenterForPerson` og leter etter alle i Arena. Resultatet er `person_id`, som er nøkkelen til personen i Arena.\n\nBare rader med `person_id_status = 'AKTIV'` teller. Andre statuser, som `DUPLIKAT_TIL_BEH`, er feilstatuser.\n\nGir identene mer enn én `person_id`, kaster arenaoppslag en feil. Da feiler kallet, og steget i postmottak feiler også.\n\nArenaoppslag husker treff i en cache. Neste oppslag på samme ident går ikke til PDL og Arena.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "PersonService.hentPersonId (arenaoppslag)",
          code: `fun hentPersonId(personidentifikator: String): PersonId? {
    return personIdCache.getIfPresent(personidentifikator)
        ?: hentPersonIdUtenCache(personidentifikator)
            ?.also { funnetPersonId ->
                personIdCache.put(personidentifikator, funnetPersonId)
            }
}

private fun hentPersonIdUtenCache(personidentifikator: String): PersonId? {
    val alleIdenter = pdlGateway.hentAlleIdenterForPerson(personidentifikator)
        .map { it.ident }
        .toSet()
    return personRepository.hentPersonIdHvisEksisterer(alleIdenter)
}`,
        },
        {
          type: "code",
          language: "sql",
          title: "Finn person_id (Oracle, PersonRepository)",
          code: `-- Oracle har ikke listeparametere, så arenaoppslag setter inn identene i teksten
SELECT person_id from PERSON
WHERE fodselsnr in (:alleIdenter)
    AND person_id_status = 'AKTIV' -- DUPLIKAT_TIL_BEH og andre feilstatuser filtreres ut`,
        },
      ],
    },
    {
      id: "finnes-personen-i-arena",
      label: "Finnes personen i Arena?",
      kind: "decision",
      position: { x: 640, y: 450 },
      summary: "Fant arenaoppslag en `person_id` for personen?",
      details: [
        {
          type: "text",
          content:
            "Finnes ikke personen i Arena, har personen ingen historikk der. Ruten svarer da med `SignifikantHistorikkResponse.ingen` med en gang og kjører ikke spørringen.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "Utdrag fra ruten i ApiRoute.kt",
          code: `val personId = personService.hentPersonId(personidentifikator)
    ?: return@post call.respond(SignifikantHistorikkResponse.ingen)`,
        },
      ],
    },
    {
      id: "ingen-historikk-person-ukjent",
      label: "Ingen signifikant historikk",
      kind: "end",
      position: { x: 960, y: 450 },
      summary: "Personen finnes ikke i Arena.",
      details: ingenSignifikantHistorikk,
    },
    {
      id: "regn-ut-tidsgrenser",
      label: "Regn ut tidsgrenser",
      kind: "process",
      position: { x: 640, y: 600 },
      summary:
        "Arenaoppslag trekker et fast antall uker fra mottatt dato og får datoene filtrene bruker.",
      details: [
        {
          type: "text",
          content:
            "Hver grense er mottatt dato minus et antall uker. «78 uker» betyr altså «78 uker før søknaden kom». Søknaden i eksemplene er mottatt 18. november 2026.\n\nNoen grenser måler hvor lenge siden et vedtak sluttet eller ble avgjort. Andre måler hvor lenge siden vedtaket sist ble endret i Arena (kolonnen `mod_dato`).\n\nTidslinjen under viser alle grensene med eksempeldatoene. Ligger et vedtak på feil side av grensen, teller det ikke.",
        },
        {
          type: "code",
          language: "text",
          title: "Tidslinje for en søknad mottatt 2026-11-18",
          code: `Dato        Uker  Teller ikke hvis det ligger før datoen
2026-08-26   12   Del 3: klager som ble avgjort
2026-05-20   26   Del 2: ubehandlede § 11-5-vedtak, målt på sist endret
2025-11-19   52   Del 1, 3 og 4: ubehandlede vedtak, klager og anker, målt på sist endret
                  Del 4: anker som ble avgjort
2025-05-21   78   Del 1: vedtak som sluttet
                  Del 1: avslag som startet
2024-08-07  119   Del 1: stans uten til-dato som startet
2023-11-22  156   Del 3 og 4: klager og anker, målt på sist endret
2022-11-23  208   Del 1: AAP-vedtak, målt på sist endret`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkRepository: konstantene og datoene",
          code: `const val vanligTidsbufferUker = 78L // 52 uker gjenopptak + 6 måneder tilbakejustering
const val stansTidsbufferUker = 119L // foreldrepenger med 80% utbetalt, trillinger, alenemor
const val klageTidsbufferUker = 12L // buffertid etter klagen er behandlet
const val ankeTidsbufferUker = 52L // buffertid etter anken er behandlet
const val maksimalTidUbehandletAA115Uker = 26L // maksimal behandlingstid vi regner for AA115-vedtak
const val maksimalTidUbehandletAAPUker = 52L // maksimal behandlingstid vi regner for AAP-vedtak
const val maksimalTidUbehandletKlageAnkeUker = 52L // maksimal tid uten utfall for klager og anker
const val nedreGrenseModifisertSidenAAPUker = 52 * 4L // uendret AAP-vedtak over særlig lang tid
const val nedreGrenseModifisertSidenKlageAnkeUker = 52 * 3L // uendret KLAN-vedtak over særlig lang tid

val vanligTidsbuffer = Date.valueOf(søknadMottattPå.minusWeeks(vanligTidsbufferUker))
val stansTidsbuffer = Date.valueOf(søknadMottattPå.minusWeeks(stansTidsbufferUker))
val klageTidsbuffer = Date.valueOf(søknadMottattPå.minusWeeks(klageTidsbufferUker))
val ankeTidsbuffer = Date.valueOf(søknadMottattPå.minusWeeks(ankeTidsbufferUker))
val maksimalTidUbehandletAA115 = Date.valueOf(søknadMottattPå.minusWeeks(maksimalTidUbehandletAA115Uker))
val maksimalTidUbehandletAAP = Date.valueOf(søknadMottattPå.minusWeeks(maksimalTidUbehandletAAPUker))
val maksimalTidUbehandletKlageAnke = Date.valueOf(søknadMottattPå.minusWeeks(maksimalTidUbehandletKlageAnkeUker))
val maksimalTidUendretAAP = Date.valueOf(søknadMottattPå.minusWeeks(nedreGrenseModifisertSidenAAPUker))
val maksimalTidUendretKlageAnke = Date.valueOf(søknadMottattPå.minusWeeks(nedreGrenseModifisertSidenKlageAnkeUker))`,
        },
      ],
    },
    {
      id: "sporring-i-fire-deler",
      label: "Spørring i fire deler",
      kind: "database",
      position: { x: 640, y: 750 },
      summary:
        "Én SQL-spørring mot tabellen `vedtak` i Arena. Den består av fire uavhengige deler, én for hver type historikk.",
      details: [
        {
          type: "text",
          content:
            "`HistorikkRepository.hentAlleSignifikanteVedtakForPerson` setter sammen fire `SELECT`-er med `UNION ALL`. Hver del leter etter én type historikk.\n\nDel 1 finner AAP-vedtak som gjelder nå, er under behandling eller sluttet nylig.\n\nDel 2 finner § 11-5-vedtak som ikke er avgjort ennå.\n\nDel 3 finner klager som er under behandling eller nylig avgjort.\n\nDel 4 gjør det samme for anker.\n\nDelene vet ikke om hverandre. Ett treff i én del er nok til at personen har signifikant historikk.",
        },
        {
          type: "text",
          content:
            "Slik leser du filtrene\n\nSpørringen ser på ett og ett vedtak. Boksene som starter med «Fjern», er filtre. Treffer vedtaket et filter, teller det ikke. Vedtakene som kommer gjennom alle filtrene i en del, er signifikante.\n\nI SQL-en står alle filtrene i samme `WHERE`. Databasen sjekker dem samtidig, og et vedtak må oppfylle alle. Rekkefølgen i diagrammet er valgt for å gjøre det lett å lese.\n\nSQL-en i boksene er kopiert fra `HistorikkRepository`. I koden er parameterne `?`. Her har de fått navn, for eksempel `:mottattMinus78Uker`.",
        },
        {
          type: "text",
          content:
            "Kolonnene i tabellen vedtak\n\nHver rad i `vedtak` er ett vedtak. En sak i Arena har ofte mange vedtak: ny rettighet, endringer, stans og gjenopptak.\n\n`rettighetkode` sier hva vedtaket gjelder, for eksempel `AAP`, `AA115`, `KLAG1`, `KLAG2` eller `ANKE`.\n\n`vedtaktypekode` sier hva slags vedtak det er, for eksempel `O` Ny rettighet, `E` Endring, `G` Gjenopptak eller `S` Stans.\n\n`vedtakstatuskode` sier hvor langt behandlingen har kommet, fra `OPPRE` (opprettet) til `IVERK` (iverksatt) og `AVSLU` (avsluttet).\n\n`utfallkode` er resultatet: `JA`, `NEI`, `AVBRUTT` eller `TRUKK`. Den er tom til vedtaket er avgjort.\n\n`fra_dato` og `til_dato` er perioden vedtaket gjelder for. Tom `til_dato` betyr at perioden er åpen.\n\n`mod_dato` er datoen raden sist ble endret.\n\n`aar` og `lopenrsak` er saksnummeret. `lopenrvedtak` er nummeret til vedtaket i saken.",
        },
        {
          type: "code",
          language: "text",
          title: "Eksempel: én person gjennom hele spørringen (oppdiktet)",
          code: `Søknaden er mottatt 2026-11-18. Alle vedtakene er endret etter 2022-11-23.

Nr  Rettighet  Type  Utfall  Fra         Til         Resultat
1   AAP        O     JA      2023-01-02  2024-12-31  Fjernes: gamle vedtak (78 uker)
2   AAP        E     JA      2024-07-01  2024-06-30  Fjernes: ugyldiggjort
3   AAP        O     NEI     2024-09-01              Fjernes: gamle avslag (78 uker)
4   AA115      O     JA                              Fjernes: behandlet
5   KLAG1      O     NEI                 2026-06-15  Fjernes: gamle avgjørelser (12 uker)
6   AAP        G     JA      2025-03-01  2025-09-30  Teller: sluttet etter 2025-05-21

For klagen er «Til» datoen klagen ble avgjort (INNVF).
Vedtak 6 er igjen, så personen har signifikant historikk.`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkRepository: slik settes delene sammen, og hvilken dato hver ? får",
          code: `val query =
    listOf(
        selectKunRelevanteAapVedtak,
        selectKunRelevante11_5Vedtak,
        selectKunRelevanteKlager,
        selectKunRelevanteAnker,
    ).joinToString("\\nUNION ALL\\n") + "ORDER BY aar DESC, lopenrsak DESC, lopenrvedtak DESC"

connection.createParameterizedQuery(query).use { preparedStatement ->
    var p = 1 // parameter-indeks
    // S1: AAP-vedtak
    preparedStatement.setInt(p++, arenaPersonId)
    preparedStatement.setDate(p++, vanligTidsbuffer)
    preparedStatement.setDate(p++, stansTidsbuffer)
    preparedStatement.setDate(p++, vanligTidsbuffer)
    preparedStatement.setDate(p++, maksimalTidUbehandletAAP)
    preparedStatement.setDate(p++, maksimalTidUendretAAP)
    // S2: 11-5-vedtak
    preparedStatement.setInt(p++, arenaPersonId)
    preparedStatement.setDate(p++, maksimalTidUbehandletAA115)
    // S3: klager
    preparedStatement.setInt(p++, arenaPersonId)
    preparedStatement.setDate(p++, klageTidsbuffer)
    preparedStatement.setDate(p++, maksimalTidUbehandletKlageAnke)
    preparedStatement.setDate(p++, maksimalTidUendretKlageAnke)

    // S4: anker
    preparedStatement.setInt(p++, arenaPersonId)
    preparedStatement.setDate(p++, ankeTidsbuffer)
    preparedStatement.setDate(p++, maksimalTidUbehandletKlageAnke)
    preparedStatement.setDate(p++, maksimalTidUendretKlageAnke)

    val resultSet = preparedStatement.executeQuery()
    return resultSet.map { row -> mapperForArenaVedtak(row) }
}`,
        },
      ],
    },

    {
      id: "del1-aap-vedtak",
      label: "Del 1: AAP-vedtak",
      kind: "database",
      position: { x: 0, y: 900 },
      summary: "Starter med alle AAP-vedtakene til personen, uansett alder og status.",
      details: [
        {
          type: "text",
          content:
            "Del 1 finner AAP-vedtak som gjelder nå, er under behandling eller sluttet for mindre enn 78 uker siden. Den starter med alle vedtakene til personen med rettighet `AAP`. Filtrene under fjerner dem som ikke er relevante lenger.\n\nKoden har to merknader om data i Arena. Noen vedtak har til-dato før fra-dato. De kalles ugyldiggjorte vedtak eller deaktiverte saker. Andre vedtak har verken fra-dato eller til-dato. Det er etterregistrerte vedtak. Begge typene fjernes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Utgangspunktet: alle AAP-vedtak for personen",
          code: `SELECT ...
  FROM vedtak v
 WHERE v.person_id = :personId
   AND v.rettighetkode = 'AAP'`,
        },
        {
          type: "code",
          language: "sql",
          title: "Hele del 1 (Oracle, HistorikkRepository.selectKunRelevanteAapVedtak)",
          code: `SELECT sak_id, v.vedtak_id, aar, lopenrvedtak, lopenrsak,
       vedtakstatuskode, vedtaktypekode, fra_dato, til_dato,
       rettighetkode, aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
FROM
      vedtak v
WHERE v.person_id = :personId
  AND (v.utfallkode IS NULL OR v.utfallkode != 'AVBRUTT')
  AND v.rettighetkode = 'AAP'
  AND NOT (fra_dato > til_dato AND (til_dato IS NOT NULL AND fra_dato IS NOT NULL)) -- filtrer ut ugyldiggjorte vedtak
  AND ((fra_dato IS NOT NULL OR til_dato IS NOT NULL) OR vedtakstatuskode IN ('OPPRE', 'MOTAT', 'REGIS', 'INNST')) -- filtrer ut etterregistrerte vedtak, men behold vedtak som er under behandling
  AND (
        ((vedtaktypekode IN ('O','E','G') OR (vedtaktypekode = 'S' and v.til_dato IS NOT NULL)) AND (til_dato IS NULL OR til_dato >= :mottattMinus78Uker)) -- vanlig tidsbuffer
          OR
        (vedtaktypekode = 'S' AND til_dato IS NULL AND (fra_dato IS NULL OR fra_dato >= :mottattMinus119Uker)) -- ekstra tidsbuffer for Stans, som bare har fra_dato
      )
  AND NOT (v.utfallkode IS NOT NULL AND v.utfallkode = 'NEI' AND til_dato IS NULL AND (fra_dato IS NOT NULL AND fra_dato <= :mottattMinus78Uker)) -- utfallkode NEI vil ha åpen til_dato, så ekskluder disse når de er gamle
  AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse
  AND v.MOD_DATO >= :mottattMinus208Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },
    {
      id: "del1-avbrutte",
      label: "Fjern avbrutte",
      kind: "process",
      position: { x: 0, y: 1050 },
      summary: "Vedtak med utfall `AVBRUTT` teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Utfallet `AVBRUTT` betyr «Avbrutt / ikke behandlet». Vedtaket ble aldri noe av.\n\nVedtak uten utfall beholdes. De er ikke avgjort ennå.\n\nEksempel: Et AAP-vedtak med utfall `AVBRUTT` fjernes, uansett hvor nytt det er.\n\nFor utviklere: `utfallkode != 'AVBRUTT'` er ikke sann når `utfallkode` er `NULL`. Derfor står `IS NULL OR` først. Uten den ville vedtak uten utfall også forsvunnet.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND (v.utfallkode IS NULL OR v.utfallkode != 'AVBRUTT')`,
        },
      ],
    },
    {
      id: "del1-ugyldiggjorte",
      label: "Fjern ugyldiggjorte",
      kind: "process",
      position: { x: 0, y: 1200 },
      summary: "Vedtak der til-datoen er før fra-datoen, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Arena har vedtak der til-datoen ligger før fra-datoen. De kalles ugyldiggjorte vedtak eller deaktiverte saker, og de gjelder ikke.\n\nFilteret slår bare inn når begge datoene finnes. Mangler en av dem, beholdes vedtaket her.\n\nEksempel: Et vedtak fra 1. juli 2024 til 30. juni 2024 fjernes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND NOT (fra_dato > til_dato AND (til_dato IS NOT NULL AND fra_dato IS NOT NULL)) -- filtrer ut ugyldiggjorte vedtak`,
        },
      ],
    },
    {
      id: "del1-etterregistrerte",
      label: "Fjern etterregistrerte",
      kind: "process",
      position: { x: 0, y: 1350 },
      summary: "Ferdigbehandlede vedtak uten fra-dato og til-dato teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Vedtak som mangler både fra-dato og til-dato, er etterregistrerte vedtak. De blir opprettet ved spesialutbetaling for perioder der personen allerede har et ytelsesvedtak i Arena: AAP, dagpenger eller tiltakspenger. Perioden har altså allerede et vanlig vedtak, og det etterregistrerte vedtaket fjernes.\n\nVedtak under behandling kan også mangle datoer. De beholdes hvis statusen er `OPPRE` (opprettet), `MOTAT` (mottatt), `REGIS` (registrert) eller `INNST` (innstilt).\n\nEksempel: Et vedtak uten datoer med status `IVERK` (iverksatt) fjernes. Et vedtak uten datoer med status `REGIS` beholdes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND ((fra_dato IS NOT NULL OR til_dato IS NOT NULL) OR vedtakstatuskode IN ('OPPRE', 'MOTAT', 'REGIS', 'INNST')) -- filtrer ut etterregistrerte vedtak, men behold vedtak som er under behandling`,
        },
      ],
    },
    {
      id: "del1-andre-vedtakstyper",
      label: "Fjern andre vedtakstyper",
      kind: "process",
      position: { x: 0, y: 1500 },
      summary: "Bare ny rettighet, endring, gjenopptak og stans teller.",
      details: [
        {
          type: "text",
          content:
            "Fire vedtakstyper teller: `O` Ny rettighet, `E` Endring, `G` Gjenopptak og `S` Stans. Alle andre fjernes, for eksempel `A` Reaksjon, `K` Kontroll, `M` Omgjør reaksjon, `N` Annuller sanksjon og `T` Tidsbegrenset bortfall. Vedtak uten type fjernes også.\n\nI SQL-en er dette ikke en egen linje. Det følger av den store `OR`-blokken i de to neste stegene: begge alternativene krever en av de fire typene. Vi har trukket det ut som eget steg for å gjøre resten lettere å lese.",
        },
        {
          type: "code",
          language: "sql",
          title: "Utdrag fra OR-blokken: typene som er lov",
          code: `-- Alternativ 1: O, E, G, eller S med til-dato
(vedtaktypekode IN ('O','E','G') OR (vedtaktypekode = 'S' and v.til_dato IS NOT NULL))

-- Alternativ 2: S uten til-dato
vedtaktypekode = 'S' AND til_dato IS NULL`,
        },
      ],
    },
    {
      id: "del1-stans-uten-til-dato",
      label: "Stans uten til-dato?",
      kind: "decision",
      position: { x: 0, y: 1650 },
      summary: "Er vedtaket en stans (`S`) uten til-dato?",
      details: [
        {
          type: "text",
          content:
            "Et stansvedtak stopper AAP fra en dato. Har stansen ingen til-dato, finnes det ingen sluttdato å måle fra. Spørringen måler da fra fra-datoen og bruker en lengre grense: 119 uker.\n\nAlle andre vedtak måles fra til-datoen med 78 uker. Det gjelder ny rettighet, endring, gjenopptak og stans med til-dato.\n\nI SQL-en er de to sporene en `OR`. Vedtaket må passe ett av dem.",
        },
        {
          type: "code",
          language: "sql",
          title: "OR-blokken med begge sporene",
          code: `AND (
      ((vedtaktypekode IN ('O','E','G') OR (vedtaktypekode = 'S' and v.til_dato IS NOT NULL)) AND (til_dato IS NULL OR til_dato >= :mottattMinus78Uker)) -- vanlig tidsbuffer
        OR
      (vedtaktypekode = 'S' AND til_dato IS NULL AND (fra_dato IS NULL OR fra_dato >= :mottattMinus119Uker)) -- ekstra tidsbuffer for Stans, som bare har fra_dato
    )`,
        },
      ],
    },
    {
      id: "del1-gammel-stans",
      label: "Fjern gammel stans (119 uker)",
      kind: "process",
      position: { x: 320, y: 1650 },
      summary: "En stans uten til-dato teller hvis den startet for mindre enn 119 uker siden.",
      details: [
        {
          type: "text",
          content:
            "Stansen teller hvis fra-datoen er 119 uker før mottatt dato eller senere. Mangler fra-datoen, teller stansen også.\n\nEn stans kan skyldes en lang pause fra AAP, for eksempel foreldrepenger. Kommentaren i koden begrunner 119 uker med den lengste foreldrepengeperioden: 80 prosent utbetaling, trillinger og alenemor.\n\nEksempel (mottatt 18. november 2026, grense 7. august 2024): En stans fra 1. juni 2024 fjernes. En stans fra 1. oktober 2024 teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret (alternativ 2 i OR-blokken)",
          code: `(vedtaktypekode = 'S' AND til_dato IS NULL AND (fra_dato IS NULL OR fra_dato >= :mottattMinus119Uker)) -- ekstra tidsbuffer for Stans, som bare har fra_dato`,
        },
      ],
    },
    {
      id: "del1-gamle-vedtak",
      label: "Fjern gamle vedtak (78 uker)",
      kind: "process",
      position: { x: 0, y: 1800 },
      summary:
        "Et vedtak teller hvis det ikke har til-dato, eller hvis det sluttet for mindre enn 78 uker siden.",
      details: [
        {
          type: "text",
          content:
            "Vedtak med til-dato beholdes hvis til-datoen er 78 uker før mottatt dato eller senere.\n\nVedtak uten til-dato beholdes alltid her. Det kan være et vedtak som gjelder nå, et vedtak under behandling eller et avslag. Gamle avslag og gamle ubehandlede vedtak fjernes i stegene under.\n\nKommentaren i koden forklarer 78 uker som 52 uker for gjenopptak pluss 6 måneder for tilbakejustering.\n\nEksempel (mottatt 18. november 2026, grense 21. mai 2025): Et vedtak som sluttet 31. desember 2024, fjernes. Et vedtak som sluttet 30. september 2025, teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret (alternativ 1 i OR-blokken)",
          code: `((vedtaktypekode IN ('O','E','G') OR (vedtaktypekode = 'S' and v.til_dato IS NOT NULL)) AND (til_dato IS NULL OR til_dato >= :mottattMinus78Uker)) -- vanlig tidsbuffer`,
        },
      ],
    },
    {
      id: "del1-gamle-avslag",
      label: "Fjern gamle avslag (78 uker)",
      kind: "process",
      position: { x: 0, y: 2100 },
      summary: "Avslag som startet for 78 uker siden eller mer, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Et avslag har utfall `NEI` og ingen til-dato. Steget «Fjern gamle vedtak (78 uker)» beholder alle vedtak uten til-dato. Uten dette steget ville derfor alle avslag telle, uansett hvor gamle de er.\n\nSteget fjerner avslag der fra-datoen er 78 uker før mottatt dato eller tidligere. Avslag uten fra-dato beholdes.\n\nEksempel (mottatt 18. november 2026, grense 21. mai 2025): Et avslag fra 1. september 2024 fjernes. Et avslag fra 1. juli 2025 teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND NOT (v.utfallkode IS NOT NULL AND v.utfallkode = 'NEI' AND til_dato IS NULL AND (fra_dato IS NOT NULL AND fra_dato <= :mottattMinus78Uker)) -- utfallkode NEI vil ha åpen til_dato, så ekskluder disse når de er gamle`,
        },
      ],
    },
    {
      id: "del1-gamle-ubehandlede",
      label: "Fjern gamle ubehandlede (52 uker)",
      kind: "process",
      position: { x: 0, y: 2250 },
      summary: "AAP-vedtak uten utfall som ikke er endret på 52 uker, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Et vedtak uten utfall er ikke avgjort. Har ingen endret det på 52 uker, teller det ikke. Koden kaller 52 uker «maksimal behandlingstid» for AAP-vedtak.\n\nSteget bruker `mod_dato`, datoen raden sist ble endret i Arena.\n\nEksempel (mottatt 18. november 2026, grense 19. november 2025): Et vedtak uten utfall som sist ble endret 1. oktober 2025, fjernes. Et som ble endret 1. februar 2026, teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse`,
        },
      ],
    },
    {
      id: "del1-uendrede",
      label: "Fjern uendrede (208 uker)",
      kind: "process",
      position: { x: 0, y: 2400 },
      summary: "AAP-vedtak som ikke er endret på 208 uker (4 år), teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Dette er det siste filteret i del 1. Det fjerner alle vedtak som ingen har endret på fire år, også vedtak som ellers ville telt.\n\nKommentaren i SQL-en sier at filteret er der for ytelsen: databasen slipper å gå gjennom veldig gamle vedtak.\n\nEksempel (mottatt 18. november 2026, grense 23. november 2022): Et vedtak som sist ble endret 1. oktober 2022, fjernes.\n\nVedtakene som er igjen etter dette steget, er signifikante AAP-vedtak.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND v.MOD_DATO >= :mottattMinus208Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },

    {
      id: "del2-11-5-vedtak",
      label: "Del 2: § 11-5-vedtak",
      kind: "database",
      position: { x: 640, y: 900 },
      summary:
        "Starter med alle vedtakene til personen med rettighet `AA115`, § 11-5 nedsatt arbeidsevne.",
      details: [
        {
          type: "text",
          content:
            "Del 2 finner vedtak etter folketrygdloven § 11-5 (nedsatt arbeidsevne) som ikke er avgjort ennå. Rettighetskoden i Arena er `AA115`.\n\nDelen er mye enklere enn del 1. Et § 11-5-vedtak teller bare mens det er under behandling. Når det har fått et utfall, teller det ikke lenger, uansett hvor nytt utfallet er.",
        },
        {
          type: "code",
          language: "sql",
          title: "Hele del 2 (Oracle, HistorikkRepository.selectKunRelevante11_5Vedtak)",
          code: `SELECT sak_id, v.vedtak_id, aar, lopenrvedtak, lopenrsak,
       vedtakstatuskode, vedtaktypekode, fra_dato, til_dato,
       rettighetkode, aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
       v.vedtak_id, v.person_id
FROM
      vedtak v
WHERE v.person_id = :personId
  AND v.rettighetkode = 'AA115'
  AND v.utfallkode IS NULL -- ikke behandlet enda
  AND v.MOD_DATO >= :mottattMinus26Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },
    {
      id: "del2-behandlede",
      label: "Fjern behandlede",
      kind: "process",
      position: { x: 640, y: 1050 },
      summary: "§ 11-5-vedtak som har fått et utfall, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Bare vedtak uten utfall (tom `utfallkode`) beholdes. Alle andre fjernes, også de som fikk utfall `JA` eller `NEI` i forrige uke.\n\nEksempel: Et § 11-5-vedtak med utfall `JA` fjernes. Et § 11-5-vedtak som ikke er avgjort ennå, beholdes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND v.utfallkode IS NULL -- ikke behandlet enda`,
        },
      ],
    },
    {
      id: "del2-uendrede",
      label: "Fjern uendrede (26 uker)",
      kind: "process",
      position: { x: 640, y: 1200 },
      summary: "Ubehandlede § 11-5-vedtak som ikke er endret på 26 uker, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Koden regner 26 uker som maksimal behandlingstid for et § 11-5-vedtak (`maksimalTidUbehandletAA115Uker`). Er vedtaket ikke endret på så lang tid, teller det ikke.\n\nEksempel (mottatt 18. november 2026, grense 20. mai 2026): Et ubehandlet § 11-5-vedtak som sist ble endret 1. april 2026, fjernes. Et som ble endret 1. september 2026, teller.\n\nVedtakene som er igjen, er signifikante § 11-5-vedtak.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND v.MOD_DATO >= :mottattMinus26Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },

    {
      id: "del3-klager",
      label: "Del 3: klager",
      kind: "database",
      position: { x: 960, y: 900 },
      summary: "Starter med alle klagene til personen (`KLAG1` og `KLAG2`).",
      details: [
        {
          type: "text",
          content:
            "Del 3 finner klager som er under behandling, eller som ble avgjort for mindre enn 12 uker siden. Arena har to rettighetskoder for klager: `KLAG1` og `KLAG2`.\n\nSpørringen bruker ikke fra-datoen og til-datoen på klagevedtaket. Den bruker datoen klagen ble avgjort, som hentes fra `vedtakfakta` i neste steg.\n\nKoden har en merknad om en mulig forbedring: en `KLAG1` kan ignoreres hvis det finnes en `KLAG2` som peker på den gjennom `vedtak.vedtak_id_relatert`. Det er ikke gjort i dag, så begge teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Hele del 3 (Oracle, HistorikkRepository.selectKunRelevanteKlager)",
          code: `-- INNVF er satt for alle klager. Den får alltid en dato-verdi når utfallet av klagen registreres.
-- Dersom den er null, er klagen fortsatt under behandling.
SELECT
    v.sak_id, v.vedtak_id, v.aar, v.lopenrvedtak, v.lopenrsak,
    vedtakstatuskode, vedtaktypekode,
    CAST(NULL AS DATE)                    AS fra_dato,
    TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') AS til_dato,
    v.rettighetkode, v.aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
    v.vedtak_id, v.person_id
FROM
    vedtak v
    JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
WHERE
    v.person_id = :personId
    AND v.rettighetkode IN ( 'KLAG1', 'KLAG2' )
    AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ( 'AVBRUTT', 'TRUKK' ))
    AND vf.vedtakfaktakode = 'INNVF'
    -- Vi regner klager med null INNVF som åpne. Klager med fersk INNVF-dato regnes også som åpne, pga. det tar tid før AAP-vedtakene registreres.
    -- Og at det kan komme en ny klage eller anke etter at klagen er behandlet og avslått. Anker sjekkes for seg selv.
    AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus12Uker)
    AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse
    AND v.MOD_DATO >= :mottattMinus156Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },
    {
      id: "del3-utfallsdato",
      label: "Hent utfallsdato",
      kind: "database",
      position: { x: 960, y: 1050 },
      summary: "Spørringen kobler på vedtakfaktaen `INNVF`, datoen klagen ble avgjort.",
      details: [
        {
          type: "text",
          content:
            "Arena lagrer datoen klagen ble avgjort, som vedtakfaktaen `INNVF` (Vedtaksdato) i tabellen `vedtakfakta`. Verdien er tekst på formatet `DD-MM-YYYY`. Den er tom så lenge klagen er under behandling, og får en dato når utfallet blir registrert.\n\nSpørringen gjør teksten om til en dato med `TO_DATE` og returnerer den som `til_dato`. `fra_dato` er alltid tom for klager.\n\n`JOIN` betyr at en klage uten `INNVF`-rad ikke kommer med i det hele tatt. Ifølge kommentaren i koden har alle klager `INNVF`.",
        },
        {
          type: "code",
          language: "sql",
          title: "Koblingen mot vedtakfakta",
          code: `SELECT ...,
       CAST(NULL AS DATE)                    AS fra_dato,
       TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') AS til_dato,
       ...
  FROM vedtak v
  JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
 WHERE ...
   AND vf.vedtakfaktakode = 'INNVF'`,
        },
      ],
    },
    {
      id: "del3-avbrutte-og-trukne",
      label: "Fjern avbrutte og trukne",
      kind: "process",
      position: { x: 960, y: 1200 },
      summary: "Klager med utfall `AVBRUTT` eller `TRUKK` teller ikke.",
      details: [
        {
          type: "text",
          content:
            "`TRUKK` betyr at personen trakk klagen. `AVBRUTT` betyr at klagen ikke ble behandlet. I begge tilfellene er det ingen klage å ta hensyn til.\n\nKlager uten utfall beholdes. De er fortsatt under behandling.\n\nEksempel: En klage som ble trukket i forrige uke, fjernes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ( 'AVBRUTT', 'TRUKK' ))`,
        },
      ],
    },
    {
      id: "del3-gamle-avgjorelser",
      label: "Fjern gamle avgjørelser (12 uker)",
      kind: "process",
      position: { x: 960, y: 1350 },
      summary: "Klager som ble avgjort for 12 uker siden eller mer, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Klagen teller hvis `INNVF` er tom (under behandling), eller hvis den ble avgjort 12 uker før mottatt dato eller senere.\n\nKommentaren i koden gir to grunner til at ferske avgjørelser teller. Det tar tid før AAP-vedtakene etter klagen blir registrert. Og etter en avslått klage kan det komme en ny klage eller en anke. Anker sjekkes i del 4.\n\nEksempel (mottatt 18. november 2026, grense 26. august 2026): En klage avgjort 15. juni 2026 fjernes. En klage avgjort 1. oktober 2026 teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus12Uker)`,
        },
      ],
    },
    {
      id: "del3-gamle-ubehandlede",
      label: "Fjern gamle ubehandlede (52 uker)",
      kind: "process",
      position: { x: 960, y: 1500 },
      summary: "Klager uten utfall som ikke er endret på 52 uker, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "En klage uten utfall er ikke avgjort. Har ingen endret den på 52 uker, teller den ikke. Koden kaller 52 uker «maksimal tid uten utfall» for klager og anker.\n\nEksempel (mottatt 18. november 2026, grense 19. november 2025): En klage uten utfall som sist ble endret 1. oktober 2025, fjernes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse`,
        },
      ],
    },
    {
      id: "del3-uendrede",
      label: "Fjern uendrede (156 uker)",
      kind: "process",
      position: { x: 960, y: 1650 },
      summary: "Klager som ikke er endret på 156 uker (3 år), teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Filteret fjerner alle klager som ingen har endret på tre år. Kommentaren i SQL-en sier at det er for ytelsen.\n\nEksempel (mottatt 18. november 2026, grense 22. november 2023): En klage som sist ble endret 1. oktober 2023, fjernes.\n\nKlagene som er igjen, er signifikante.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND v.MOD_DATO >= :mottattMinus156Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },

    {
      id: "del4-anker",
      label: "Del 4: anker",
      kind: "database",
      position: { x: 1280, y: 900 },
      summary: "Starter med alle ankene til personen (`ANKE`).",
      details: [
        {
          type: "text",
          content:
            "Del 4 er nesten lik del 3. Forskjellen er rettighetskoden (`ANKE`) og grensen for avgjorte anker: 52 uker i stedet for 12.\n\nI svaret fra arenaoppslag er både `fra_dato` og `til_dato` tomme for anker. Utfallsdatoen brukes bare til å filtrere.",
        },
        {
          type: "code",
          language: "sql",
          title: "Hele del 4 (Oracle, HistorikkRepository.selectKunRelevanteAnker)",
          code: `SELECT
    v.sak_id, v.vedtak_id, v.aar, v.lopenrvedtak, v.lopenrsak,
    vedtakstatuskode, vedtaktypekode,
    CAST(NULL AS DATE)                    AS fra_dato,
    CAST(NULL AS DATE)                    AS til_dato,
    v.rettighetkode, v.aktfasekode, v.utfallkode, v.reg_dato, v.mod_dato,
    v.vedtak_id, v.person_id
FROM
    vedtak v
    JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
WHERE
    v.person_id = :personId
    AND rettighetkode = 'ANKE'
    AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ( 'AVBRUTT', 'TRUKK' ))
    AND vf.vedtakfaktakode = 'INNVF'
    -- Vi regner anker med null INNVF som åpne. Anker med fersk INNVF-dato regnes også som åpne, pga. det tar tid før AAP-vedtakene registreres.
    -- Og at det kan komme en ny anke etter at anken er behandlet og avslått.
    AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus52Uker)
    AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse
    AND v.MOD_DATO >= :mottattMinus156Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },
    {
      id: "del4-utfallsdato",
      label: "Hent utfallsdato",
      kind: "database",
      position: { x: 1280, y: 1050 },
      summary: "Spørringen kobler på vedtakfaktaen `INNVF`, datoen anken ble avgjort.",
      details: [
        {
          type: "text",
          content:
            "Som for klager er `INNVF` i `vedtakfakta` tom mens anken er under behandling. Den får en dato når utfallet blir registrert.\n\nUlikt del 3 returnerer ikke spørringen datoen. Både `fra_dato` og `til_dato` er `NULL` i svaret for anker.\n\n`JOIN` betyr at en anke uten `INNVF`-rad ikke kommer med i det hele tatt.",
        },
        {
          type: "code",
          language: "sql",
          title: "Koblingen mot vedtakfakta",
          code: `SELECT ...,
       CAST(NULL AS DATE) AS fra_dato,
       CAST(NULL AS DATE) AS til_dato,
       ...
  FROM vedtak v
  JOIN vedtakfakta vf ON vf.vedtak_id = v.vedtak_id
 WHERE ...
   AND vf.vedtakfaktakode = 'INNVF'`,
        },
      ],
    },
    {
      id: "del4-avbrutte-og-trukne",
      label: "Fjern avbrutte og trukne",
      kind: "process",
      position: { x: 1280, y: 1200 },
      summary: "Anker med utfall `AVBRUTT` eller `TRUKK` teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Samme filter som for klager. `TRUKK` betyr at personen trakk anken. `AVBRUTT` betyr at anken ikke ble behandlet.\n\nAnker uten utfall beholdes. De er fortsatt under behandling.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND (v.utfallkode IS NULL OR v.utfallkode NOT IN ( 'AVBRUTT', 'TRUKK' ))`,
        },
      ],
    },
    {
      id: "del4-gamle-avgjorelser",
      label: "Fjern gamle avgjørelser (52 uker)",
      kind: "process",
      position: { x: 1280, y: 1350 },
      summary: "Anker som ble avgjort for 52 uker siden eller mer, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Anken teller hvis `INNVF` er tom (under behandling), eller hvis den ble avgjort 52 uker før mottatt dato eller senere. Grensen er lengre enn for klager, som har 12 uker.\n\nKommentaren i koden gir samme grunner som for klager. Det tar tid før AAP-vedtakene blir registrert, og etter en avslått anke kan det komme en ny anke.\n\nEksempel (mottatt 18. november 2026, grense 19. november 2025): En anke avgjort 1. oktober 2025 fjernes. En anke avgjort 1. mars 2026 teller.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND (vf.vedtakverdi IS NULL OR TO_DATE(vf.vedtakverdi, 'DD-MM-YYYY') >= :mottattMinus52Uker)`,
        },
      ],
    },
    {
      id: "del4-gamle-ubehandlede",
      label: "Fjern gamle ubehandlede (52 uker)",
      kind: "process",
      position: { x: 1280, y: 1500 },
      summary: "Anker uten utfall som ikke er endret på 52 uker, teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Samme filter som for klager. En anke uten utfall som ingen har endret på 52 uker, teller ikke.\n\nEksempel (mottatt 18. november 2026, grense 19. november 2025): En anke uten utfall som sist ble endret 1. oktober 2025, fjernes.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND NOT (v.utfallkode IS NULL AND v.MOD_DATO <= :mottattMinus52Uker) -- opprettet men ikke behandlet på lang tid, ekskluder disse`,
        },
      ],
    },
    {
      id: "del4-uendrede",
      label: "Fjern uendrede (156 uker)",
      kind: "process",
      position: { x: 1280, y: 1650 },
      summary: "Anker som ikke er endret på 156 uker (3 år), teller ikke.",
      details: [
        {
          type: "text",
          content:
            "Samme filter som for klager. Anker som ingen har endret på tre år, teller ikke.\n\nEksempel (mottatt 18. november 2026, grense 22. november 2023): En anke som sist ble endret 1. oktober 2023, fjernes.\n\nAnkene som er igjen, er signifikante.",
        },
        {
          type: "code",
          language: "sql",
          title: "Filteret",
          code: `AND v.MOD_DATO >= :mottattMinus156Uker -- ytelse: unngå å løpe gjennom veldig gamle vedtak`,
        },
      ],
    },

    {
      id: "sla-sammen-og-sorter",
      label: "Slå sammen og sorter",
      kind: "process",
      position: { x: 640, y: 2550 },
      summary: "Radene fra de fire delene havner i én liste, med nyeste sak først.",
      details: [
        {
          type: "text",
          content:
            "`UNION ALL` legger radene fra del 1, 2, 3 og 4 etter hverandre i én liste. Duplikater fjernes ikke.\n\n`ORDER BY` sorterer lista etter saksnummer (år og løpenummer) og deretter etter nummeret til vedtaket i saken. Nyeste sak kommer først.\n\nKommentaren i kontrakten (`SignifikantHistorikkResponse`) sier at lista er «sortert på dato». Spørringen sorterer på saksnummer og vedtaksnummer, ikke på dato.\n\n`HistorikkService.signifikantHistorikk` gjør hver rad om til en `ArenaVedtak` og teller vedtakene i metrikker: hvert vedtak, det nyeste, antallet og vedtaket hvis det er det eneste.",
        },
        {
          type: "code",
          language: "sql",
          title: "Slik henger delene sammen",
          code: `<del 1: AAP-vedtak>
UNION ALL
<del 2: § 11-5-vedtak>
UNION ALL
<del 3: klager>
UNION ALL
<del 4: anker>
ORDER BY aar DESC, lopenrsak DESC, lopenrvedtak DESC`,
        },
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkService.signifikantHistorikk (arenaoppslag)",
          code: `fun signifikantHistorikk(
    personId: PersonId,
    virkningstidspunkt: LocalDate
): SignifikantHistorikkResponse {
    val signifikanteVedtak: List<ArenaVedtakModell> = historikkRepository.hentAlleSignifikanteVedtakForPerson(
        personId,
        virkningstidspunkt
    )
    rapporterMetrikker(signifikanteVedtak)

    val harSignifikantHistorikk = signifikanteVedtak.isNotEmpty()

    return SignifikantHistorikkResponse(harSignifikantHistorikk, signifikanteVedtak.map {
        it.tilKontrakt()
    })
}`,
        },
      ],
    },
    {
      id: "fant-minst-ett-vedtak",
      label: "Fant minst ett vedtak?",
      kind: "decision",
      position: { x: 640, y: 2700 },
      summary: "Inneholder lista minst ett vedtak?",
      details: [
        {
          type: "text",
          content:
            "`harSignifikantHistorikk` er `true` hvis lista ikke er tom. Ett vedtak fra én av delene er nok.\n\nDet spiller ingen rolle hvilken del treffet kom fra. Et ubehandlet § 11-5-vedtak teller like mye som et AAP-vedtak som gjelder nå.",
        },
        {
          type: "code",
          language: "kotlin",
          title: "HistorikkService",
          code: `val harSignifikantHistorikk = signifikanteVedtak.isNotEmpty()`,
        },
      ],
    },
    {
      id: "signifikant-historikk",
      label: "Signifikant historikk",
      kind: "end",
      position: { x: 960, y: 2700 },
      summary: "Minst ett vedtak er igjen. Personen har signifikant historikk i Arena.",
      details: [
        {
          type: "text",
          content:
            "Arenaoppslag svarer `harSignifikantHistorikk = true` med lista over vedtakene som er igjen.\n\nI postmottak snur `ArenaHistorikkRegel` svaret og gir `false`. I fordelingsflyten betyr det «ja» på «Signifikant Arena-historikk?». Reglene sier Arena, men søknaden kan fortsatt havne i Kelvin gjennom kant-til-kant-sjekken.\n\nPostmottak bruker bare `harSignifikantHistorikk`. Lista blir logget sammen med journalpost-id-en.",
        },
        {
          type: "code",
          language: "json",
          title: "Response: SignifikantHistorikkResponse (oppdiktet, vedtak 6 fra eksempelet)",
          code: `{
  "harSignifikantHistorikk": true,
  "signifikanteVedtak": [
    {
      "sakId": 1234567,
      "statusKode": "AVSLU",
      "vedtaktypeKode": "G",
      "fraOgMed": "2025-03-01",
      "tilDato": "2025-09-30",
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
      id: "ingen-signifikant-historikk",
      label: "Ingen signifikant historikk",
      kind: "end",
      position: { x: 640, y: 2850 },
      summary: "Alle vedtakene ble fjernet av filtrene, eller personen hadde ingen vedtak.",
      details: ingenSignifikantHistorikk,
    },
  ],
  edges: [
    { from: "spor-om-arena-historikk", to: "kall-arenaoppslag" },
    { from: "kall-arenaoppslag", to: "finn-personen-i-arena" },
    { from: "finn-personen-i-arena", to: "finnes-personen-i-arena" },
    { from: "finnes-personen-i-arena", to: "ingen-historikk-person-ukjent", label: "nei" },
    { from: "finnes-personen-i-arena", to: "regn-ut-tidsgrenser", label: "ja" },
    { from: "regn-ut-tidsgrenser", to: "sporring-i-fire-deler" },

    { from: "sporring-i-fire-deler", to: "del1-aap-vedtak" },
    { from: "sporring-i-fire-deler", to: "del2-11-5-vedtak" },
    { from: "sporring-i-fire-deler", to: "del3-klager" },
    { from: "sporring-i-fire-deler", to: "del4-anker" },

    { from: "del1-aap-vedtak", to: "del1-avbrutte" },
    { from: "del1-avbrutte", to: "del1-ugyldiggjorte" },
    { from: "del1-ugyldiggjorte", to: "del1-etterregistrerte" },
    { from: "del1-etterregistrerte", to: "del1-andre-vedtakstyper" },
    { from: "del1-andre-vedtakstyper", to: "del1-stans-uten-til-dato" },
    { from: "del1-stans-uten-til-dato", to: "del1-gammel-stans", label: "ja" },
    { from: "del1-stans-uten-til-dato", to: "del1-gamle-vedtak", label: "nei" },
    { from: "del1-gammel-stans", to: "del1-gamle-avslag" },
    { from: "del1-gamle-vedtak", to: "del1-gamle-avslag" },
    { from: "del1-gamle-avslag", to: "del1-gamle-ubehandlede" },
    { from: "del1-gamle-ubehandlede", to: "del1-uendrede" },
    { from: "del1-uendrede", to: "sla-sammen-og-sorter" },

    { from: "del2-11-5-vedtak", to: "del2-behandlede" },
    { from: "del2-behandlede", to: "del2-uendrede" },
    { from: "del2-uendrede", to: "sla-sammen-og-sorter" },

    { from: "del3-klager", to: "del3-utfallsdato" },
    { from: "del3-utfallsdato", to: "del3-avbrutte-og-trukne" },
    { from: "del3-avbrutte-og-trukne", to: "del3-gamle-avgjorelser" },
    { from: "del3-gamle-avgjorelser", to: "del3-gamle-ubehandlede" },
    { from: "del3-gamle-ubehandlede", to: "del3-uendrede" },
    { from: "del3-uendrede", to: "sla-sammen-og-sorter" },

    { from: "del4-anker", to: "del4-utfallsdato" },
    { from: "del4-utfallsdato", to: "del4-avbrutte-og-trukne" },
    { from: "del4-avbrutte-og-trukne", to: "del4-gamle-avgjorelser" },
    { from: "del4-gamle-avgjorelser", to: "del4-gamle-ubehandlede" },
    { from: "del4-gamle-ubehandlede", to: "del4-uendrede" },
    { from: "del4-uendrede", to: "sla-sammen-og-sorter" },

    { from: "sla-sammen-og-sorter", to: "fant-minst-ett-vedtak" },
    { from: "fant-minst-ett-vedtak", to: "signifikant-historikk", label: "ja" },
    { from: "fant-minst-ett-vedtak", to: "ingen-signifikant-historikk", label: "nei" },
  ],
};
