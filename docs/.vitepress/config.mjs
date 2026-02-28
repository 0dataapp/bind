import { withMermaid } from "vitepress-plugin-mermaid";
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

export default withMermaid({
  title: 'Bind',
  description: 'Git personal data stores for web apps',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/quickstart' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'How it works', link: '/understand' },
          { text: 'Self-host', link: '/host' },
          { text: 'Contribute', link: '/contribute' },
        ]
      }
    ],

    logo: '/identity.svg',

    appearance: false,
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

});
