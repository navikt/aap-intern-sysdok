#!/usr/bin/env bash
# Eksporterer en org-fil til PDF med org-beamer-export-to-pdf.
#
# Bruk:
#   ./build.sh [presentasjon.org]            # kjører lokalt
#   ./build.sh --docker [presentasjon.org]   # kjører i Docker
#   DOCKER=1 ./build.sh                      # samme som --docker
#
# Docker-modus er nyttig i sandkasser der den lokale Emacs-binæren krasjer,
# eller på maskiner uten TeX/plantuml/rsvg-convert installert.
set -euo pipefail

DOCKER="${DOCKER:-0}"
IMAGE="${IMAGE:-presentasjon-kelvin:latest}"
FILE=""

for arg in "$@"; do
  case "$arg" in
    --docker) DOCKER=1 ;;
    --local)  DOCKER=0 ;;
    -*)       echo "Ukjent flagg: $arg" >&2; exit 1 ;;
    *)        FILE="$arg" ;;
  esac
done

FILE="${FILE:-presentasjon.org}"

if [ ! -f "$FILE" ]; then
  echo "Fant ikke fila: $FILE" >&2
  exit 1
fi

SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ABS_DIR="$(cd "$(dirname "$FILE")" && pwd)"
BASE_FILE="$(basename "$FILE")"
ABS_FILE="$ABS_DIR/$BASE_FILE"

if [ "$DOCKER" = "1" ]; then
  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "Bygger Docker-image $IMAGE ..."
    docker build -t "$IMAGE" "$SCRIPT_DIR"
  fi

  # Org-fila mountes på /work. Ligger skriptene et annet sted, mountes de
  # separat på /scripts.
  if [ "$SCRIPT_DIR" = "$ABS_DIR" ]; then
    set -- --volume "$ABS_DIR:/work"
    INNER_SCRIPT="/work/$SCRIPT_NAME"
  else
    set -- --volume "$ABS_DIR:/work" --volume "$SCRIPT_DIR:/scripts:ro"
    INNER_SCRIPT="/scripts/$SCRIPT_NAME"
  fi

  # Kjører som innlogget bruker slik at genererte filer ikke eies av root.
  exec docker run --rm \
    --user "$(id -u):$(id -g)" \
    "$@" \
    --workdir /work \
    "$IMAGE" \
    bash "$INNER_SCRIPT" --local "$BASE_FILE"
fi

# emacs-nw er en wrapper rundt "emacs -q -nw" og brukes lokalt på macOS.
# I containeren finnes bare "emacs" (emacs-nox).
if [ -z "${EMACS:-}" ]; then
  if command -v emacs-nw >/dev/null 2>&1; then
    EMACS=emacs-nw
  else
    EMACS=emacs
  fi
fi

# SVG-er (f.eks. fra plantuml) konverteres til PDF etter eksport, men før
# LaTeX kjøres, slik at nygenererte diagrammer kommer med.
"$EMACS" --batch \
  --eval "(require 'org)" \
  --eval "(require 'ox-beamer)" \
  --eval "(require 'ob-plantuml)" \
  --eval "(org-babel-do-load-languages 'org-babel-load-languages '((plantuml . t)))" \
  --eval "(setq org-confirm-babel-evaluate nil
                org-export-use-babel t
                org-plantuml-exec-mode 'plantuml
                org-latex-pdf-process
                  (list \"$SCRIPT_DIR/svg2pdf.sh %o\"
                        \"latexmk -pdf -interaction=nonstopmode -output-directory=%o %f\"))" \
  --visit "$ABS_FILE" \
  --eval "(org-beamer-export-to-pdf)"

echo "Ferdig: ${ABS_FILE%.org}.pdf"
