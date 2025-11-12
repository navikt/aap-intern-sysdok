# Utviklerstandup

## Tema

En liste med ulike temaer og retningslinjer som diskuteres og vedtas under utviklerstandup.

Se [beslutningsloggen](#beslutningslogg) nederst for en oversikt over tidligere beslutninger.

### Git

- Bruk **Squash and merge** når du merger PR-er for å holde historikken ryddig.
- Ikke force-push på en åpen PR, dvs "Ready for review". Hvis den er "draft" er det greit.

### Ktor

- Logikk skal _ikke_ ligge i route-filer. Flytt logikk til service-klasser.
- `call.respond` må brukes med forsiktighet. Unngå å kalle `call.respond` flere ganger i samme request, og hvis det er
  komplekse responser, vurder å bygge opp responsobjektet først og så kalle `call.respond` en gang.

### Caching

- Bruk Redis hvis det er viktig at noe er cachet mellom flere pods/instanser.
- Bruk Caffeine for lokal caching i en enkelt pod/instans.
- Caffeine er vesentling raskere og yter bedre enn Redis siden det er in-memory i samme JVM, så bruk Caffeine der det er
  mulig.

## Beslutningslogg

| Dato       | Tema                      | Beslutning                                                                                                                                                                          |
|------------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2025-11-12 | Force push på PR          | Hvis en PR er satt til "ready for review" skal du _ikke_ bruke force push, da dette gjør det vanskelig å se hva som er endret etter en eventuell kommentar på noe som må forbedres. |
|            | Caffeine vs Redis         | Kun bruk Redis hvis noe må caches på tvers av podder/instanser. Caffeine til alt annet.                                                                                             |
|            | Ktor respond              | Vær varsom med tidlig respond siden det ikke er en avsluttende handling. Husk return eller bruk return if.                                                                          |
| 2025-11-10 | Logikk i routes           | Logikk skal flyttes ut av route-filer og inn i egne service-klasser for bedre organisering og testbarhet.                                                                           |
| 2025-10-16 | Klient/Client vs. Gateway | Klasser som kaller på eksterne tjenester skal ha suffiks `Gateway` for å tydeliggjøre deres rolle i koden.                                                                          |
