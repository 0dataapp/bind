<script setup>
import { data as _data } from './apps.data.js'

const data = _data[0].frontmatter.data;
</script>

# Quickstart

## Get an account

1. Sign up for an account on the community server or follow the [host guide](/host/) to run your own.
2. Connect GitHub or other sources so you can sync repositories.
3. Use your *storage address* (looks like `account@example.com`) with any remoteStorage-compatible app.

## Featured apps

<featured-apps>

<app class="info custom-block" v-for="e of data">
  <a :href="`${ e.url }`" aria-hidden="true"><img :src="`${ e.icon }`" /></a>
  <article>
    <p><a :href="`${ e.url }`">{{ e.name }}</a></p>
    <span>{{ e.description }}</span>
  </article>
</app>

</featured-apps>

Find more on the [remoteStorage website](https://remotestorage.io/apps.html).
