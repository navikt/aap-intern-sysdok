# Kjøremiljø for å eksportere org -> beamer-PDF uten å være avhengig av
# lokal Emacs/TeX-installasjon. Nyttig i sandkasser der macOS-Emacs krasjer.
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Uten UTF-8-locale tolker JVM-en (plantuml) kildekoden som ASCII,
# og norske tegn som "ø" gir syntaksfeil i diagrammene.
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update && apt-get install --no-install-recommends -y \
      emacs-nox \
      latexmk \
      texlive-latex-base \
      texlive-latex-recommended \
      texlive-latex-extra \
      texlive-plain-generic \
      texlive-fonts-recommended \
      texlive-fonts-extra \
      lmodern \
      cm-super \
      default-jre-headless \
      graphviz \
      librsvg2-bin \
      fonts-dejavu-core \
      git \
      curl \
      ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Vi pinner samme plantuml-versjon som brukes lokalt, slik at diagrammer blir
# like uansett om bygget skjer i Docker eller på host (Debian-pakken er 1.2020
# og tegner med et annet tema).
# -Duser.home er nødvendig fordi containeren kjøres med en uid som ikke finnes
# i /etc/passwd; uten den setter JVM-en user.home til "?" og lager en
# søppelkatalog ved navn "?" i arbeidsmappa.
ARG PLANTUML_VERSION=1.2026.8
RUN curl -fsSL -o /usr/local/share/plantuml.jar \
      "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-${PLANTUML_VERSION}.jar" \
 && printf '#!/bin/sh\nexec java -Djava.awt.headless=true -Duser.home=/tmp -jar /usr/local/share/plantuml.jar "$@"\n' \
      > /usr/local/bin/plantuml \
 && chmod +x /usr/local/bin/plantuml

# Emacs og latexmk trenger et skrivbart HOME, også når containeren
# kjøres med en vilkårlig uid via --user.
ENV HOME=/tmp
WORKDIR /work
