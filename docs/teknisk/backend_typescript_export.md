# Automatisk genererte typescript typer fra kotlin apper

- Backendapp må bruke gradle-build workflowen https://github.com/navikt/aap-workflows/blob/main/.github/workflows/gradle-build.yml
- Aktiver typescript export med flagget publish-typescript i gradle-build.
- Flagget typescript-enums styrer om typescript genereringen som gjøres i node (openapi-typescript) kjører med flagget --enum eller ikke. Default false
- openapi-test-navn er navnet på testen som eksporterer openapi.json til rotnivå i backendappen. Eksempel på implementasjon https://github.com/navikt/aap-postmottak-backend/blob/main/app/src/test/kotlin/no/nav/aap/postmottak/ApiTest.kt
- neste steg i gradle-build vil så laste opp openapi.json som en artifact til github
- Så startes en annen workflow i repoet aap-backend-typescript-types. Workflowen er `publish-and-release.yml`.
- Her sendes artifact-id og app-name og with-enums med inn i den nye flowen som inputs. For å få lov til å gjøre dette brukes et token som hentes fra en github app (https://github.com/organizations/navikt/settings/apps/team-aap-workflows). Github appen må "installeres" i alle repoer hvor den brukes. Dette gjøres via linken for de som har tilgang. Følgende to secrets må også legges til i repoet som skal eksportere typer(kopier disse fra secrets i nais console)
    - TEAM_AAP_GITHUB_APP_ID
    - TEAM_AAP_GITHUB_APP_PRIVATE_KEY
- Workflowen i navikt/aap-backend-typescript-types henter ned artifact og navigerer til `./packages/aap-{app-name}-typescript-types` hvor den legger `openapi.json` som hentes fra artifacts og generer typescript typer med openapi-typescript biblioteket
- Hvis man setter opp en eksport av en ny app må man opprette denne mappen med en package.json, index.ts og schema.d.ts
- name i package.json må tilsvare mappenavn. Se de andre mappene for eksempler 
- Hvis with-enums flagget er på må det legges til bygg i pakken. Se eksempel i packages/aap-oppgave-typescript-types
