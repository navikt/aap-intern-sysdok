# Dokumentasjon for AAP søknad og meldeplikt
Dette er intern dokumentasjon for Team søknad og meldekort i PO for Arbeidsavklaringspenger

## Komme i gang

Bygger på [Docusaurus 3](https://docusaurus.io/).

### Installering

```
yarn
```

### Lokal utvikling

```
yarn start
```

Åpnes her [http://localhost:3000/](http://localhost:3000/)

### Build

```
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## PlantUML Diagrammer

Prosjektet støtter automatisk generering av PNG-bilder fra PlantUML-filer. 

### Hvordan det fungerer

1. Legg PlantUML-filer (.puml) i `diagrams`-mappen
2. Ved push til main-branch eller ved pull request som endrer .puml-filer, vil GitHub Actions automatisk:
   - Generere PNG-bilder fra alle PlantUML-filer
   - Publisere bildene som artifacts i GitHub Actions

### Tilgang til genererte diagrammer

1. Gå til "Actions" i GitHub-repositoriet
2. Velg "Generate PlantUML Diagrams" workflow
3. Velg den siste kjøringen
4. Under "Artifacts", last ned "plantuml-diagrams" som inneholder alle genererte PNG-filer

Du kan også utløse workflow manuelt ved å gå til "Actions" -> "Generate PlantUML Diagrams" -> "Run workflow".

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #po-aap-værsågod.
