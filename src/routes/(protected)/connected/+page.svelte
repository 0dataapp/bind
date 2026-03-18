<script>
import util from '$lib/util.js';
import logic from './logic.js';

/** @type {import('./$types').PageProps} */
const { data } = $props();

const groupings = util.group.asArray(data.connections, e => e.data.client_id);
</script>
{#if !groupings.length }

<p>No connected apps</p>

{:else}

<ol>
{#each groupings as item }
	{@const name = logic.groupName(item.key) }
	{@const id = item.values.at(0).data.client_id }
	<li>
		<a href={ `/connected/${ util.hex.encode(id) }` }>{ name }</a>
	</li>
{/each}
</ol>

{/if}
