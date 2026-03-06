<script>
import { admin } from '$lib/auth/client';

import { html } from 'gridjs';
import Grid from 'gridjs-svelte';

/** @type {import('./$types').PageProps} */
let { data } = $props();

const formatter = cell => new Date(cell).toLocaleString('en-US', {
  month: 'short',
  year: 'numeric'
});

const options = {
  columns: [{
    id: 'username',
    name: 'handle',
    formatter: cell => html(`<b>${ cell }</b>`)
  }, 'email', {
    id: 'createdAt',
    name: 'created',
    formatter,
  }, {
    id: 'updatedAt',
    name: 'updated',
    formatter,
  }, 'role'],

  data: data.users,

  sort: true,
  search: true,
};
</script>

<Grid { ...options } />

<style>
@import 'gridjs/dist/theme/mermaid.css';

:global(wrap.admin) {
  --focus-cap: 700px;

  :global(.gridjs-wrapper) {
    border-radius: var(--corner);
  }

  :global(th), :global(td) {
    padding: calc(var(--spacing) / 2);
  }
}
</style>
