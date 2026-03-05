<script>
import { linkSocial } from '$lib/auth/client.js';
const link = e => linkSocial({
	provider: e.id,
	callbackURL: `/sources/${ e.id }`,
});

/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

{#if data.linked.length }
	
<h4>Connected</h4>

<ul>
{#each data.linked as e }
	<li>
		<a href={ `/sources/${ e.id }` }>{ e.name }</a>
		{#if e._subsources && !e._subsources.length }
			<strong> (no sources selected)</strong>
		{:else if e._subsources && e._subsources.length }
			<ul>
				{#each e._subsources as e }
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

<div class="available">
{#each data.available as e }
	<button class={ e.id } onclick={ () => link(e) }>{ e.name }</button>
{/each}
</div>

{/if}

{#if !data.linked.length && !data.available.length }

<p>No sources available.</p>

<p>See <a href="https://bind.0data.app" target="_blank">documentation</a> for integration options.</p>

{/if}

<style>
.available button {
	margin-right: var(--spacing);
}
</style>
