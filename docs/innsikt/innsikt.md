---
sidebar_position: 5
---

# Innsikt

Innsikt innsikt

## Sammenligne Arena-beregning og Kelvin-beregning

Det er satt opp et enkelt skript for å sammenligne beregning fra Arena og Kelvin basert på CSV-filer.

Sjekk ut `aap-behandlingsflyt`, og kjør

```bash
cat AAP_SyntetiskData.csv | ./gradlew -q beregnCSV > output.csv
```

Dette kjører `main`-metoden i `BeregnMedCSV.kt`. For å fjerne litt støy i `output.csv`, kan man (ikke commit!) slette log-config slik:

```bash
rm app/src/main/resources/logback.xml
rm app/src/test/resources/logback.xml
```

Eksempel-kjøring:
```
> cat test.csv
,INTSISTE,INTNESTS,INTTREDS,AAPBER,INTARSISTE,INTARNESTS,INTARTREDS,AYRKESKADE,YSKADEGRD,SAM,GRUNN,PersonKode,Fødselsdato
0,420629,391417,380532,2021,2020,2019,2018,0,0,0,542860,1,1972-05-31

> cat test.csv | ./gradlew -q beregnCSV
FRA_ARENA_BELOP,FRA_ARENA_GUNIT,FRA_KELVIN_BELOP,FRA_KELVIN_GUNIT,DIFF_PROSENT,PERSON_KODE,DAGSATS
542860,4.1707,542860.11,4.1707138112,0.0000033115,1,1378.03
```

Prettified:

|   | INTSISTE | INTNESTS | INTTREDS | AAPBER | INTARSISTE | INTARNESTS | INTARTREDS | AYRKESKADE | YSKADEGRD | SAM | GRUNN  | PersonKode | Fødselsdato |
|---|----------|----------|----------|--------|------------|------------|------------|------------|-----------|-----|--------|------------|-------------|
| 0 | 420629   | 391417   | 380532   | 2021   | 2020       | 2019       | 2018       | 0          | 0         | 0   | 542860 | 1          | 1972-05-31  |

Og


| FRA_ARENA_BELOP | FRA_ARENA_GUNIT | FRA_KELVIN_BELOP | FRA_KELVIN_GUNIT | DIFF_PROSENT | PERSON_KODE | DAGSATS |
|-----------------|-----------------|------------------|------------------|--------------|-------------|---------|
| 542860          | 4.1707          | 542860.11        | 4.1707138112     | 0.0000033115 | 1           | 1378.03 |

