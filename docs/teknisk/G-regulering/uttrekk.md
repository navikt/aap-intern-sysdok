# G-regulering

Løsningen for G-regulering etablert i 2026 har i hovedsak 2 startpunkter for å identifisere og igangsette G-regulering.
 - Uttrekksjobb for iverksatte saker
 - Tilbakeflyt for pågående saker

I tillegg vil dagens meldekort løsning trigge G-regulering når nye meldekort kommer inn til behandlingsflyt da dette medfører tilbakeflyt grunnet meldekort-informasjonskrav. 
Da vil en omberegning av ytelse utføres og dagsats blir automatisk basert på en evtuelt ny G-justering i Grunnbeløp.kt for relevant del av AAP-perioden.

## Komponentdiagram for Uttrekksjobb

```mermaid
flowchart TD
     CRON["⏰ Cron kl. 05:00\nOpprettJobbForGReguleringJobbUtfører"]
     
     CRON --> CHECK_TOGGLE1{Feature toggle\nGReguleringUtplukkJobb?}
     CHECK_TOGGLE1 -->|Av| SKIP1[Hopp over]
     CHECK_TOGGLE1 -->|På| CHECK_G{Finnes G-justering\nfor inneværende\nG-periode i Grunnbeløp.kt?}
     
     CHECK_G -->|Nei| SKIP2[Avslutt – ingen\nG-justering funnet]
     CHECK_G -->|Ja| QUERY_DB[("DB: Finn saker med\ngammelt grunnbeløp\ni tilkjent_periode\n(etter G-justeringsdato)")]
     
     QUERY_DB --> QUEUE["Legg OpprettBehandlingGRegulering-jobb\ni kø for hver kandidat-sak"]
 
     subgraph PerSak["Per sak (OpprettBehandlingGReguleringJobbUtfører)"]
         QUEUE --> CHECK_TOGGLE2{Feature toggle\nGReguleringsJobb?}
         CHECK_TOGGLE2 -->|Av| SKIP3[Hopp over]
         CHECK_TOGGLE2 -->|På| CHECK_FB{Åpen\nførstegangsbehandling?}
         CHECK_FB -->|Ja| SKIP4[Hopp over –\nhåndteres via\ninformasjonskrav]
         CHECK_FB -->|Nei| CHECK_DONE{Fullført\nG-regulering\nallererede?}
         CHECK_DONE -->|Ja| SKIP5[Hopp over]
         CHECK_DONE -->|Nei| CHECK_VED{Finnes gjeldende\nbehandling med\nfattet vedtak?}
         CHECK_VED -->|Nei| SKIP6[Ingen behandling\nopprettes]
         CHECK_VED -->|Ja| CREATE_BEHANDLING["Opprett ny behandling\nÅrsak: G_REGULERING\nVurderingsbehov: G_REGULERING"]
     end
 
     subgraph Prosessering["Automatisk behandlingsprosessering"]
         CREATE_BEHANDLING --> GRUNNBELOEP["GrunnbeløpInformasjonskrav\nSammenlign Grunnbeløp.kt-tidslinje\nmed grunnbeløp i tilkjent_periode"]
         GRUNNBELOEP -->|ENDRET| BEREGN["BeregnTilkjentYtelseSteg\nOmberegn ytelse med\nnytt grunnbeløp\nLagre ny tilkjent_ytelse"]
         GRUNNBELOEP -->|IKKE_ENDRET| AVSLUTTET1["Behandling avsluttes\nuten endring"]
         BEREGN --> IVERKSETT["IverksettVedtakSteg\nFatte og iverksette vedtak"]
         IVERKSETT --> UTBETAL_JOBB["Legg IverksettUtbetaling-jobb\ni kø"]
     end
 
     subgraph Utbetaling["IverksettUtbetalingJobbUtfører"]
         UTBETAL_JOBB --> HENT["Hent tilkjent ytelse\nfra siste fattede vedtak\n(UtbetalingService)"]
         HENT --> SEND["utbetalingGateway.utbetal()\n→ aap-utbetaling"]
     end
 
     SEND --> DONE["✅ Bruker mottar\nG-regulert ytelse"]
```

## Komponentdiagram for Tilbakeflyt

```mermaid
 flowchart TD
     subgraph Behandling_i_gang["Behandling i gang (FGB eller revurdering)"]
         direction TB
         EARLIER["... tidligere steg ...\n(Innhenting, vilkårsvurdering, underveis)"]
         BEREGN["BeregnTilkjentYtelseSteg\n✅ Kjørt med GAMMELT grunnbeløp"]
         SIMUL["SimulerUtbetalingSteg\n✅ Kjørt"]
         FORESLA["ForeslåVedtakSteg\n⏳ Venter på saksbehandler"]
 
         EARLIER --> BEREGN --> SIMUL --> FORESLA
     end
 
     G_ENDRING["🗓️ 1. mai: G endres\nGrunnbeløp.kt oppdateres\n(f.eks. 124 028 → 130 160)"]
 
     TRIGGER["Motor eller brukerhandling trigger\nProsesserBehandlingJobbUtfører"]
 
     G_ENDRING --> TRIGGER
 
     subgraph Forbered["forberedBehandling() i FlytOrkestrator"]
         CHECK["oppdaterFaktagrunnlagForKravliste()\nSjekker informasjonskrav for\npåpasserte steg"]
         GRUNNBELOEP_CHECK["GrunnbeløpInformasjonskrav.oppdater()\nSammenligner Grunnbeløp.kt-tidslinje\nmed grunnbeløp i tilkjent_periode"]
         GRUNNBELOEP_CHECK -->|ENDRET| TILBAKEFLYT["BehandlingFlyt.tilbakeflytEtterEndringer()\nFinner tidligste steg med\nGrunnbeløpInformasjonskrav\n→ BEREGN_TILKJENT_YTELSE"]
         GRUNNBELOEP_CHECK -->|IKKE_ENDRET| INGEN["Ingen tilbakeføring\nBehandling fortsetter normalt"]
         CHECK --> GRUNNBELOEP_CHECK
         TILBAKEFLYT --> BACKSTEPPING["FlytOrkestrator.tilbakefør()\nRuller tilbake ett og ett steg:\nForeslåVedtak → SimulerUtbetaling\n→ BeregnTilkjentYtelse"]
     end
 
     TRIGGER --> Forbered
 
     BACKSTEPPING --> NY_BEREGN["🔄 BeregnTilkjentYtelseSteg kjøres på nytt\nBeregner med NYTT grunnbeløp\nLagrer ny tilkjent_ytelse"]
 
     NY_BEREGN --> NY_SIMUL["SimulerUtbetalingSteg"]
     NY_SIMUL --> SAKSBEHANDLER["ForeslåVedtakSteg\n👤 Saksbehandler ser oppdatert ytelse\nog bekrefter"]
 
     SAKSBEHANDLER -->|Saksbehandler godkjent| BESLUTTER["FatteVedtakSteg\n👤 Beslutter godkjenner\n(to-trinns kontroll)"]
 
     BESLUTTER -->|Beslutter iverksetter| IVERKSETT["IverksettVedtakSteg\nFatter vedtak\nKøer IverksettUtbetaling-jobb"]
 
     IVERKSETT --> UTBETAL_JOBB["IverksettUtbetalingJobbUtfører\nHenter tilkjent ytelse\nfra siste fattede vedtak"]
 
     UTBETAL_JOBB --> AAP_UTBETALING["utbetalingGateway.utbetal()\n→ aap-utbetaling"]
 
     AAP_UTBETALING --> DONE["✅ Bruker mottar\nG-regulert ytelse"]
 
     subgraph Begrensning["⚠️ Viktig begrensning"]
         NOTE["Etter sluttÅOppdatereFaktagrunnlag()\n(mellom ForeslåVedtak og FatteVedtak)\nsjekkes IKKE informasjonskrav lenger.\n\nBehandlinger som allerede venter på beslutter\nblir 
IKKE auto-tilbakeført –\nde håndteres av batch-jobben\netter at behandlingen er vedtatt."]
     end
```
