# Oppgave
Det er her saksbehandlere får oversikt over sine reserverte oppgaver og ledige oppgaver. Kelvin bruker ikke Gosys for oppgavehåndtering, og har i stedet sin egen løsning. Denne har ansvar for å opprette oppgaver, logikk for reservering og fordeling til riktig saksbehandler og enhet. 

## Hvordan utledes oppgavens enhet?
Oppgave bruker Norg til å utlede enheten gitt brukers geografiske tilknytning, skjerming og adressebeskyttelse, men sender ikke med behandlingstype, oppgavetype eller annen informasjon. Det er derfor en del logikk for å finne riktig enhet som ligger i selve oppgaveløsningen. For å sikre at adressebeskyttelse blir riktig, må oppgave ta hensyn til alle relevante identer på en behandling, altså alle brukers identer og alle identene til brukers barn. Følgende regler gjelder i prioritert rekkefølge:
* Hvis oppgaven skal løses av saksbehandler nasjonal eller beslutter kalles ikke Norg:
    * Hvis personen eller barn av personen har strengt fortrolig adresse, settes enhet til Nav Vikafossen (2103)
    * Hvis personen har skjerming, settes enhet til NAY Egen ansatt (4483)
    * Hvis personen ikke har geografisk tilknytning til Norge, settes enheten til NAY Utland (4402)
    * Oppgaven settes til NAY (4491)
* Hvis oppgaven skal løses av kvalitetssikrer kalles Norg:
    * Hvis enhet returnert fra Norg er Vikafossen (2103), bruk denne
    * Hvis enhet returnert fra Norg slutter på 83, og derfor er egen ansatt-enhet, bruk denne
    * Fylkesenhet hentes fra Norg basert på enhet originalt returnert fra Norg. Dersom flere fylkesenheter returneres, prioriteres de med samme første to sifre som den originale enhten.
* Hvis oppgaven skal løses av lokal saksbehandler kalles Norg:
    * Hvis personen ikke har geografisk tilknytning til Norge, settes enheten til NAV Utland (0393) (Denne bør vel nedprioriteres)
    * Hvis personen har skjerming eller adressebeskyttelse, brukes enhet fra Norg (henholdsvis egen ansatt-enhet og Nav Vikafossen)
    * Hvis personen har oppfølgingsenhet fra arbeidsrettet oppfølging i Arena, bruk denne
    * Bruk enhet fra Norg (lokalkontor)
