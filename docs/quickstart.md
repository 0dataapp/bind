<script setup>
import { data as _data } from './apps.data.js'
const data = _data[0].frontmatter.data;
</script>

# Quickstart

## Get an account

1. Sign up for an account on the community server or follow the [host guide](host.md) to run your own server.
2. Connect GitHub or other data sources so you can sync data with repositories.
3. Use your *storage address* (looks like `account@example.com`) with any remoteStorage-compatible app.

## Featured apps

<ul>
  <li v-for="e of data">
    <a :href="`#${ e.url }`">{{ e.name }}</a>: 
    <span>{{ e.description }}</span>
  </li>
</ul>

Find more on the [remoteStorage website](https://remotestorage.io/apps.html).
