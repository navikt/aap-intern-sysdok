#show math.equation: it => {
  show ".": ","
  it
}
#set math.cases(gap: 1.2em) 

#set text(lang: "nb")
#set par(justify: true)

#let endring(x) = block(fill: luma(240), inset: 8pt, radius: 4pt)[
    #text(fill: maroon)[
        === Forslag til endring:
        #x
    ]
]

#let usikker(x) = block(fill: luma(240), inset: 8pt, radius: 4pt)[
    #text(fill: olive)[
        === Avklaringsbehov:
        #x
    ]
]

= Beregninger
Versjon: 30. september 2026, kl. XX.XX

== Ansvarsfordeling mellom Kelvin og felles utbetalingssystem

En ytelsesbehandling i Kelvin ender alltid opp med tilkjent ytelse: en oversikt over hvor mye arbeidsavklaringspenger en person har rett på.

Kelvin sender tilkjent ytelse til Navs felles utbetalingssystem,
og utbetalingssystemet har ansvar for finne ut om Nav skal utbetale,
registere feilutbetalinger eller begge deler. Selv om Kelvin sier
at brukeren har rett på arbreidsavklaringspenger, så vil ikke det
nødvendigvis føre til full utbetaling (pga. skatt). Eller (usikker)
noen utbetaling i det hele tatt på grunn av innkreving?

Tilkjent ytelse forteller hvor mye arbeidsavklaringspenger medlemmet
har rett på for enkeltdager. Størrelsen på arbeidsavklaringspenger
er alltid i hele kroner og spesifisert på dag-nivå; Kelvin har ingen
måte å fortelle utbetalingssystemet hvor mye arbeidsavklaringspenger
en person har for en periode større enn en dag: selv om dagene
grupperes sammen i utbetalingsperioder, så er det størrelsen på AAP
for enkeltdagene som blir gitt, ikke summen for utbetalingsperioden.


=== Eksempel: Feilutbetaling

En person drar til utlandet på ferie 1. og 2. april, til et land
uten trygdeavtale. Nav har utbetalt 2 000 kroner i AAP for disse
to dagene. I august får Nav vite om utenlandsoppholdet, og i en
behandling i Kelvin, vurderes det at ftrl. § 11-3 ikke var oppfylt
1. og 2. april.

Kelvin vil da oppdatere tilkjent ytelse, slik at det står at medlemmet
har rett på 0 kroner den 1. og 2. april. Kelvin sender den oppdaterte
tilkjente ytelsen til utbetalingssystemet.


Utbetalingssystemet vil se at de allerede har utbetalt 1 000 kroner i
AAP for 1. april og 1 000 kroner i AAP for 2. april, og registrere
2 000 kroner i feilutbetaling.


Tilkjent ytelse og grensesnittet mot utbetaligsløsningen er altså
basert på hvor mye arbeidsavklaringspenger medlemmet har rett på,
uavhengig av om det er utbetalt, etterbetalt, feilutbetalt eller
ikke utbetalt. Kelvin informerer aldri om endringen (differansen),
men ønsket resultat (rett).

Legg merke til at endringen i tilkjent ytelse legger seg på dagene
hvor ferien skjedde i april, ikke den dagen vedtaket ble fattet i
august.

== Notasjon og generelt

Skriver $x_[3]$ og $4_[2]$ for henholdsvis en variabel $x$ med $3$ desimaler og tallet $4$ med $2$ desimaler ($4.00$). Dette er bare en stadfestelse av antall desimaler, ikke en avrunding i seg selv.

Skriver generelt $(A)_[2]$ for å spesifisere at $A$ representeres med 2 desimaler.

Skriver $round(A)_4$ for å runde av $A$ til fire desimaler med vanlig skole-avrunding.

For operasjoner $+$, $-$, $times$ og $div$, skriver vi (med $times$ som eksempel)
$A times_[4, ≈] B$ for multiplikasjon av $A$ og $B$ utført med $4$ desimaler, og hvor resultatet 
rundes av etter skole-avrunding. Og vi skriver
$A times_[2, =] B$ for multiplikasjon av $A$ og $B$ utført med $2$ desimaler, og hvor resultatet
er uten tap av presisjons.

Prosenter representeres typisk som et tall mellom $0$ og $1$. For
eksempel $100%$ representeres gjerne som $1.00_[2]$ og $50%$ som
$0.50_[2]$.

Noen av operasjonene i uttrykkene kan virke unødvendige fordi noen
operasjoner kan slås sammen til én operasjon (typisk aritmetikk som
øyeblikkelig avrundes), men er tatt med fordi de representerer hva
som faktisk kjører. Dette skjer typisk fordi man må bryte 
abstraksjons-nivåer for å kunne forenkle uttrykket.

== Ordinært grunnlag etter § 11-19

$
    "2023-inntekt-i-G"_[10] :=& "2023-inntekt-i-kr"_[2] div_[10,≈] "gjennomsnitts-G-2023"_[2] \
    "2023-inntekt-6G-begrenset-i-G"_[10] :=& cases(
        "2023-inntekt-i-G"_[10] &"hvis" "2023-inntekt-i-G"_[10] <= 6,
        6_[10] &"hvis" "inntekt-år-2023-i-G"_[10] > 6,
    )
$

== Dagsats før reduksjoner, gradering og barnetillegg
$
"minste-årlige-ytelse"_[10] :=& cases(
    2_[10] quad &"til og med 30 juni 2024",
    2.041_[10] quad &"fra og med  1 juli 2024",

)\
"justert-minste-årlige-ytelse"_[10] :=&
    cases(
        ("minste-årlige-ytelse"_[10] times_[10, =] 2_[0])_[10] div_[10, ≈] 3_[0]
            quad &"når under 25",
        "minste-årlige-ytelse"_[10] &"når 25 eller eldre",
    )\
"ikkejustert-årlig-ytelse"_[10] :=& round("grunnlagsfaktor"_[10] times_[12, =] 0.66_[2])_10 \
"årlig-ytelse"_[10] :=& 
    max("ikkejustert-årlig-ytelse"_[10], "justert-minste-årlige-ytelse"_[10]) \
"dagsats-i-G"_[10] :=& "årlig-ytelse" div_[10, ≈] 260_[0] \
"dagsats-i-kr"_[2] :=& round("grunnbeløp"_[2] times_[12, =] "dagsats-i-G"_[10])_2
$

Det er ikke mulig å bli kvitt divideringen, for $0.66 / 260$ kan ikke skrives som et endelig desimaltall.

#endring[
Flytt divisjon på $260$ helt til slutt. Da er ikke lenger dagsatsen i G en del av utregningen, så
slutter derfor å lagre dagsats i G.

For perioder under 25, så ender vi opp med to avrundinger. For perioder over 25, blir det én avrunding
helt til slutt.

$
"ikkejustert-årlig-ytelse"_[12] :=& "grunnlagsfaktor"_[10] times_[12, =] 0.66_[2] \
"dagsats-i-kr"_[0] :=& 
("grunnbeløp"_[2] times_[12, =] "årlig-ytelse"_[10])_[12] div_[0, ≈] 260_[0]
$
]

#usikker[
Greier vi å bli kvitt avrundingen i minstesats-beregningen for de under 25? F.eks. ikke dele på 3 i utregningen
av minstesatsen for de under 25, men heller gange opp $"ikkejustert-årlig-ytelse"$ med 3 og minstesats for de over 25 med 3, og så dele på $3 times 260$ i stede for $260$?

Hvordan skal vi vise fram den utregningen? Vil folk forstå?
]



== Beregning av reduksjon pga. arbeid
Andelen arbeid regnes ut for perioder. Reduksjonen beregnes per dag.
En periode vil som oftest være en meldeperiode, men 
det finnes unntak hvor en periode er mindre enn en meldeperiode.

Vi regner ut $"antall-hverdager"_[0]$ for perioden $P$ med:
$
 sum_("dato" in P) 
            cases(
                0 quad &"hvis" "dato" "er lørdag eller søndag",
                0 &"hvis" "ikke rett til AAP på dato",
                0 &"hvis" "ikke levert timer for dato",
                1 &"ellers"
            )
$


Vi regner ut $"timer-arbeidet"_[n]$ for perioden $P$ med:
$
 sum_("dato" in P)
    cases(
        0 &"hvis" "ikke rett til AAP på dato" ,
        0 &"hvis" "ikke levert timer for dato",
        "timer"_[1] "på dato" quad quad &"ellers",
    )
$

#endring[
Måten vi regner ut $"timer-arbeidet"$ på, gjør at vi ender opp med vilkårlig antall
desimaler, men det skal egentlig være mulig å gjøre utregningen med
1 desimal hele veien.

Foreslår å regne ut $"timer-arbeidet"_[1]$ slik at spesifikasjon kan forenkles samtidig som
implementasjonen ligner på spesifikasjonen.
]

Vi regner ut $"andel-arbeid"_[2]$ for perioden $P$ med:
$ cases(
        0_[2] &"hvis" "antall-hverdager"_[0] = 0,
                round("min" cases(
                    1_[2],
                    frac(
                         10 times_[n,=] "timer-arbeidet"_[n],
                         37.5 times_[1,=] 2 times_[1,=] "antall-hverdager"_[0]
                    ) [3, ≈],
                ))_2 quad&"hvis" "antall-hverdager"_[0] > 0,
    )
$
Resultatet $"andel-arbeid"$ vil videre brukes for hver dag i perioden $P$.

#endring[
Vi regner ut $"andel-arbeid"_[5]$ for perioden $P$ med:
$ cases(
        0_[5] &"hvis" "antall-hverdager"_[0] = 0,
                "min" cases(
                    1_[5],
                    frac(
                         10 times_[1,=] "timer-arbeidet"_[1],
                         37.5 times_[1,=] 2 times_[1,=] "antall-hverdager"_[0]
                    ) [5, ≈],
                ) quad&"hvis" "antall-hverdager"_[0] > 0,
    )
$
]

#usikker[
Det er foreslått (?) endringer (?) i hvordan fastsatt-arbeidsevne
skal tas med i beregningen. Burde vi avklare dette og ta det med
i én større endring?
]

Graderingen på grunn av andel arbeid,
$"gradering-arbeid"_[2]$, regnes ut per dag:
$
 cases(
    0.00_[2] &"hvis" "timer mangler denne dagen",
    0.00_[2] &"hvis" "andel-arbeid"_[2] > "grense"_[2],
    1.00_[2] - max 
        cases(
                "andel-arbeid"_[2] ,
                "fastsatt-arbeidsevne"_[2]
        )
    quad&"hvis" "andel-arbeid"_[2] <= "grense"_[2]
    )
$

#endring[
Graderingen på grunn av andel arbeid,
$"gradering-arbeid"_[5]$, regnes ut per dag:
$
 cases(
    0_[5] &"hvis" "timer mangler denne dagen",
    0_[5] &"hvis" "andel-arbeid"_[5] > "grense"_[2],
    1_[5] - max 
        cases(
                "andel-arbeid"_[5] ,
                "fastsatt-arbeidsevne"_[2]
        )
    quad&"hvis" "andel-arbeid"_[5] <= "grense"_[2]
    )
$
]

== Gradering
Den endelige $"gradering"_[2]$ regnes ut som
$
 round(vec(&quad 1.0,
                        &thick -_[2,=] (1.00 - "gradering-arbeid"_[2]),
                        &thick -_[2,=] "reduksjon-uføre"_[2],
                        &thick -_[2,=] "reduksjon-samordning"_[2],
                        &thick -_[2,=] "reduksjon-ytelser-arbeidsgiver"_[2],
                        &thick -_[2,=] "reduksjon-meldeplikt"_[2],
            )_[2]
                  &times_[4, =] "reduksjon-institusjon"_[2]
            )_2
$

#endring[
Redusjon på grunn av timer arbeidet regnes ut med 5 desimaler
(tilsvarende prosent med 3 desimaler). Hele utregningen
skjer uten tap av presisjon.

Den endelige $"gradering"_[7]$ (tilsvarende prosent med 5 desimaler) regnes ut som
$
 vec(&quad 1.0_[5],
                        &thick -_[5,=] (1_[5] -_[5,=] "gradering-arbeid"_[5]),
                        &thick -_[5,=] "reduksjon-uføre"_[2],
                        &thick -_[5,=] "reduksjon-samordning"_[2],
                        &thick -_[5,=] "reduksjon-ytelser-arbeidsgiver"_[2],
                        &thick -_[5,=] "reduksjon-meldeplikt"_[2],
            )_[5]
                  &times_[7, =] "reduksjon-institusjon"_[2]
$
]

== Redusert dagsats / faktisk dagsats
For hver dag, regner vi ut $"redusert-dagsats"_[2]$, som er hvor mye AAP medlemmet har rett på for den dagen.
Trekk på grunn av § 11-9 skjer på siden.
$
round(
mat(delim: #none, align: #left, gap: #1.2em,
        thin &round("dagsats-i-kr"_[2] times_[4, =] "gradering"_[2])_2;
        med +_[2,=]med &round("barnetillegg-i-kr"_[2] times_[4, =]  "gradering"_[2])_2;
        med -_[2,=]med &"barnepensjon"_[2];
)
)_0
$

#endring[
For hver dag, regner vi ut $"redusert-dagsats"_[7]$, som er hvor mye AAP medlemmet har rett på for den dagen.
$
round(
mat(delim: #none, align: #left, gap: #1.2em,
                    &round("dagsats-i-kr"_[2] times_[9, =] "gradering"_[7])_2;
        +_[2,=]med  &round("barnetillegg-i-kr"_[2] times_[9, =]  "gradering"_[7])_2;
        -_[2,=]med  &"barnepensjon"_[2];
)
)_0
$
]

#usikker[
Skal redusert dagsats og redusert barnetillegg regnes ut og avrundes hver for seg,
og så summeres, som i dagens løsning. Eller ønsker vi å redusere summen dagsats og barnetillegg,
slik at vi bare får én avrunding helt til slutt?

$
    round(
      (("dagsats-i-kr"_[2] + "barnetillegg-i-kr"_[2])_[2] times_[9, =] "gradering"_[7])
        -_[2,=] "barnepensjon"_[2]
    )_0
$

]

//== Dagsats for melding om vedtak
//Den endelige $"gradering-melding-vedtak"_[2]$ regnes ut som
//$
// mat(align: #left, gap: #1.2em, delim: #none,
//                  & 1_[2];
//    thick -_[2,=] thin &"reduksjon-uføre"_[2];
//    thick -_[2,=] &"reduksjon-samordning"_[2];
//    thick -_[2,=] &"reduksjon-ytelser-arbeidsgiver"_[2];
//    thick -_[2,=] &"reduksjon-ytelser-arbeidsgiver"_[2];
//    thick -_[2,=] &"reduksjon-institusjon"_[2];
//)
//$
//
//Dagsats i brev:
//$
//round(
//    mat(delim: #none, align: #left, gap: #1.2em,
//                &round("dagsats-i-kr"_[2] times_[4, =] "gradering-melding-vedtak"_[2])_2;
//        +_[2,=] &round("barnetillegg-i-kr"_[2] times_[4, =]  "gradering-melding-vedtak"_[2])_2;
//    )
//)_0
//$
//
//= Virkning for nye regler
//Er naturlig å se på dette som to forskjellige endringer: av reduksjon på grunn av arbeid 
//og av dagsatsen.
//
//== Alternativ 0
//Erstatt gammel regel med ny regel, slik at alle behandlinger (inkl. meldekort, G-regulering) omgjør tilbake
//i tid. Fire varianter:
//
//#enum(numbering: "a.",
//    [sender melding om vedtak, og omgjør i alle saker],
//    [sender melding om vedtak, men omgjør kun hvis det opprettes behandling av andre årsaker],
//    [ingen melding om veddtak, og omgjør i alle saker],
//    [ingen melding om vedtak, men omgjør kun hvis det opprettes behandling av andre årsaker],
//)
//
//
/// Pro: Enkelt å implementere (spesielt variant d.)
/// Pro: Færre «regelverksendringer» 
/// Cons: Juridisk feil (?)
/// Cons: Fører til at mange tilbakekrevingssaker opprettes
/// Cons: Ingen melding om vedtak (for variant c og d)
//
//== Alternativ 1
//Behold gamle beregnings-regler og legg til nye beregnings-regler,
//sammen med en forretningsregel som forteller når gamle regler skal
//brukes og når nye regler skal brukes.
//
//Parametere til forretningsregelen kan være «hva som helst», som når
//saken ble opprettet, når første vedtak ble fattet, når første
//innvilgende vedtak ble fattet, osv.
//
//Hvilke perioder i en sak som skal ha hvilken beregnings-regel kan også
//spesifiseres i forretningsregelen.
//
//Når det kommer fremtidige regelendringer eller andre praksis-endringer
//som vi ikke ønsker å omgjøre, så må forretningsregelen kunne beskrive 
//helheten.
//
//I eksemplenen nedenfor er 1. desember er bare eksempel, men må være
//en konkret dato tilstrekkelig langt frem i tid.
//
//=== Alternativ 1a: Søknadstidspunkt
//
//Regel: Alle søknader mottatt før 1. desember bruker gammel regel for hele stønadsperioden.
//Alle fra 1. desember bruker ny regel.
//
//
//=== Alternativ 1b: Innvilgelsestidspunktet
//
//Regel: Hvis første innvilgelsesdato er før 1. desember, brukes 
//gammel regel ut stønadsperioden. Etterfølgene stønadsperioder bruker 
//ny regle. Hvis første innvilgelsesdato er fra 1. desember, brukes
//ny regle i hele stønadsperioden.
//
//Valget av 1. desember er bare eksempel, men må være en konkret dato i fremtiden.
//
//=== Alternativ 1c: Basert på periode som vurderes
//
//Regel: For alle saker så brukes gammel regel for vurdering av periode
//
//
