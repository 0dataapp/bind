# Host

Bind is designed to be easy to self-host.

The 'lowest-maintenance' way is via [one-click](https://easyindie.app) deploys on the following panels; this also lets you install other things relevant to your community on the same server with little effort.

Each panel maintain its own app catalog for one-click installs; if Bind is not included there, it's possible to deploy as a 'custom app'.

Simpler options are first.

### [Cloudron](https://cloudron.io)

- automatic updates
- automatic backups
- multi-user management
- [175+ one-click apps](https://www.cloudron.io/store/index.html)
- demo: https://my.demo.cloudron.io

::: details Setup

0. [Install Cloudron](https://www.cloudron.io/get.html) via one-click images on one of various hosting platforms.

1. Clone the project locally:

```
git clone https://github.com/0dataapp/bind
```

2. From the project directory, run the `install` command via the [Cloudron CLI](https://docs.cloudron.io/packaging/cli/):

```
cd bind
cloudron install --image 0data/bind:cloudron --location bind
```

---

Once you sign up for an account, you may want disable signups by setting `DISABLE_SIGNUPS` to `true` in `/app/data/.env` and restarting the app.

:::

::: details Updates

1. From the project directory, run the `update` command via the [Cloudron CLI](https://docs.cloudron.io/packaging/cli/):

```
cloudron update --image 0data/bind:cloudron --app bind
```

:::

### [Caprover](https://caprover.com)

- developer-oriented
- platform-as-a-service
- open-source
- deploy from a local directory or docker images
- [300+ apps](https://wizardly-ptolemy-8fcac8.netlify.app/) (often requires setting environment variables)
- demo: https://captain.server.demo.caprover.com/?demo=true

::: details Setup

0. [Install Caprover](https://caprover.com/docs/get-started.html) via one-click DigitalOcean droplet.
1. Navigate to `Apps` → `Create A New App` → `One-Click Apps/Databases`
, then search for `>> TEMPLATE <<` or scroll to the bottom.
2. Select the `>> TEMPLATE <<` app and paste the configuration from `caprover/compose.yml`.
3. Name your app `bind` or something else, then click `Deploy`.

---

Once you sign up for an account, you may want disable signups by adding `DISABLE_SIGNUPS=true` in `App Configs` →  `Environment Variables`.

:::

::: details Updates

1. Navigate to `Deployment`, enter `0data/bind:latest` into `Deploy via ImageName`, then click `Deploy`. It may take some time after 'finishing' so give it a minute.

:::

### [Coolify](https://coolify.io)

- developer-oriented
- platform-as-a-service
- open-source
- [280+ one-click services](https://coolify.io/docs/services/overview)

::: details Setup

0. Subscribe to [Coolify Cloud](https://coolify.io/cloud), or [install Coolify](https://coolify.io/docs/get-started/installation) via one-click images on Hetzner, DigitalOcean or other hosting platforms.

1. Navigate to `Projects` → choose/create a project… → `Resources` → `+ New` → `Applications` → `Git Based` → `Public Repository`

2. Configure the following parameters

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
/coolify/compose.yml
```

</dd>
</dl>

3. select `Continue` and then, on the following `Configuration` page, click `Deploy`.
4. setup a domain under `Configuration` → `General` → `Domains` by entering something like `https://bind.[your root domain]` and clicking `Save`, or make a random one by clicking `Generate Domain`; in case of [SSL issues](https://coolify.io/docs/troubleshoot/dns-and-domains/lets-encrypt-not-working) click `Redeploy`.

---

Once you sign up for an account, you may want disable signups by navigating to `Environment Variables` and set `DISABLE_SIGNUPS` to `true`.

You may also want to enable `Force HTTPS by redirecting all HTTP traffic to HTTPS`.

:::

::: details Updates

1. Click `Redeploy` or `Advanced` → `Force deploy (without cache)` to pull from the Git repository.

:::
