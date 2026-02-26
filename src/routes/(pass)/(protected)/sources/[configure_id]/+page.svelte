<script>
import { unlinkAccount } from '$lib/better-auth/client.js';

/** @type {import('./$types').PageProps} */
const { data } = $props();

const mod = {

	unlink: async account => {
		await unlinkAccount(account);
	},

};
</script>

<label for="source-select">Choose default source</label>
<select id="source-select">
	{#each data.groups as e }
	<optgroup label={ e.label }>
	  {#each e.options as e }
	  	<option>{ e.name }</option>
	  {/each}
	</optgroup>
	{/each}
</select>

<button onclick={ mod.unlink }>Unlink</button>
