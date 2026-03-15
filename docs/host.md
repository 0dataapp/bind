# Self-host

Bind is designed to be easy to self-host.

The 'lowest-maintenance' way is via [one-click](https://easyindie.app) deploys on the following panels, but you can choose what works best for you.

## Panels

These panels maintain their own 'app stores' for one-click installs; until this is included there, it takes more clicks to setup.

### [Cloudron](https://cloudron.io)

First clone the project locally:

```
git clone https://github.com/0dataapp/bind
cd bind
```

Then from the project directory, run the `install` command via the [Cloudron CLI](https://docs.cloudron.io/packaging/cli/):

```
cloudron install --image 0data/bind:cloudron --location bind
```

Updates are also done from the project directory:

```
cloudron update --image 0data/bind:cloudron --app bind
```

Once you sign up for an account, you may want disable signups by setting `DISABLE_SIGNUPS` to `true` in `/app/data/.env` and restarting the app.

### [Caprover](https://caprover.com)

1. navigate to `Apps` → `Create A New App` → `One-Click Apps/Databases`
, then search for `>> TEMPLATE <<` or scroll to bottom.
2. select the `>> TEMPLATE <<` app and paste the configuration from `caprover/compose.yml`.
3. name your app as `bind` or something else, and then deploy.

To update an existing app: navigate to `Deployment`, enter `0data/bind:latest` into `Deploy via ImageName`, then click `Deploy`. It may take some time after 'finishing' so give it a minute.

Once you sign up for an account, you may want disable signups by adding `DISABLE_SIGNUPS=true` to your environment variables.

### [Coolify](https://coolify.io)

1. navigate to `Projects` → choose/create a project… → `Resources` → `+ New` → `Applications` → `Git Based` → `Public Repository`
2. configure as follows:
  - Repository URL:
    
    ```
    https://github.com/0dataapp/bind/tree/master
    ```
  
  - Build Pack:
    
    ```
    Docker Compose
    ```
  
  - Docker Compose Location:
    
    ```
    /coolify/compose.yml
    ```
3. select `Continue` and then, on the following `Configuration` page, click `Deploy`.
4. setup a domain under `Configuration` → `General` → `Domains` by entering something like `https://bind.[your root domain]` and clicking `Save`, or make a random one by clicking `Generate Domain`; in case of [SSL issues](https://coolify.io/docs/troubleshoot/dns-and-domains/lets-encrypt-not-working) click `Redeploy`.

Update by clicking `Redeploy` or `Advanced` → `Force deploy (without cache)` to pull from the Git repository.

Once you sign up for an account, you may want disable signups by navigating to `Environment Variables` and set `DISABLE_SIGNUPS` to `true`.

You may also want to enable `Force HTTPS by redirecting all HTTP traffic to HTTPS`.

