# Data i BigQuery

Oppskrift på replikering hvordan her: [her](../../innsikt/replikering_bigquery).

## Lage views i BigQuery

Det er en pågående jobb med å gå bort fra å skrive direkte til BigQuery, og heller dele [views](https://cloud.google.com/bigquery/docs/views) utledet fra tabeller som er replikert. Dette er mer stabilt med hensyn på feilhåndtering.

Views er definert via Kubernetes-manifester (som bruker Googles Config Connector), se [her](https://cloud.google.com/config-connector/docs/reference/resource-docs/bigquery/bigquerydataset).

Se [her](https://github.com/navikt/aap-statistikk/blob/main/.nais/bigquery/view_vilkarsresultat.yml) for definisjon av hvordan viewet `view-vilkarsresultat` er definert. Denne filen må refereres til i en Github Action ([se her](https://github.com/navikt/aap-statistikk/blob/main/.github/workflows/deploy_bigquery.yml)). Denne er igjen referert til i `release.yaml`-filen, slik:

```yaml
  deploy-bigquery-resources-dev:
    uses: ./.github/workflows/deploy_bigquery.yml
    secrets: inherit
    permissions:
      id-token: write
    with:
      cluster: dev-gcp
      project: aap-dev-e48b
```

### Tilgang til data-team for nye views

Gjenta for dev og prod.

#### 1. Opprett dataprodukter / legg til datasett

Naviger til enten https://data.ansatt.nav.no/ (prod) eller https://data.ansatt.dev.nav.no/, og legg til nytt datasett for team AAP i det korrekte dataproduktet (det eksisterer allerede dataprodukter for Team Sak og Team Spenn). 

I tillegg må tilganger gis til dataproduktet. Enten gi til en servicebruker, eller til en person.


#### 2. Authorize views

Siden viewet joiner mange tabeller i et annet dataset, må det gis spesielle tilganger. Dette gjøres ved å gå inn i Google Cloud Console, finne datasettet `datastream_hendelser` (som replikerer statistikk-databasen). Trykk på "Sharing" og deretter "Authorize views". Søk opp det nye viewet, og legg til.

:::info

Igjen, det hadde vært kjekt å automatisere dette med f.eks Terraform. TODO!

:::


### IAM-rolle for oppdatering av views

For at deploy skal fungere må Kubernetes-rollen til Nais (søk etter "CNRM service account" i Google Cloud Console) oppdateres til å ha rollen `BigQuery Data Editor`. Se bildet (screenshot fra dev):

![CNRM-rolle](../../bilder/iam_cnrm.png)

:::info 

Hadde vi hatt tid, hadde alt dette vært automatisert med Terraform f.eks...

:::

### Debugging

Man kan gjøre 

```
kubectl get bigquerytables/view-tilkjent-ytelse
```

for å se status på ressursen. Om noe feiler ved deploy, kan man se detaljer slik (eksempel-output):

```
kubectl describe bigquerytables/view-tilkjent-ytelse
```

Eksempel-output:

```
> kubectl describe bigquerytables/view-tilkjent-ytelse


Name:         view-tilkjent-ytelse
Namespace:    aap
Labels:       team=aap
Annotations:  cnrm.cloud.google.com/management-conflict-prevention-policy: none
              cnrm.cloud.google.com/project-id: aap-prod-9adc
              cnrm.cloud.google.com/state-into-spec: absent
              deploy.nais.io/client-version: 2025-08-07-961addd
              deploy.nais.io/github-actor: FredrikMeyer
              deploy.nais.io/github-sha: 9800e424f0b540174846ae71263a026eba854ae6
              deploy.nais.io/github-workflow-run-url: https://github.com/navikt/aap-statistikk/actions/runs/17296276452
              kubernetes.io/change-cause:
                nais deploy: commit 9800e424f0b540174846ae71263a026eba854ae6: https://github.com/navikt/aap-statistikk/actions/runs/17296276452
              nais.io/deploymentCorrelationID: 733b4465-f017-4882-804e-3af9e3f14958
API Version:  bigquery.cnrm.cloud.google.com/v1beta1
Kind:         BigQueryTable
Metadata:
  Creation Timestamp:  2025-08-20T11:06:08Z
  Finalizers:
    cnrm.cloud.google.com/finalizer
    cnrm.cloud.google.com/deletion-defender
  Generation:        2
  Resource Version:  1756385877674495020
  UID:               6dfe9d4a-efd7-4eaa-a4b6-5c56b4fa5397
Spec:
  Dataset Ref:
    External:   ytelsestatistikk
  Description:  View som viser tilkjent ytelse.
  Resource ID:  view_tilkjent_ytelse
  View:
    Query:  SELECT
  s.saksnummer,
  br.referanse,
  tp.fra_dato as fraDato,
  tp.til_dato,
  tp.dagsats,
  tp.gradering,
  tp.antall_barn as antallBarn,
  tp.barnetillegg,
  tp.barnetillegg_sats as barnetilleggSats,
  tp.redusert_dagsats as redusertDagsats,
  DATETIME(ty.opprettet_tidspunkt) AS regDato,
  DATETIME(TIMESTAMP_MILLIS(GREATEST(b.datastream_metadata.source_timestamp, tp.datastream_metadata.source_timestamp, ty.datastream_metadata.source_timestamp, br.datastream_metadata.source_timestamp, s.datastream_metadata.source_timestamp)), 'Europe/Oslo') AS endretTid,
  concat(b.id, '-', tp.id, '-', ty.id, '-', br.id, '-', s.id) as unik_id
FROM
  `aap-dev-e48b.datastream_hendelser.public_tilkjent_ytelse_periode` tp
JOIN
  `aap-dev-e48b.datastream_hendelser.public_tilkjent_ytelse` ty
ON
  tp.tilkjent_ytelse_id = ty.id
JOIN
  `aap-dev-e48b.datastream_hendelser.public_behandling` b
ON
  ty.behandling_id = b.id
JOIN
  `aap-dev-e48b.datastream_hendelser.public_behandling_referanse` br
ON
  b.referanse_id = br.id
JOIN
  `aap-dev-e48b.datastream_hendelser.public_sak` s
ON
  b.sak_id = s.id
    Use Legacy Sql:  false
Status:
  Conditions:
    Last Transition Time:  2025-08-20T11:06:08Z
    Message:               Update call failed: error applying desired state: summary: googleapi: Error 403: Access Denied: Table aap-dev-e48b:datastream_hendelser.public_behandling: User does not have permission to query table aap-dev-e48b:datastream_hendelser.public_behandling, or perhaps it does not exist., accessDenied
    Reason:                UpdateFailed
    Status:                False
    Type:                  Ready
  Observed Generation:     2
Events:
  Type    Reason    Age                    From                      Message
  ----    ------    ----                   ----                      -------
  Normal  Updating  3m53s (x720 over 23h)  bigquerytable-controller  Update in progress

```
