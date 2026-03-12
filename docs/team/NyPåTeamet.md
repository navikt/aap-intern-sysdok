---
sidebar_position: 02
---

# Ny som utvikler i teamet 🌱

Velkommen til team AAP! Dette er en guide for deg som er ny i teamet. Er det noe som mangler, eller er uklart så må du ikke nøle med å si ifra.
Gjerne se over og oppdater guiden når du har gjort deg noen erfaringer som kan være nyttige for andre.


## En anbefaling over ting som kan være greie å starte med


### Standardoppsett for alle utviklere i Nav

Følg stegene i guiden [Oppsett for ny Mac eller Linux](https://navikt.github.io/ny-i-nav/ny-unix).

_Merk 1_: Hvis ikke du er koplet på Nav sin Wifi, kan det gjøres med e-post og det nye passordet du setter opp i
guiden ovenfor.
_Merk 2_: I steget for installasjon av gcloud, angi følgende:
- `aap-dev` når du blir spurt om default-prosjekt
- `europe-north-1` når du blir spurt om geografisk område

### Installer en passord-manager

Du må skrive inn passordet ditt sinnsykt mange ganger i løpet av vanlig arbeidsdag. Jeg anbefaler å lagre Nav-passordet ditt
i en skikkelig password-manager først som sist. Gode alternativer er 1password (koster 💰) eller Bitwarden.

Husk at du har to ulike passord:

- Ett passord for å låse opp Macen din. Dette må du typisk _skrive inn manuelt_ en del ganger, så det kan være
  fornuftig at det er lettskrevet (men helst 16 tegn eller mer). Hvis du legger inn Touch ID i Macen din, vil du gjøre
  livet ditt litt enklere.
- Nav-passordet ditt. Dette bruker du _bare_ når du ser en _Nav-logo_ i innloggingsboksen. Dette passordet trenger du
  aldri å skrive manuelt hvis du bruker en password manager, så jeg anbefaler å bruke et autogenerert passord her.

### Bli lagt til i AD-gruppa til teamet

Dette gjøres fra [NAIS Console](https://console.nav.cloud.nais.io/team/aap/members) av noen som har
eier-status til Team AAP. Når du gjør dette vil du automatisk få tilgang til masse saker, f.eks. GitHub og
Google Cloud Platform.

### Installer Intellij IDEA Ultimate

De fleste av oss bruker Intellij IDEA Ultimate som IDE. Dette får du lisens for. Med dersom du ønsker å bruke et annet IDE, er det ikke noe i veien for det.
1. Last ned Intellij IDEA Ultimate
2. Lag JetBrains-bruker med NAV-eposten din, og logg inn på den i Intellij. Har du ikke Ultimate-lisens, kan du sende en
   melding i Slack-kanalen `#intellij-lisenserver`. I mellomtiden har du en måneds prøvetid.

### Sett opp signering av git-commits

For å flette kode til main i GitHub er det kjekt med  _signerte commits_ (ikke alle har skrudd dette på). Det er forskjellige måter å sette det opp
det på, avhengig av om du vil lagre nøkkelen din i 1Password eller ikke.

- Hvis du ikke bruker 1Password:
    1. Følg [guiden til IntelliJ](https://www.jetbrains.com/help/idea/set-up-GPG-commit-signing.html). Her vil du
       generere en GPG-nøkkel som bruker hver gang du committer noe via Intellij-GUIet.
    2. Nøkkelen må
       også [limes inn i GitHub](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account).
    3. Merknad: Hvis du bruker git fra terminalen utenfor IntelliJ må du også fortelle git-configen om GPG-nøkkelen
       din. [Denne guiden](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key)
       forklarer hvordan.
- Hvis du bruker 1Password kan du scanne fingeratrykket ditt for å signere
  commitsa. [Se denne guiden for oppsett. ](https://developer.1password.com/docs/ssh/git-commit-signing/)

### Logg inn i GitHub Packages

For å laste ned avhengigheter for frontend så trenger man å logge inn i `pkg.github.com` med `@navikt`-scope. Gjør
følgende:

1. Gå til https://github.com/settings/tokens og lag en PAT (personal access token). Tokenet må minimum ha scopet
   `Packages:read`
2. Etter tokenet er generert og du har kopiert det, må du enable SSO for det. Trykk på "Configure SSO" og "Authorize"
   for _navikt_ for det nylagde tokenet.
3. Legg `export GITHUB_TOKEN=<TOKEN>` i shellet ditt et sted (f.eks `.zshrc`).


### Installer et Docker-miljø

Her finnes det mange alternativer, _Colima_, _OrbStack_ og sikkert flere.  De fleste av oss bruker Colima. Docker Desktop anbefales ikke pga lisenser.

### Sett opp SSH-nøkler på Github

Om du ikke har det allerede, sett opp [SSH-nøkler](https://github.com/settings/keys) for Github-brukeren din. Du må også sette opp SSO, slik at man bruke nøkkelparet om navikt-organisasjonen.

### Repositories

Vi har mange repositories. Disse finnes [her](https://github.com/search?q=topic%3Anavikt-aap+org%3Anavikt+archived%3Afalse&type=repositories) (forutsetter at vi husker å tagge repoet med `navikt-aap`)

Hovedapplikasjonene våre er beskrevet på denne siden.

### Nyttige lenker

- [Hvordan teste en behandling i Kelvin](https://confluence.adeo.no/spaces/PAAP/pages/608408726/Hvordan+teste+en+behandling+i+Kelvin)
- [Nais console](https://console.nav.cloud.nais.io/team/aap/)
- [Dolly](https://dolly.ekstern.dev.nav.no/gruppe/7567) - for opprettelse av testpersoner
- [Ida](https://ida.intern.nav.no/) - for generering av test-identer (innlogging i dev)
- [Felgen](https://felgen.intern.nav.no/) - et vanvittig utvalg NAV-lenker
- [Security Playbook](https://sikkerhet.nav.no/) - best practices for sikkerhet i NAV
