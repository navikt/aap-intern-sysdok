import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import type { FlowNode } from "@site/src/flytdiagrammer/flows/types.ts";
import { kindLabel } from "./FlowBox";
import styles from "./styles.module.css";

// MDX-sidene for flytene ligger i docs/funksjonalitet/12_Postmottak/flytdiagrammer/.
const FLYT_URL = "/funksjonalitet/Postmottak/flytdiagrammer";

/** Gjør `inline-kode` om til <code> i et avsnitt. */
function renderInline(text: string): ReactNode[] {
  return text
    .split(/(`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="button button--sm button--secondary"
      onClick={() => navigator.clipboard.writeText(window.location.href).then(() => setCopied(true))}
    >
      <span aria-live="polite">{copied ? "Kopiert" : "Kopier lenke"}</span>
    </button>
  );
}

export function NodeDetails({
  node,
  onClose,
}: {
  node: FlowNode | undefined;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (node && !dialog.open) dialog.showModal();
    if (!node && dialog.open) dialog.close();
  }, [node]);

  return (
    <dialog
      ref={ref}
      className={styles.panel}
      aria-labelledby="flytdiagram-detaljer-tittel"
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
    >
      {node && (
        <div className={styles.panelInner}>
          <header className={styles.panelHeader}>
            <div>
              <span className="badge badge--secondary">{kindLabel[node.kind]}</span>
              {node.temporary && (
                <span className={`badge ${styles.temporaryBadge}`}>Midlertidig regel</span>
              )}
              <h2 id="flytdiagram-detaljer-tittel" className={styles.panelTitle}>
                {node.label}
              </h2>
              {node.summary && <p className={styles.summary}>{renderInline(node.summary)}</p>}
            </div>
            <div className={styles.panelActions}>
              <CopyLinkButton />
              <button type="button" className="clean-btn close" aria-label="Lukk" onClick={onClose}>
                <span aria-hidden>×</span>
              </button>
            </div>
          </header>
          {node.details.map((block, index) => {
            switch (block.type) {
              case "text":
                return (
                  <div key={index}>
                    {block.content.split(/\n\s*\n/).map((paragraph, i) => (
                      <p key={i}>{renderInline(paragraph)}</p>
                    ))}
                  </div>
                );
              case "link":
                return (
                  <p key={index}>
                    <Link to={`${FLYT_URL}/${block.flowId}`}>{block.text}</Link>
                  </p>
                );
              case "code":
                return (
                  <CodeBlock key={index} language={block.language} title={block.title}>
                    {block.code}
                  </CodeBlock>
                );
            }
          })}
        </div>
      )}
    </dialog>
  );
}
