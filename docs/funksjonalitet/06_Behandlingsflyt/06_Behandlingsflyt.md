# Behandlingsflyt
[Forretningsflyt i Mural](https://app.mural.co/t/navdesign3580/m/navdesign3580/1691741508416/fd5f7a66bff6d60858a803726f0485840d12fdac?sender=sturlehelland7470)


For en konseptuell forståelse av hvordan Kelvin/behandlingsflyt fungerer,
kan det være lurt å tenkte på hvordan saksbehandling kunne fungert
hvis det skjedde kun med papir.

## Personmappe, sak og behandling

Ny forvaltningslov sier at saksbehandling [skal være
skriftlig](https://lovdata.no/lov/2025-06-20-81/§9).  Altså, Nav
skal produsere dokumenter når vi saksbehandler.

I Kelvin har hver person en personmappe.  Denne personmappen kalles
en «sak» i Kelvin. En personmappe består, konseptuelt sett, av alle
dokumentene mottatt og produsert i saksbehandlingen av AAP.

### Dokumenter
Når en veileder sitter i Kelvin og gjør en vurdering av vilkåret §
11-5 nedsatt arbeidsevne, så sender veilederen inn et strukturert
dokument med en begrunnelse, fra- og til-datoer, diagnoser og
ja/nei-svar på forskjellige spørsmål. Dette dokumentet lagres da i
personmappen, sammen med metadata om hva slags dokument det er,
hvem som skrev det og når de skrev det.

Begrepet «dokument» brukes her i vid forstand: en avgrenset mengde
opplysninger, uavhengig av om det er på papir, som PDF, JSON eller som
bestemte rader i en tabell i databasen. Begrepet «dokument» brukes i
kodebasen bare om innkommende dokumenter, ikke dokumenter
som produseres internt. Der er det «grunnlagene» som i stor grad
aggregerer dokumenter, i form av «vurderinger» med mer. 

Et annet viktig eksempel på et dokument som puttes inn i personmappen,
er opplysninger fra registeroppslag. Så når Kelvin gjør et oppslag
i yrkesskade-registeret, så lagrer Kelvin ned relevante opplysninger
fra oppslaget som et dokument i personmappen. Dette dokumentet
inneholder da også metadata om når opplysningene ble hentet fra
registeret og hvis det finnes flere registre det kan være hentet
fra, hvilket register det er hentet fra.

En tredje kategori på et dokument som puttes i personmappen, er
dokumenter som produseres av Kelvin selv.

Mot slutten av saksbehandlingsprosessen av AAP, så samler Kelvin
inn alle dokumentene som handler om forskjellige vilkår for retten
til AAP. Kelvin sammenstiller disse for å finne ut av hvilke perioder
medlemmet i utgangspunktet har rett til AAP, og for hver periode,
hvilken paragraf de får AAP etter. Dette samles i et dokument med
en tabell for de forskjellige periodene. Det er dette dokumentet
som inneholder avgjørelsen om når medlemmet har rett på AAP.

Enda senere i saksbehandlingsprosessen av AAP, så tar Kelvin og
samler inn alle relevante dokumenter som sier noe om størrelsen på
AAP, slik som saksbehandlers vurdering av antall barn som skal gi
barnetillegg, dokumentet som beskriver grunnlaget for størrelsen
på AAP, de automatiske vurderingene av meldeplikten, og mye mer.
Disse sammenstiller Kelvin i en tabell for forskjellige perioder,
med rader som forteller om de forskjellige reduksjonene og dagsatsene
før og etter reduksjon. Det er dette dokumentet som inneholder
avgjørelsen av hvor mye arbeidsavklaringspenger medlemmet har rett
på for konkrete dager.

Når saksbehandlingsprosessen er over, så sitter vi altså igjen med
en personmappe med mange dokumenter. Noen dokumenter er for oss
rene faktaopplysninger, slik som opplysninger fra eksterne register.
Andre dokumenter inneholder avgjørelser knyttet til enkelt-paragrafer,
slik som dokumentet hvor saksbehandler har skrevet ned datoen som
skal brukes som beregningstidspunkt.

### Slette og endre dokumenter
Personmappen inneholder dokumenter fra saksbehandlingen av AAP.
Disse dokumentene kan derfor være arkivverdige, som betyr at
vi ikke kan slette eller endre disse.

Hvis saksbehandler f.eks. har gjort en vurdering av at brukeren
oppfyller § 11-5 om nedsatt arbeidsevne, og vedtak fattes på bakgrunn
av denne vurderingen, så er dette dokumentet arkivverdig.

Hvis det viser seg at vurderingen er feil, så er det ikke lov å endre
selve dokumentet. Det ville vært som å ta med seg viskelær inn på
et arkivrom og viske ut tekst fra dokumenter og skrive noe annet.
Det å slette dokumentet er heller ikke lov. Det blir som å makulere
et arkivverdig dokument.

Det saksbehandler derimot må gjøre hvis de skal omgjøre vedtaket,
er å skrive en ny vurdering av vilkåret og fatte et vedtak basert
på det nye, riktige dokumentet.  Det gamle dokumentet eksisterer
fortsatt, men er bare et historisk dokument.

Det er ikke et total-forbud mot å slette dokumenter i personmappen.
Under saksbehandling, så er det naturlig å anse dokumentene
saksbehandler jobber med som utkast, frem til saksbehandler avslutter
saksbehandlingen.  Så lenge et dokument er et utkast, så er det
anledning til å endre dokumentet eller fjerne det helt om det viser
seg å ikke være nødvendig for å vurdere AAP, og ikke må tas vare
på av andre grunner.

### Behandling
Konseptet «behandling» i Kelvin er ment for å representere det som
er beskrevet over: oversikt over alle nye dokumenter som er mottatt
og skrevet som en del av saksbehandlingen, og å forhindre sletting
og endring av historiske dokumenter.

Det å «åpne» en behandling, er som å finne fram personmappa fra arkivet
og legge den på skrivebordet, slik at vi kan gjøre saksbehandling.
Etter å ha lagt personmappen på skrivebordet, kan vi legge inn nye
dokumenter. Slik som nye registeropplysninger, vurderinger, dokumentasjon
på kvalitetssikring, dokumenter som viser nye utregninger, og dokumentasjon
på at en beslutter har godkjent nye avgjørelser.

I motsetning til den virkelige verden, så vil Kelvin ha saksmappa åpen
på skrivebordet helt til saksbehandlingen er over. Først når vi er ferdig
med å saksbehandle, vil vi putte personmappa tilbake i arkivet.
Så lenge personmappa ligger på skrivebordet, så sier vi at (saks)behandlingen
er «åpen». Når saksbehandlingen er ferdig, og personmappen puttes tilbake
i arkivet, så er (saks)behandlingen «avsluttet».

Begrensningene på å endre og slette dokumenter, styres av om behandlingen
er åpen eller avsluttet. Så lenge (saks)behandlingen er åpen, så anser
vi de nye dokumentene som utkast, og de kan endres eller kastes som
saksbehandler ønsker. Når saksbehandler er ferdig og avslutter (saks)behandlingen,
så blir de nye dokumentene «låst», slik at de ikke kan endres eller slettes.


## Behandlingsflyt

Når vi snakker om «behandling» i Kelvin, så snakker man ofte om en
«behandlingsflyt».  Men personmappen med behandlinger, og behandlingsflyten
som består av steg, er konseptuelt to forskjellige ting: Vi kunne
hatt behandlinger som beskrevet over, men uten et flyt-konsept,
bare masse skjermbildet som saksbehandler kunne redigert. Eller
vi kunne hatt en flyt, uten konseptet med personmapper og behandlinger
som beskrevet over.

Formålet med behandlingsflyten er for å gi systemstøtte for brukerne
av systemet og for å heve kvaliteten på saksbehandlingen.  Konseptet
med personmappe og behandlinger, er relatert til begrepet «innebygd
arkiv», hvor systemet skal ha innebygde konsepter for å fungere som
eget arkiv.

Flyt-konseptet veileder saksbehandler gjennom stegene som vil gi
et vedtak og passer på at alle nødvendige vurderinger er gjort, ved
å løfte avklaringsbehov (oppgaver) der det er nødvendig. Flyten
har også ansvar for å forhindre at unødvendige vurderinger skjer,
eller å forhindre at man med en feil gjør om på vurderinger som
vanligvis ikke skal gjøres om på (som grunnlaget for AAP, f.eks.).

Det er ikke bare veilederen som styres av flyten: også hvilke
eksterne registere som skal sjekkes styres av flyten. Generelt
sett, så bestemmer flyten hvilken rekkefølge dokumenter skal hentes
inn i, uavhengig av om dokumentene skal komme fra veileder,
saksbehandler, et register, eller en automatisk vurdering.

Ulempen med en låst, sekvensiell flyt, er at uansett hvilken
rekkefølge vi setter stegene i, så vil det finnes situasjoner hvor
en annen rekkefølge hadde vært bedre. I en konkret sak som skal
ende i avslag, så hadde det vært ideelt om vilkåret vi skal gi
avslag på lå først i flyten.


### Vedtak

Konseptene rundt personmappe, behandling, dokumenter og flyt er i
utgangspunktet agnostiske til hva et «vedtak» er. De ivaretar
etterlevelse for saksbehandling generelt. Generelt sett, så
representerer en behandling en saksbehandlingsprosess, uavhengig
av om det fattes vedtak eller ikke.

Men spørsmålet om vedtaksstrukturen i Kelvin er ikke mindre viktig
av den grunn.

Forvaltnignsloven § 2:
> a. vedtak, en avgjørelse som treffes under utøving av offentlig
myndighet og som generelt eller konkret er bestemmende for rettigheter
eller plikter til private personer (enkeltpersoner eller andre
private rettssubjekter);
> 
> b. enkeltvedtak, et vedtak som gjelder rettigheter eller plikter
til en eller flere bestemte personer;

Alle dokumentene som produseres i Kelvin, enten det er av veileder,
saksbehandlers eller automatisk, er i stort avgjørelser for om
vilkår er oppfylt eller ikke, med tilhørende begrunnelse. Noen er
veldig snevre avgjørelser (i hvilke perioder er § 11-4 første ledd,
aldersvilkåret, oppfylt), mens andre dokumenter er mer oppsummerende:
gitt de snevre avgjørelsene om enkeltvilkår, er riktig kombinasjoner
av vilkår oppfylt for at medlemmet har rett på AAP?  Gitt avgjørelsene
om størrelsen på AAP, samordninger osv, hvor mye har medlemmet
faktisk rett på av arbeidsavklaringspenger?

Så lenge behandlingen er åpen, anser Kelvin de nye dokumentene som
utkast.  Det er først når behandlingen avsluttes, at dokumentene
anses som ferdige saksdokumenter, og i den grad noen av dokumentene
«er» vedtak, at de går fra å være utkast til fattede vedtak.

### Er behandling = vedtak?
Identiteten som ofte trekkes mellom behandling og vedtak er
til en viss grad uheldig. Generelt sett, så er det mulig å
(saks)behandle uten å fatte vedtak. Hovedideen som ble lagt til
grunn for Kelvin, er at det er naturlig å trekke en parallell mellom
ytelsesbehandlinger og vedtak, fordi ytelsesbehandlinger kun handler
om å avgjøre og dokumentere Navs avgjørelsen om retten til AAP.

Det kan selvfølgelig være at dette er en feil eller mangelfull
forståelse av vedtak, uten at vi går inn på det her nå.
