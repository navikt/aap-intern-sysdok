import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Komme i gang",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    url: "/docs/Utviklerdokumentasjon/komme-i-gang",
    description: (
      <>
        Dette er alt du trenger for å komme i gang som utvikler / designer i
        Team Søknad og meldekort.
      </>
    ),
  },
  {
    title: "Funksjonalitet",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    url: "/docs/funksjonalitet/systemdok",
    description: (
      <>
        Her finner du systemdokumentasjon for tjenestene Team Søknad og Meldeplikt
        forvalter.
      </>
    ),
  },
  {
    title: "Noe annet",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: <>Her legger vi inn noe annet når vi har tid.</>,
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
