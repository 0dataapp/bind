---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bind"
  text: Git-backed web apps.
  tagline: Bring your own repo
  image:
    src: /identity.svg
    alt: VitePress
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: How it works
      link: /understand

features:
  - title: Your data in your control
    details: Keep it one place or many—up to you.
  - title: Permission-less, worry-less.
    details: Always accessible, even if the app isn't.
  - title: Highly interoperable
    details: Files, open protocols, infinite integrations.
---

<div class="ways">

<div class="way">

::: info the traditional way

```mermaid
flowchart LR
  you e1@--> app
  app e2@--> you
  app e3@--> data
  data e4@--> app
  e1@{ animation: slow }
  e2@{ animation: slow }
  e3@{ animation: slow }
  e4@{ animation: slow }
  you@{ shape: circle }
  app@{ shape: rounded }
  data@{ shape: das }
```

Go <em>'through'</em> apps to access your stuff.<br>No app, no data.

:::

</div>
<div class="way">

::: info the Bind way

```mermaid
flowchart LR
  you e1@--> data
  data e2@--> Bind
  Bind e3@--> data
  you e4@--> app
  Bind e5@--> app
  app e6@--> Bind
  app e7@--> you
  data e8@--> you
  e1@{ animation: slow }
  e2@{ animation: slow }
  e3@{ animation: slow }
  e4@{ animation: slow }
  e5@{ animation: slow }
  e6@{ animation: slow }
  e7@{ animation: slow }
  e8@{ animation: slow }
  you@{ shape: circle }
  app@{ shape: rounded }
  Bind@{ shape: diamond }
  data@{ shape: das }
```

Data starts in your hands.<br>Give apps permission as necessary.
:::

</div>  

</div>
