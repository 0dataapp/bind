<script>
import util from '$lib/util.js';

/** @type {import('./$types').PageProps} */
const { data } = $props();

const groupings = util.group.asArray(data.connections, e => e.data.client_id);
</script>
{#if !groupings.length }

<p>No connected apps</p>

{:else}

<ol>
{#each groupings as item }
	{@const name = util.humanLink(item.key) }
	{@const id = item.values.at(0).data.client_id }
	<li>
		<a href={ `/connected/${ util.hex.encode(id) }` }>{ name }</a>
	</li>
{/each}
</ol>

{/if}
