import React from "react";
import Link from "@docusaurus/Link";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import styles from "./styles.module.css";

/** @param {{item: import('@docusaurus/plugin-content-docs').PropSidebarItem, depth: number}} props */
function TreeItem({ item, depth }) {
  switch (item.type) {
    case "link":
      return <Link to={item.href}>{item.label}</Link>;
    case "category":
      return (
        <details open={depth === 0}>
          <summary>{item.label}</summary>
          {item.href && (
            <Link className={styles.overview} to={item.href}>
              Oversikt: {item.label}
            </Link>
          )}
          <TreeItems items={item.items} depth={depth + 1} />
        </details>
      );
    default:
      throw new Error(
        `Nettstedskart støtter ikke sidefeltelementer av typen "${item.type}".`,
      );
  }
}

/** @param {{items: import('@docusaurus/plugin-content-docs').PropSidebar, depth?: number}} props */
function TreeItems({ items, depth = 0 }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <TreeItem item={item} depth={depth} />
        </li>
      ))}
    </ul>
  );
}

export default function SiteTree() {
  const sidebar = useDocsSidebar();
  if (!sidebar) {
    throw new Error("Nettstedskart krever en dokumentasjonsside med sidefelt.");
  }

  return (
    <nav className={styles.tree} aria-label="Nettstedskart">
      <TreeItems items={sidebar.items} />
    </nav>
  );
}
