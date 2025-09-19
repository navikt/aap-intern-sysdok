# Unngå fatjar/uberjar/shadowjars

Se Slack-tråd: https://nav-it.slack.com/archives/C08LMG3S63H/p1758196348061099 for kontekst. AI-oppsummert:

>Summary of thread in #team-aap-utvikling
>
>@tor.idland reported that the dev deployment for the treatment workflow was struggling, and @fredrik.meyer and @nicolas.nordhagen investigated the issue, which appeared to be related to the project.version not being set correctly.
>
>@nicolas.nordhagen identified an issue with the duplicatesStrategy = DuplicatesStrategy.INCLUDE change, which was causing a NullPointerException [1]
>
>@fredrik.meyer explained that the DuplicatesStrategy change was needed to upgrade to Ktor 3.3.0, but it caused issues locally [2], [3]
>
>@hein.haraldsen suggested that the issue might be related to the access plugin version, not the Ktor version [4], [5]
>
>@nicolas.nordhagen suspected that the project.version was being overwritten by something else and suggested using a unique name like behandlingsflyt.api.version [6]
>
>@steffen.hageland suggested that the issue could have been caught earlier by building on a PR branch before merging to main, and that the CI pipeline could be improved to catch such runtime errors [7]
>
>@fredrik.meyer and @peter.brottveit.bock discussed moving away from using fat jars/shadow jars, and @peter.brottveit.bock suggested copying all jars into the Docker context instead [8], [9], [10], [11], [12]
>
>@fredrik.meyer created a PR to drop the use of fat jars, which seemed to resolve the issue [13], [14], [15], [16]
>
>@per.christian.henden suggested using Jib instead of fat jars, as it is faster and doesn't require merging all the jars [17], [18], [19], [20], [21], [22], [23], [24], [25], [26]
>
>@fredrik.meyer and @peter.brottveit.bock confirmed that the app started up correctly after the changes [27], [28]
>
>@fredrik.meyer offered to explain the setup at the next developer standup, and @steffen.hageland suggested an extra standup before the weekend to ensure the details are not forgotten [29], [30]


Ulempen med å lage én stor jar, er at det er udefinert operasjon: det innebærer essensielt å merge zip-filer (jar = zip), og hva skal man gjøre om de inneholder ressurser med samme navn?

Så en løsning er å bygge en jar for hvert bibliotek, og legge dem manuelt på classpath i Dockerfilen.

Dette kan gjøres ved å droppe å bygge alle moduler, og følgende Gradle-instruksjon:

```gradle
tasks.register<Copy>("copyRuntimeLibs") {
    from(configurations.runtimeClasspath)
    into("build/libs/runtime-libs")
}
```

Da ender vi opp med én jar for hver modul, pluss for hver avhengighet. Disse kan så kopieres inn i Docker-imaget. Når man starter Java-prosessen må man eksplisitt legge dem til på classpath og spesifisere main-klassen:

```Dockerfile
FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app
COPY /app/build/libs/app.jar /app/app.jar
COPY /app/build/libs/runtime-libs/ /app/lib/

ENTRYPOINT ["/usr/bin/java"]
CMD ["-cp","/app/app.jar:/app/lib/*","no.nav.aap.behandlingsflyt.AppKt"]
```

Her er hele diffen for å få dette til å virke:

```diff
diff --git a/.github/workflows/deploy.yaml b/.github/workflows/deploy.yaml
index c8af45f97..2198b1db2 100644
--- a/.github/workflows/deploy.yaml
+++ b/.github/workflows/deploy.yaml
@@ -29,8 +29,11 @@ jobs:
         uses: gradle/actions/setup-gradle@v4
         with:
             gradle-version: wrapper
-      - name: Bygg & test
-        run: gradle test buildFatJar --continue --stacktrace
+      - name: Bygg
+        run: gradle app:build :app:copyRuntimeLibs -x test --continue
+
+      - name: Test
+        run: gradle test --rerun-tasks
 
       - uses: dorny/test-reporter@v2.1.1
         if: success() || failure()
diff --git a/Dockerfile b/Dockerfile
index c695511ca..419327a09 100644
--- a/Dockerfile
+++ b/Dockerfile
@@ -1,12 +1,14 @@
 FROM gcr.io/distroless/java21-debian12:nonroot
 
 WORKDIR /app
-COPY /app/build/libs/app-all.jar /app/app.jar
+COPY /app/build/libs/app.jar /app/app.jar
+COPY /app/build/libs/runtime-libs/ /app/lib/
 
 ENV LANG='nb_NO.UTF-8' LC_ALL='nb_NO.UTF-8' TZ="Europe/Oslo"
 ENV JDK_JAVA_OPTIONS="-XX:MaxRAMPercentage=75 -XX:ActiveProcessorCount=2"
 
-CMD ["app.jar"]
+ENTRYPOINT ["/usr/bin/java"]
+CMD ["-cp","/app/app.jar:/app/lib/*","no.nav.aap.behandlingsflyt.AppKt"]
 
 # use -XX:+UseParallelGC when 2 CPUs and 4G RAM.
 # use G1GC when using more than 4G RAM and/or more than 2 CPUs
diff --git a/app/build.gradle.kts b/app/build.gradle.kts
index 16782227e..b4b13bcf0 100644
--- a/app/build.gradle.kts
+++ b/app/build.gradle.kts
@@ -48,6 +48,11 @@ tasks.register<JavaExec>("beregnCSV") {
     mainClass.set("no.nav.aap.behandlingsflyt.BeregnMedCSVKt")
 }
 
+tasks.register<Copy>("copyRuntimeLibs") {
+    from(configurations.runtimeClasspath)
+    into("build/libs/runtime-libs")
+}
+
 fun runCommand(command: String): String {
     val execResult = providers.exec {
         this.workingDir = project.projectDir
```
