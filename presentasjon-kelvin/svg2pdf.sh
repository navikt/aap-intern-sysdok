#!/usr/bin/env bash
# Konverterer alle SVG-filer i en katalog til PDF med rsvg-convert.
# pdflatex kan ikke lese SVG direkte, og svg.sty krever Inkscape.
# Filene konverteres parallelt; skriptet feiler hvis én konvertering feiler.
set -euo pipefail

DIR="${1:-.}"

convert() {
  local svg="$1" pdf="$2"
  if rsvg-convert --format=pdf --output="$pdf" "$svg"; then
    echo "Konverterte $(basename "$svg") -> $(basename "$pdf")"
  else
    rm -f "$pdf"
    echo "Feilet: $(basename "$svg")" >&2
    return 1
  fi
}

shopt -s nullglob
pids=()
for svg in "$DIR"/*.svg; do
  pdf="${svg%.svg}.pdf"
  if [ ! -f "$pdf" ] || [ "$svg" -nt "$pdf" ]; then
    convert "$svg" "$pdf" &
    pids+=("$!")
  fi
done

status=0
for pid in ${pids[@]+"${pids[@]}"}; do
  wait "$pid" || status=1
done
exit "$status"
