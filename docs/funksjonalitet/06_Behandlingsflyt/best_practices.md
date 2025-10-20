# Best practices og prinsipper for å implementere steg

## Anta periodisering som utgangspunkt
Du burde ta utgangspunkt i at vilkår må kunne periodiseres. Å støtte periodisering
av et vilkår kan aldri gi feil resultat. Flere vilkår må kunne periodiseres en det man skulle tro ved første øyekast.
En form for periodisering vil være nødvendig f.eks. hvis:
- Vilkåret må vurderes på nytt når vi mottar søknad etter opphør.
- Vilkåret skal gjelde fra en bestemt dato.

## Støtt flere nye vurderinger i en behandling
Selv om det i mange tilfeller er vanligst at det kommer en vurdering per behandling, så 
vil noen ganger være behov for flere vurderinger på en gang. På grunn av saksbehandlingstid
eller klagebehandling, så kan det være en lenger periode som må vurderes i én behandling.

Bruk `PeriodisertAvklaringsbehovLøsning` for å implementere løsninger av  avklaringsbehov.

## Bruk samme format for å returnere periodiserte vurderinger til frontend
Implementer interfaces `PeriodiserteVurderingerDto` for grunnlag du sender til frontend.

## Bruk opplysninger fra tidligere steg, samme behandling
Typisk vil det ideelle være å bruke opplysninger som er fra tidligere i samme behandling.
Da vil steget basere seg på opplysninger som blir gjeldende når vedtaket fattes i denne behandlingen. Dette kommer på spissen
ved omgjøring etter en dom fra domstolene. Potensielt sett er da forrige vedtak ugyldig,
og forrige vedtak skal ikke påvirke – spesielt ikke begrense – vedtaket for denne behandlingen.

Hvis steget bruker opplysninger fra tidligere behandlinger, så risikerer vi at steget
baserer seg på opplysninger som er ugyldige.

## Bruk hjelpemetodene for å oppdatere avklaringsbehov
Bruk hjelpemetodene fra `AvklaringsbehovService` for å styre avklaringsbehov.

Et avklaringsbehov er ikke bare en mekanisme for å få hjelp fra et menneske:
de forskjellige statusene til et avklaringsbehov påvirker også kvalitetssikring og beslutter-steget.

Et steg kan kjøres mange ganger, og du kan ikke gjøre noen antagelser om hva som har skjedd
tidligere.

Saksbehandler kan også gjøre endringer i et tidligere steg som påvirker hvorvidt
vi trenger et avklaringsbehov i steget du implementerer.

## Rydd opp både vurderinger og vilkårsvurderinger
Siden nye opplysninger kan dukke opp i saksbehandlingen og 
siden saksbehandlere kan ombestemme seg, så kan det endre
seg om steget ditt er relevant. Det må da greie å rydde opp
etter selg selv. Oppryddingen gjelder både vurderinger fra saksbehandlinger og
utfall for vilkår og utregninger.

Hjelpemetodene i `AvklaringsbehovService` hjelper deg med å identifisere disse tilfellene.