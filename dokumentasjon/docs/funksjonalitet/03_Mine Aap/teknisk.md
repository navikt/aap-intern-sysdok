# Teknisk beskrivelse

## Deploy snapshot av søknad til labs
Deploy et snapshot av søknaden til labs for å enkelt vise nøyaktig hvordan søknaden så ut på et gitt tidspunkt. Finn commiten du vil deploye til labs(antageligvis siste commit før datoen du vil ha snapshot fra). Kopier SHA fra aktuell commit(commit-sha).

Lag en ny branch og sjekk ut til riktig commit. Det er viktig at branchen starter med "labs-historisk-" for at riktig github aktion skal trigges. Branchnavnet blir også en del av urlen, så ingen / i branchnavnet.

Lag branch og sjekk ut til riktig commit:

```
git checkout -b "labs-historisk-1-oktober-22" <commit-sha>
```

Hvis snapshotet er fra før byggefilene ble laget må disse hentes til din nye branch. Kopier sha fra nyeste commit i repoet(nyeste-sha) og kjør
```
git checkout <nyeste-sha> -- .github/workflows/ .nais/historisk-labs.yaml DockerfileLabs 
```

Push branch
```
git push
```
Snapshotet bygges nå og deployes til labs. Url vil bli

https://aap-soknad-labs-historisk-1-oktober-22.labs.nais.io/aap/soknad

### Opprydning

Slett branchen i github, workflowen labs-delete-historisk vil så skalere podene til 0.

Appene vil ikke slettes så følgende burde gjøres regelmessig:

Pass på at du er i labs-gcp
```
kubectl config use-context labs-gcp
```

Kjør dry run og se hvilke apper som vil bli slettet:
```
kubectl delete app --dry-run=client -n aap --selector branchState=deleted
```

Hvis alt ser riktig ut, kjør kommando uten dry-run:
```
kubectl delete app -n aap --selector branchState=deleted
```
