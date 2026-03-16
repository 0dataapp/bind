<script>
import { unlinkAccount } from '$lib/auth/client.js';
import { goto } from '$app/navigation';

/** @type {import('./$types').PageProps} */
const { data } = $props();

let value = $state(data.selected);
let raw = $state('');

const mod = {

	onChange: sel => raw = JSON.stringify(sel),

	unlink: async () => {
		await unlinkAccount(data.account);
		return goto('/sources');
	},

};

import Svelecte from 'svelecte';
</script>

<form method="POST">

<p>Authorized apps can read/write data to selected sources.</p>

<ul>
<li>Showing recent repositories under { data.maxSize }.</li>
<li>Select up to { data.maxItems } items.</li>
</ul>

<div class="Svelecte-container">
	<Svelecte
	  bind:value
	  multiple
	  valueAsObject
	  max={ data.maxItems }
	  options={ data.groups }
	  onChange={ mod.onChange }
	/>
</div>

<input type="hidden" name="sources" value={ raw } />

<input type="submit" value="Continue" />

</form>

<hr>

<button class="secondary" onclick={ mod.unlink }>Unlink</button>

<style>
.Svelecte-container {
	margin: var(--spacing) 0;
	line-height: var(--pico-line-height);
}
.Svelecte-container :global(.svelecte .sv-input--text)  {
	padding: unset !important;
	height: unset !important;
	--pico-outline-width: 0;
}

.Svelecte-container :global(.svelecte .sv-item--content)  {
	padding: 4px 0;
}
</style>
