<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();

const account = `${ data.authenticated.user.username }@${ data.origin }`;

import CopyButton from '$lib/component/CopyButton.svelte';
</script>

<p>You can use the following <code>storage address</code> with remoteStorage-compatible apps:</p>

<form>
  <fieldset role="group">
    <pre class="account">{ account }</pre>
    <CopyButton text={ account } />
  </fieldset>
</form>

<p>
  <a href="/sources">Data sources</a>
</p>

<p>
  <a href="/paired">Connected apps</a>
</p>
