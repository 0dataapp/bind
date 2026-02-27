<script>
import { linkSocial } from '$lib/better-auth/client.js';
import _data from '$lib/data.js';
import logic from './logic.js';

/** @type {import('./$types').PageProps} */
const { data } = $props();

const accounts = data.accounts.filter(e => e.providerId !== 'credential');

const mod = {

	available: _data.providers.filter(e => !accounts.map(e => e.providerId).includes(e.slug)),
	linked: accounts.map(account => Object.assign(_data.providers.filter(e => account.providerId === e.slug).shift(), {
		account,
	})),

	link: slug => linkSocial(Object.assign({
		callbackURL: `/sources/${ slug }`,
	}, logic.params(slug))),

};
</script>

{#if mod.linked.length }
	
<h4>Connected</h4>

<ul>
{#each mod.linked as e }
	<li>
		<a href={ `/sources/${ e.slug }` }>{ e.name }</a>
	</li>
{/each}
</ul>

{/if}

{#if mod.available.length }

<h4>Link account</h4>

{#each mod.available as e }
	<button class={ e.slug } onclick={ () => mod.link(e.slug) }>{ e.name }</button>
{/each}

{/if}
