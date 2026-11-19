# Frontend

## Oppsett

### Versjonshåndtering med Mise

Det anbefales å bruke [Mise](https://mise.jdx.dev/) for å håndtere ulike versjoner av `Node.js`, `pnpm`, `java`, osv.

Se [hvordan du installerer mise](https://mise.jdx.dev/getting-started.html).

### Sett opp GitHub token

For at det skal være mulig å hente ned pakker fra Navikt sitt GitHub Package Registry, må du ha et GitHub token med
leserettigheter.

1. Gå inn på GitHub under brukeren din på Settings -> Developer settings
2. Velg Personal access tokens -> Tokens (classic) -> Generate new token (classic)
3. Gi token et navn, sett utløpsdato og huk av for `read:packages`-rettighet
4. Klikk Generate token og kopier tokenet (Det forsvinner fra siden)
5. Klikk Configure SSO -> Authorize for navikt-organisasjonen
6. Opprett miljøvariabel med token i `~/.bashrc` eller `~/.zshrc`:
   - **Med Keychain på Mac (anbefalt)**:
       - Kjør kommando (med faktisk passord, ikke dummyverdi)
         ```shell
         security add-generic-password -a "$USER" -s "NODE_AUTH_TOKEN" -w "<PASSWORD>"
         ```
       - Legg inn følgende i `~/.bashrc` eller `~/.zshrc`:
         ```env
         export NODE_AUTH_TOKEN=$(security find-generic-password -w -a "$USER" -s "NODE_AUTH_TOKEN")
         ```
   - **Uten Keychain**:\
     Legg inn følgende i `~/.bashrc` eller `~/.zshrc`:
     ```env
     export NODE_AUTH_TOKEN=<token-her>
     ```

7. Deretter kan du kjøre `source ~/.bashrc` eller `source ~/.zshrc` for å laste inn endringene (ev. restart
   terminalen/shellet).
8. Denne linjen må også legges til i `~/.npmrc` for å sikre at npm bruker tokenet for autentisering mot GitHub Packages.
    ```ini
    //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
    ```
