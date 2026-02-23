<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();

const mod = {

  account: `${ data.session.user.username }@${ data.origin }`,

};

import CopyButton from '$lib/CopyButton.svelte';
</script>

<p>You can use the following storage address with remoteStorage-compatible apps:</p>

<form>
  <fieldset role="group">
    <pre class="account">{ mod.account }</pre>
    <CopyButton text={ mod.account } />
  </fieldset>
</form>

<p>
  <a href="/paired">Connected apps</a>
</p>

<hr>

<p>
  <a href="/password">Change password</a>
</p>
<p>
  <a href="/username">Change username</a>
</p>
<p>
  <a href="/delete">Delete account</a>
</p>

