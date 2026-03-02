<script>
import logic from './logic.js';
import { linkSocial } from '$lib/auth/client.js';
const link = slug => linkSocial(Object.assign({
	callbackURL: `/sources/${ slug }`,
}, logic.params(slug)));

/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

{#if data.linked.length }
	
<h4>Connected</h4>

<ul>
{#each data.linked as e }
	<li>
		<a href={ `/sources/${ e.slug }` }>{ e.name }</a>
		{#if e.account._sources && !e.account._sources.length }
			<strong> (no sources selected)</strong>
		{:else if e.account._sources && e.account._sources.length }
			<ul>
				{#each e.account._sources as e }
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
	<button class={ e.slug } onclick={ () => link(e.slug) }>{ e.name }</button>
{/each}

{/if}
