<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();

const mod = {

  account: `${ data.session.user.username }@${ data.origin }`,

};

import CopyButton from '$lib/CopyButton.svelte';
</script>

<form>
  <fieldset role="group">
    <pre class="account">{ mod.account }</pre>
    <CopyButton text={ mod.account } />
  </fieldset>
</form>

<a href="/password">Change password</a>
