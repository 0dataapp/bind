<script>
import { admin } from '$lib/auth/client';

import { html } from 'gridjs';
import Grid from 'gridjs-svelte';
let grid;

/** @type {import('./$types').PageProps} */
let { data } = $props();
const formatter = cell => new Date(cell).toLocaleString('en-US', {
  month: 'short',
  year: 'numeric'
});
const options = {
  columns: [
    {
      id: 'username',
      name: 'handle',
      formatter: cell => html(`<b>${ cell }</b>`)
    },
    'email',
    {
      id: 'createdAt',
      name: 'created',
      formatter,
    },
    {
      id: 'updatedAt',
      name: 'updated',
      formatter,
    },
    'role',
  ],

  data: data.users,

  sort: true,
  search: true,
};

import CreateAccount from './CreateAccount.svelte';
</script>

<a class="settings" href="/admin/settings">Settings</a>

<hr>

<Grid bind:this={ grid } { ...options } />

<CreateAccount didCreate={ e => grid.instance.updateConfig({
  data: grid.instance.config.data.concat(e),
}).forceRender() } />

<style>
@import 'gridjs/dist/theme/mermaid.css';

:global(wrap.admin) {
  --bind-focus-cap: 700px;
  background: var(--zd-c-bg-focus);

  :global(focus) {
    background: var(--zd-c-bg);
  }
}

:global(wrap.admin article) {
  padding: 0;
  background: none;
  
  :global(&, *) {
    box-shadow: none;
  }

  :global(.gridjs-container) {
    padding: 0;
  }

  :global(.gridjs-input) {
    background-color: var(--zd-c-bg-alt);
  }

  :global(.gridjs-wrapper) {
    border-radius: var(--bind-corner);

    :global(.gridjs-tbody, th, td) {
      background: none;
    }

    :global(thead tr, tr:nth-child(2n)) {
      background-color: var(--zd-c-bg-alt2);
    }

    :global(tbody tr) {
      background-color: var(--zd-c-bg-alt);
    }

    :global(th), :global(td) {
      padding: calc(var(--bind-spacing) / 2);
    }
  }

}

</style>
