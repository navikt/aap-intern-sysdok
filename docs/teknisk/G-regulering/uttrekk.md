# G-regulering

Løsningen for G-regulering etablert i 2026 har i hovedsak 2 startpunkter for å identifisere og igangsette G-regulering.
 - Uttrekksjobb for iverksatte saker
 - Tilbakeløsning for pågående saker

I tillegg vil dagens meldekort løsning trigge G-regulering når nye meldekort kommer inn til behandlingsflyt da dette medfører informasjonskrav og omberegning av ytelse som da blir basert på aktiv G-justering i Grunnbeløp.kt.

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
