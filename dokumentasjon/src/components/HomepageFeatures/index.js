import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Funksjonelt",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    url: "/docs/funksjonalitet",
    description: (
      <>
                Beskrivelse av funksjoner og komponenter i sammenheng
      </>
    ),
  },
  {
    title: "Teknisk",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
      url: "/docs/teknisk",
    description: (
      <>
                Generell teknisk beskrivelse
      </>
    ),
  },
  {
    title: "Litt om oss",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
      url: "/docs/team",
    description: (
      <>
                Presentasjon av team AAP
      </>
    ),
  },
];

function Feature({ Svg, title, description, url }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <a href={url}>
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </a>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
