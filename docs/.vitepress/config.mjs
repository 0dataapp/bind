import { withMermaid } from "vitepress-plugin-mermaid";
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

export default withMermaid({
  title: 'Bind',
  description: 'Git-backed web apps.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/quickstart' },
      { text: 'Source', link: 'https://github.com/0dataapp/bind' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Quickstart', link: '/quickstart/' },
          { text: 'How it works', link: '/understand/' },
          { text: 'Make apps', link: '/integrate/' },
          { text: 'Host', link: '/host/' },
          { text: 'Contribute', link: '/contribute/' },
        ]
      }
    ],

    logo: '/identity.svg',

    appearance: false,

    outline: {
      level: [2, 3], // Show h2 and h3 headings
      label: 'On this page'
    },
  },

  head: [['link', { rel: 'icon', href: 'data:;base64,=' }]],

  mermaid:{
    theme: 'base',
    themeVariables: {
      fontSize: '12px',
      fontFamily: 'Arial',
    },
  },

  vite: {
    server: {
      host: env.HOST,
      port: env.PORT,
      allowedHosts: [ env.HOST ],
    },
  },

  cleanUrls: true,

});
