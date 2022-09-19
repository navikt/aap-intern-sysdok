// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

async function createConfig() {
  const mdxMermaid = await import("mdx-mermaid");

  return {
    title: "AAP Team Innbygger dokumentasjon",
    tagline: "",
    url: "https://aap-team-innbygger.intern.nav.no",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/nav_logo.png",

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: "nb",
      locales: ["nb"],
    },

    presets: [
      [
        "classic",
        {
          docs: {
            sidebarPath: require.resolve("./sidebars.js"),
            remarkPlugins: [mdxMermaid.default],
            // Please change this to your repo.
            // Remove this to remove the "edit this page" links.
            editUrl:
              "https://github.com/navikt/utvikler_aap_innbygger/edit/main/dokumentasjon",
          },

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
          title: "Team Innbygger",
          logo: {
            alt: "AAP Logo",
            src: "img/aap_logo.png",
          },
          items: [
            {
              type: "doc",
              docId: "hvordan_vi_jobber",
              position: "left",
              label: "Dokumentasjon",
            },
            {
              href: "https://github.com/navikt/utvikler_aap_innbygger",
              label: "GitHub",
              position: "right",
            },
          ],
        },
        footer: {
          style: "dark",
          links: [
            {
              title: "Docs",
              items: [
                {
                  label: "Tutorial",
                  to: "/docs/intro",
                },
              ],
            },
            {
              title: "Sosialt",
              items: [
                {
                  label: "#po-aap-innbygger (Slack)",
                  href: "https://nav-it.slack.com/archives/C031DUS37DK",
                },
                {
                  label: "#po_aap_intern_innbygger (Slack)",
                  href: "https://nav-it.slack.com/archives/C032Z3UU4TU",
                },
              ],
            },
            {
              title: "More",
              items: [
                {
                  label: "GitHub",
                  href: "https://github.com/facebook/docusaurus",
                },
              ],
            },
          ],
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      }),
  };
}

module.exports = createConfig;
