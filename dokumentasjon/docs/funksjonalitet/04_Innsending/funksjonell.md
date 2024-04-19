---
sidebar_position: 1
---

# Funksjonell beskrivelse
Brukeren skal kunne sende inn søknad om AAP digitalt. <br/> 
Dette innebærer at brukeren skal kunne fylle ut søknadsskjema, legge ved dokumentasjon og sende inn søknaden.

For å gjøre dette, må det funskjenlt støtte:
- Hentes inn innformasjon fra registrene i NAV 
- Lagre søknad for innbygger

Det er bygget 2 komponenter for dette:
- Oppslag, som slår opp relevant informasjon fra registrene i NAV
- Innsending, som tar imot utfylt søknad og lagrer denne i NAV

## Oppslag
Oppslag er en komponent som henter informasjon fra registrene i NAV. 
- Oppslag henter navnet til brukeren for å vise det på påloggede sider på nav.no
- Oppslag henter informasjon om brukeren fra registrene i NAV som brukes i søknaden.
  - Personopplysninger om innbygger og dens barn
  - digital kontaktinformasjon
  - Om bruker har registrert fastlege
- Oppslag henter informasjon som bruker kan se på Mine AAP
  - Dokumenter tilknyttet bruker på tema AAP
  - Brev som NAV har sendt til bruker.
  - Dokumenter sendt inn av andre på vegne av innbygger, som er knyttet til søknad om AAP.

## Innsending
En innsending kan være enten en søknad eller en ettersendelse

### Motta innsending
- søknad har json råformat
- søknad kan sendes med og uten vedlegg
- ettersendelse har ikke json råformat
- ettersendelse kan bestå av fler vedlegg
- innsendinger lagres i PosgreSQL

### Mellomlagre innsending
- søknad mellomlagres før den faktisk sendes inn.
- vedlegg mellomlagres før de faktisk sendes inn.
- mellomlagring skjer i Redis.
- Når det er sendt inn, slettes dataene fra Redis.

```mermaid
graph LR
A((API req)) -- fant PDF --> B((Antivirus))
A((API req)) -- fant IMG --> C((PDF Gen))
A((API req)) -- ingen fil --> D((API res))
A((API req)) -- tom fil --> D((API res))
A((API req)) -- feil content-type --> D((API res))
B((Antivirus)) -- ingen virus --> C((PDF Gen))
B((Antivirus)) -- virus --> D((API res))
C((PDF Gen)) -- generert --> E((PDF Valider))
C((PDF Gen)) -- feilet --> D((API res))
E((PDF Valider)) -- ugyldig --> D((API res))
E((PDF Valider)) -- kryptert --> D((API res))
E((PDF Valider)) -- lesbar/ukryptert --> F((Redis))
F((Redis)) -- lagret --> D((API res))
F((Redis)) -- feilet --> D((API res))
```


###y Arkivere innsending
- mottatte innsendinger arkiveres i Joark
- ved arkivering slettes dataene fra postgres og redis
- ved arkivering lagres metadata om hva som ble arkivert i joark


## Komponent diagram
![Komponent diagram Innsending](../../bilder/innsending.png)
[Mural](https://app.mural.co/t/navdesign3580/m/navdesign3580/1686128879741/be8d640e3e037731badc3a78c09db5c1c14a8e7f?sender=sturlehelland7470) 
