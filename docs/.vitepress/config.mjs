import { withMermaid } from 'vitepress-plugin-mermaid';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

import { cpSync } from 'fs';
import { resolve } from 'path';
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
          { text: 'Codebase', link: '/codebase/' },
        ]
      }
    ],

    logo: '/identity.svg',

    appearance: false,

    outline: {
      level: [2, 3], // Show h2 and h3 headings
      label: 'On this page'
    },

    search: {
      provider: 'local',
    },

    // editLink: {
    //   pattern: 'https://github.com/0dataapp/bind/blob/master/docs/:path'
    // },
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

    plugins: [{
      name: 'copy-cloudron-versions',
      writeBundle () {
        const basename = 'CloudronVersions.json';
        cpSync(resolve(process.cwd(), '../', basename), resolve(__dirname, './dist/', basename), { force: true });
      }
    }],
  },

  cleanUrls: true,

});
