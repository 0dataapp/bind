<script>
const state = {
	password: '',
	confirm: '',
};

/** @type {import('./$types').PageProps} */
let { data, form } = $props();

import Flash from '$lib/Flash.svelte';
</script>

<form method="POST">

{#if form?.error }
	<Flash type="error" message={ form?.error } />
{/if}

<p>This will immediately and irreversibly delete all your data.</p>

<label for="password">Password</label>
<input
	id="password"
	name="password"
	type="password"
  placeholder="…"
  required
	bind:value={ state.password }
	/>

<label for="confirm">Confirmation (type <code>CONFIRM</code>)</label>
<input
	id="confirm"
	name="confirm"
	type="text"
  placeholder="…"
  required
	bind:value={ state.confirm }
	/>

<input type="submit" value="Delete my data" />

</form>
