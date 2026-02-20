# bind

Git-backed remoteStorage server.

## Architecture

| layer | description |
| - | - |
| [SvelteKit](https://svelte.dev/docs/kit) | framework, UI components, routing and redirects, navigation without HTTP requests, fast builds and reloads with `vite` |
| + [adapter-node](https://svelte.dev/docs/kit/adapter-node) | build as Node.js server |
| [Pico](https://picocss.com) | styles mostly without CSS classes |
| [Vitest](https://vitest.dev) | logic or unit tests in `*-tests.js` |
| [Playwright](https://playwright.dev) | interface tests in `ui-tests.js` |

## Development

Install [Node.js and npm](https://nodejs.org/en/download/), then install the dependencies:

```sh
npm i
```

### Run

Start a development server:

```sh
npm start
```

Type `o` + `Enter` or visit http://localhost:5173 in your browser.

### Test

Run logic tests:

```sh
npm run test:unit
```

Run interface tests:

```sh
npm run test:e2e
```

Run all tests:

```sh
npm test
```

### Deploy

Build a production Node.js app in `/build` that can run on a server:

```sh
npm run build
```

This project packages it for [one-click](https://easyindie.app) deploys on self-hosted panels. These panels maintain their own 'app catalogs' for one-click installs; until this is included there, it will require more than one click to setup. Instructions are similar to [oneclick-proof](https://github.com/0dataapp/oneclick-proof).
