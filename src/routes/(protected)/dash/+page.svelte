<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();
const address = `${ data.username }@${ data.origin }`;

import CopyButton from '$lib/component/CopyButton.svelte';
</script>

<p>You can use the following <code>storage address</code> with remoteStorage-compatible apps:</p>

<form>
  <fieldset role="group">
    <pre class="address">{ address }</pre>
    <CopyButton text={ address } />
  </fieldset>
</form>

<p>
  <a href="/sources">Data sources</a>
</p>

<p>
  <a href="/connected">Connected apps</a>
</p>
