// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
export default {
  title: "Litt om AAP",
  tagline: "",
  url: "https://aap-sysdoc.intern.nav.no",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/nav_logo.png",
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "nb",
    locales: ["nb"],
  },

  plugins: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      { language: "no", indexBlog: false },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/navikt/aap-intern-sysdok/edit/main/",
        },

        blog: false,

        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Dokumentasjon",
        logo: {
          alt: "AAP Logo",
          src: "img/aap_logo.png",
        },
        items: [
          {
            href: "https://github.com/navikt/aap-intern-sysdok",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Vi pleier å være her",
            items: [
              {
                label: "Slack",
                href: "https://nav-it.slack.com/archives/C031DUS37DK",
              },
              {
                label: "Zoom",
                href: "https://nav-it.zoom.us/j/92869347604?pwd=NjZCNXpQblB4b2pkNUtoRVArSTZCUT09",
              },
            ],
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      mermaid: {
        theme: { light: "light", dark: "dark" },
      },
    }),
};
