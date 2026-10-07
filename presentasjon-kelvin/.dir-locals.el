;;; Directory Local Variables. -*- mode: emacs-lisp -*-
;; Gjør at eksport fra Emacs (C-c C-e l P) oppfører seg likt som build.sh:
;; SVG-er konverteres til PDF før LaTeX kjøres.
((org-mode
  . ((org-latex-pdf-process
      . ("%o/svg2pdf.sh %o"
         "latexmk -pdf -interaction=nonstopmode -output-directory=%o %f")))))
