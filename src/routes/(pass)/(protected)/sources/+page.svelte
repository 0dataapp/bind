<script>
import { linkSocial, listAccounts, unlinkAccount } from '$lib/better-auth/client.js';
import logic from './logic.js';

const mod = {

	_accounts: [],
	setAccounts (data) {
		mod._accounts = data.filter(e => e.providerId !== 'credential');

		mod.available = logic.providers.filter(e => !mod._accounts.map(e => e.providerId).includes(e.slug));
		mod.linked = mod._accounts.map(account => Object.assign(logic.providers.filter(e => account.providerId === e.slug).shift(), {
			account,
		}));
	},
	available: [],
	linked: [],

	link: slug => linkSocial(Object.assign({
		callbackURL: '/sources',
	}, logic.params(slug))),

	unlink: async account => {
		await unlinkAccount(account);
		mod.setAccounts(mod._accounts.filter(e => e.id !== account.id));
	},

	setup: async () => {
		const { data } = await listAccounts();
		
		if (!data)
			return;

		mod.setAccounts(data);
	}

};

mod.setup();

</script>

{#if mod.available.length }

<h4>Link account</h4>

{#each mod.available as e }
	<button class={ e.slug } onclick={ () => mod.link(e.slug) }>{ e.name }</button>
{/each}

{/if}

{#if mod.linked.length }
	
<h4>Unlink account</h4>

{#each mod.linked as e }
	<button onclick={ () => mod.unlink(e.account) }>{ e.name }</button>
{/each}

{/if}
