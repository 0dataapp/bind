# Host

Bind is designed to be easy to self-host via the following [one-click panels](https://easyindie.app); this also lets you install other things relevant to your community on the same server with little effort.

Each panel maintain its own app catalog for one-click installs; if Bind is not included there, it's possible to deploy as a 'custom app'.

Simpler options are first.

::: warning Safety note

Create your admin account immediately after installation. You may also want disable signups by going to `/admin/settings` on your instance.

:::
### [Cloudron](https://cloudron.io)

- automatic updates
- automatic backups
- multi-user management
- [175+ one-click apps](https://www.cloudron.io/store/index.html)
- demo: https://my.demo.cloudron.io

::: details Setup

0. [Install Cloudron](https://www.cloudron.io/get.html) via one-click images on numerous hosting platforms.

1. Navigate to `App Store` → `Add custom app` → `Community app` and paste the following URL:

```
https://bind.0data.app/CloudronVersions.json
```

2. Tap `Install Bind`, set your location to `bind` or something else, and then click `Install Bind`.

:::

::: details Updates

Community apps are updated automatically.

:::

### [Caprover](https://caprover.com)

- developer-oriented
- platform-as-a-service
- open-source
- deploy from a local directory or docker images
- [300+ apps](https://wizardly-ptolemy-8fcac8.netlify.app/) (often requires setting environment variables)
- demo: https://captain.server.demo.caprover.com/?demo=true

::: details Setup

0. [Install Caprover](https://caprover.com/docs/get-started.html) via one-click DigitalOcean droplet, or manually on any hosting platform.
1. Navigate to `Apps` → `Create A New App` → `One-Click Apps/Databases`
, then search for `>> TEMPLATE <<` or scroll to the bottom.
2. Select the `>> TEMPLATE <<` app and paste the configuration from [`platform/caprover/compose.yml`](https://github.com/0dataapp/bind/blob/master/platform/caprover/compose.yml).
3. Name your app `bind` or something else, then click `Deploy`.

:::

::: details Updates

1. Navigate to `Deployment`, configure with the parameters below, then click `Deploy Now`.

<dl>
<dt>Method 6: Deploy via ImageName</dt>
<dd>

```
0data/bind:latest
```

</dd>
</dl>

After 'finishing', give it a minute, to fully load and come online.

:::

### [Coolify](https://coolify.io)

- developer-oriented
- platform-as-a-service
- open-source
- [280+ one-click services](https://coolify.io/docs/services/overview)

::: details Setup

0. Subscribe to [Coolify Cloud](https://coolify.io/cloud), or [install Coolify](https://coolify.io/docs/get-started/installation) via one-click images on Hetzner, DigitalOcean or other hosting platforms.

1. Navigate to `Projects` → choose/create a project… → `Resources` → `+ New` → `Applications` → `Git Based` → `Public Repository`.

2. Configure with the parameters below, then select `Continue`:

<dl>
<dt>Repository URL</dt>
<dd>

```
https://github.com/0dataapp/bind/tree/master
```

</dd>
<dt>Build Pack</dt>
<dd>

```
Docker Compose
```

</dd>
<dt>Docker Compose Location</dt>
<dd>

```
/platform/coolify/compose.yml
```

</dd>
</dl>

3. On the `Configuration` page, add a domain under `General` → `Domains` by entering something like `https://bind.[your root domain]` and clicking `Save`, or make a random one by clicking `Generate Domain`.

4. Click `Deploy`.

In case of [SSL issues](https://coolify.io/docs/troubleshoot/dns-and-domains/lets-encrypt-not-working) click `Redeploy`.

:::

::: details Updates

1. Click `Redeploy`, or pull from the Git repository via `Advanced` → `Force deploy (without cache)`.

:::

## Configuration

- `BIND_SECRET`: configured automatically, used by [Better Auth](https://better-auth.com/docs/reference/options#secret) to encrypt credentials.
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: create a new [OAuth App](https://github.com/settings/developers) and set these credentials to enable connecting GitHub accounts.

