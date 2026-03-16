# Codebase

## Architecture

Simply-put, Bind is a SvelteKit server app that runs via Node.js. The various layers are described in more detail below.

| layer | description |
| - | - |
| [SvelteKit](https://svelte.dev/docs/kit) | framework, UI components, routing, fast builds and reloads with `vite` |
| + [adapter-node](https://svelte.dev/docs/kit/adapter-node) | build as Node.js app for production |
| + [bind-glue](https://github.com/0dataapp/bind-glue) | Express/SvelteKit middleware for WebFinger and remoteStorage.js |
| [Better Auth](https://www.better-auth.com) | accounts, social sign in, encryption |
| [Pico](https://picocss.com) | styles mostly without CSS classes |
| [Vitest](https://vitest.dev) | logic or unit tests in `*-tests.js` |
| [Playwright](https://playwright.dev) | interface tests in `ui-tests.js` |

Other dependencies:
- [lowdb](https://github.com/typicode/lowdb/), [js-jsonq](https://github.com/me-shaon/js-jsonq): turning local JSON into a database
- [Simple Git](https://github.com/steveukx/git-js): git commands via Node.js
- [grid.js](https://gridjs.io/docs/integrations/svelte): admin users table
- [svelecte](https://github.com/mskocik/svelecte): repo selector
- [file-type](https://github.com/sindresorhus/file-type), [mime](https://github.com/broofa/mime): guessing types

### Better Auth

Accounts are woven into much of Bind's features, so it made sense to start on a more robust foundation rather than writing a basic system from scratch.

An authentication framework like Better Auth makes it possible to eventually include [magic links](https://better-auth.com/docs/plugins/magic-link), [passkeys](https://better-auth.com/docs/plugins/passkey), [two-factor](https://better-auth.com/docs/plugins/2fa), [email one-time passwords](https://better-auth.com/docs/plugins/email-otp), [rate-limiting](https://www.better-auth.com/docs/concepts/rate-limit), and other social providers, without all that taking over the codebase.

Bind uses the following integrations (configured in [`src/lib/auth/config.js`](https://github.com/0dataapp/bind/blob/master/src/lib/auth/config.js):
- [Email & Password Authentication](https://better-auth.com/docs/authentication/email-password)
- [Username plugin](https://www.better-auth.com/docs/plugins/username)
- [Admin plugin](https://better-auth.com/docs/plugins/admin) to create accounts
- a [custom database adapter](https://better-auth.com/docs/guides/create-a-db-adapter) that bridges to plain JSON objects (see [`src/lib/auth/generic.js`](https://github.com/0dataapp/bind/blob/master/src/lib/auth/generic.js))
- [Hooks](https://better-auth.com/docs/concepts/hooks) for logic on account creation and deletion
- [Cookies](https://better-auth.com/docs/concepts/cookies) to store and retrieve the current session

#### Database adapters

Bind is currently built to use the local filesystem because it doesn't require configuring other services (and therefore simpler to self-host). But for many use cases it might make sense to use a real database.

Better Auth is flexibile enough to support [MySQL](https://better-auth.com/docs/adapters/mysql), [SQLite](https://better-auth.com/docs/adapters/sqlite), [PostgreSQL](https://www.better-auth.com/docs/adapters/postgresql), [MongoDB](https://better-auth.com/docs/adapters/mongo), [Supabase](https://better-auth.com/docs/adapters/other-relational-databases#kysely-organization-dialects), and others. 

At some point, there should be enough affordances in the codebase to make it straightforward for a host to pick what works best for their situation and simply configure it from an admin panel. Until then, here are some helpful links for anyone who wants to build something themselvels:

- [Create a Database Adapter](https://better-auth.com/docs/guides/create-a-db-adapter#options-optional)
- [Remult community adapter](https://github.com/nerdfolio/remult-better-auth)
- [PocketBase community adapter](https://github.com/LightInn/pocketbase-better-auth)

## Develop

To run the Bind codebase for development, install [Node.js and npm](https://nodejs.org/en/download/), then install the dependencies:

```sh
npm i
```

### Run

Now you should be able to start a development server:

```sh
npm start
```

Type `o` + `Enter` or visit <a href="http://localhost:5173" target="_blank">`http://localhost:5173`</a> in your browser.

::: tip

Set `HOST` and `PORT` in your environment variables to customize the address.

:::

### Test

Run logic tests that watch files for changes:

```sh
npm run test:unit
```

Run interface tests once

```sh
npm run test:ui
```

or with Playwright's interactive [UI Mode](https://playwright.dev/docs/test-ui-mode):

```sh
npm run test:ui:watch
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

This can be started with `node build/index.js` or just `node build`.

## Types

<table>
<thead>
<tr>
  <th>table</th>
  <th>notes</th>
  <th>Bind</th>
  <th>Better Auth</th>
  <th>remoteStorage</th>
</tr>
</thead>
<tbody>
<tr>
<td>
  <code>user</code>
</td>
<td>
  <ul>
    <li>primary reference for an account</li>
    <li>
      <code>role</code> defaults to <code>user</code> but can be <code>admin</code>
    </li>
  </ul>
</td>
<td>✔︎</td>
<td>✔︎</td>
<td>✔︎</td>
</tr>
<tr>
<td>
  <code>account</code>
</td>
<td>
  <ul>
    <li>owned by <code>user</code></li>
    <li>email, social, passkey are seperate 'accounts'</li>
    <li><code>accountId</code> stores external id</li>
    <li><code>password</code> or <code>accessToken</code> stores a hashed credential</li>
  </ul>
</td>
<td>✔︎</td>
<td>✔︎</td>
<td></td>
</tr>
<tr>
<td>
  <code>account_subsource</code>
</td>
<td>
  <ul>
    <li>owned by <code>account</code></li>
    <li><code>foreignId</code> stores external id of repo inside Git Forge account</li>
    <li><code>data</code> stores a normalized payload of the repo object as well as the original</li>
  </ul>
</td>
<td>✔︎</td>
<td>✔︎</td>
<td></td>
</tr>
<tr>
<td>
  <code>oauth_connections</code>
</td>
<td>
  <ul>
    <li>stores OAuth Implicit Grant connections</li>
    <li>owned by <code>user</code> weakly through <code>username</code> to avoid a lookup</li>
    <li>might merge later into <code>session</code> or Better Auth's [OIDC Provider](https://better-auth.com/docs/plugins/oidc-provider)</li>
    <li><code>data</code> stores:
      <ul>
        <li>remoteStorage <code>scope</code></li>
        <li><code>depotId</code> pointing to which provider or <code>account_subsource</code> is linked</li>
      </ul>
    </li>
  </ul>
</td>
<td>✔︎</td>
<td></td>
<td>✔︎</td>
</tr>
<tr>
<td>
  <code>session</code>
</td>
<td>
  <ul>
    <li>currently used only for cookies</li>
  </ul>
</td>
<td></td>
<td>✔︎</td>
<td></td>
</tr>
</tbody>
</table>
