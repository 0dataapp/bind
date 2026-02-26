<script>
import { linkSocial, listAccounts } from '$lib/better-auth/client.js';
import _data from '$lib/data.js';
import logic from './logic.js';

const mod = {

	_accounts: [],
	setAccounts (data) {
		mod._accounts = data.filter(e => e.providerId !== 'credential');

		mod.available = _data.providers.filter(e => !mod._accounts.map(e => e.providerId).includes(e.slug));
		mod.linked = mod._accounts.map(account => Object.assign(_data.providers.filter(e => account.providerId === e.slug).shift(), {
			account,
		}));
	},
	available: [],
	linked: [],

	link: slug => linkSocial(Object.assign({
		callbackURL: `/sources/${ slug }`,
	}, logic.params(slug))),

	setup: async () => {
		const { data } = await listAccounts();
		
		if (!data)
			return;

		mod.setAccounts(data);
	}

};

mod.setup();
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
