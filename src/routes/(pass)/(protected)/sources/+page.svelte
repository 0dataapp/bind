<script>
import logic from './logic.js';
import { linkSocial } from '$lib/auth/client.js';
const link = e => linkSocial(Object.assign({
	callbackURL: `/sources/${ e.id }`,
}, logic.params(e)));

/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

{#if data.linked.length }
	
<h4>Connected</h4>

<ul>
{#each data.linked as e }
	<li>
		<a href={ `/sources/${ e.id }` }>{ e.name }</a>
		{#if e.account._subsources && !e.account._subsources.length }
			<strong> (no sources selected)</strong>
		{:else if e.account._subsources && e.account._subsources.length }
			<ul>
				{#each e.account._subsources as e }
					<li><a href={ e.data.webURL } target="_blank">{ e.data.scopedName }</a></li>
				{/each}
			</ul>
		{/if}
	</li>
{/each}
</ul>

{/if}

{#if data.available.length }

<h4>Link account</h4>

{#each data.available as e }
	<button class={ e.id } onclick={ () => link(e) }>{ e.name }</button>
{/each}

{/if}
