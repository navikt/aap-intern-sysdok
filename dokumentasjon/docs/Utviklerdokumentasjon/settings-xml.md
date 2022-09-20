# Settings.xml for backend
For å kunne bygge maven packages på NAVikt sitt packagerepo på github trenger du følgende konfigurasjon:

- I .m2 mappen din på din brukers rotmappe, legg inn følgende `<reposetories>`
- Vær sikker på at [din personlige githubtoken](https://github.com/settings/tokens) er `sso enabled` og `read:packages=true`.
  Dette trenger du for å kunne bruke [Dokuments sine Avro-skjemaene i din applikasjon](https://github.com/navikt/teamdokumenthandtering-avro-schemas#oppsett-for-%C3%A5-kunne-bruke-avro-skjemaene-i-din-applikasjon), samt [felles biblioteket AAP-domain](https://github.com/navikt/aap-domain)

<details>
  <summary> Se ~/.m2/settings.xml</summary>

```
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                      http://maven.apache.org/xsd/settings-1.0.0.xsd">

    <activeProfiles>
        <activeProfile>publish-to-github-from-local</activeProfile>
    </activeProfiles>

    <profiles>
        <profile>
            <id>publish-to-github-from-local</id>
            <repositories>
                <repository>
                    <id>dok-github</id>
                    <name>teamdokumenthandtering-avro-schemas</name>
                    <url>https://maven.pkg.github.com/navikt/teamdokumenthandtering-avro-schemas</url>
                    <snapshots>
                        <enabled>true</enabled>
                    </snapshots>
                </repository>
                <repository>
       				<id>aap</id>
       				<name>GitHub felles Apache Maven Packages</name>
       				<url>https://maven.pkg.github.com/navikt/aap-domain</url>
    			</repository>
            </repositories>
        </profile>
    </profiles>

    <servers>
    	<server>
            <id>dok-github</id>
            <username>${GITHUB_USERNAME}</username>
            <password>${GITHUB_TOKEN}</password>
        </server>
        <server>			
			<id>AAP</id>
			<username>${GITHUB_USERNAME}</username>
            <password>${GITHUB_TOKEN}</password>
		</server>
    </servers>

</settings>
```
</details>
