# Oppgave
Det er her saksbehandlere får oversikt over sine reserverte oppgaver og ledige oppgaver. Kelvin bruker ikke Gosys for oppgavehåndtering, og har i stedet sin egen løsning. Denne har ansvar for å opprette oppgaver, logikk for reservering og fordeling til riktig saksbehandler og enhet. 

## Hvordan utledes oppgavens enhet?
Oppgave bruker Norg til å utlede enheten gitt brukers geografiske tilknytning, skjerming og adressebeskyttelse, men sender ikke med behandlingstype, oppgavetype eller annen informasjon. Det er derfor en del logikk for å finne riktig enhet som ligger i selve oppgaveløsningen. For å sikre at adressebeskyttelse blir riktig, må oppgave ta hensyn til alle relevante identer på en behandling, altså alle brukers identer og alle identene til brukers barn. Følgende regler gjelder i prioritert rekkefølge:
* Hvis oppgaven skal løses av saksbehandler nasjonal eller beslutter kalles ikke Norg:
    * Hvis personen eller barn av personen har strengt fortrolig adresse, settes enhet til Nav Vikafossen (2103)
    * Hvis personen har skjerming, settes enhet til NAY Egen ansatt (4483)
    * Hvis oppfølgingsenhet er satt til NAV Utland (0393), settes enheten til NAY Utland (4402)
    * Hvis personen ikke har geografisk tilknytning til Norge, settes enheten til NAY Utland (4402)
    * Oppgaven settes til NAY (4491)
* Hvis oppgaven skal løses av kvalitetssikrer kalles Norg:
    * Hvis enhet returnert fra Norg er Vikafossen (2103), bruk denne
    * Hvis enhet returnert fra Norg slutter på 83, og derfor er egen ansatt-enhet, bruk denne
    * Hvis oppfølgingsenhet er satt til NAV Utland (0393), skal NAV Utland også kvalitetssikre
    * Fylkesenhet hentes fra Norg basert på enhet originalt returnert fra Norg. Dersom flere fylkesenheter returneres, prioriteres de med samme første to sifre som den originale enhten.
* Hvis oppgaven skal løses av lokal saksbehandler kalles Norg:
    * Hvis personen har skjerming eller personen eller barn av personen har strengt fortrolig adresse, brukes enhet fra Norg (henholdsvis egen ansatt-enhet og Nav Vikafossen) 
    * Hvis (1) personen ikke har geografisk tilknytning til Norge, eller (2) personen ikke har geografisk tilknytning i PDL i det hele tatt, eller (3) personen har geografisk tilhørighet til 9999 (ukjent kommune), settes enheten til NAV Utland (0393) 
    * Hvis personen har oppfølgingsenhet fra arbeidsrettet oppfølging i Arena, bruk denne
    * Bruk enhet fra Norg (lokalkontor)
    * Unntak: hvis oppgaven tilhører en førstegangsbehandling og skulle lagt seg på enten 1401, 1428 eller 1432, ruter vi isteden oppgaven til 1476 (regionskontor Nav Sunnfjord). Vi har laget eget unntak for dem så de skal få jobbe på samme måte som de gjorde i Arena.
    * Unntak: hvis oppgaven er klagehåndtering på Nav-kontor og bruker hører til et fylke som ønsker å håndtere klage på fylkesnivå, utledes enhet på samme måte som for kvalitetssikringsoppgaver. Hittil gjelder dette bare for Vest-Viken.

### Hva om avklaringsbehovet for oppgaven kan løses av både saksbehandler og veileder?
* Hvis avklaringsbehovet er et ventebehov, lages det ikke oppgave på det. Oppgaven på avklaringsbehovet som var åpent før behandlingen ble satt på vent forblir åpen, men med "på vent"-status.
* Hvis avklaringsbehovet skal kunne løses av begge roller, sendes oppgaven til Nav-kontor dersom det sist endrede avklaringsbehovet på behandlingen kunne løses av Nav-kontor. Ellers går oppgaven til NAY.
   * Eksempel: hvis oppgaven lå på 11-5 i det noen trykket "trekk søknad" (som kan løses av begge roller), går oppgaven til Nav-kontor.
