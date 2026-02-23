<script>
import { updateUser } from '$lib/better-auth/client';
import { invalidateAll } from '$app/navigation';

const state = {
	username: '',
	setError: message => state.error = message,
};

const mod = {

	onsubmit: event => {
		event.preventDefault();

		state.error = null;

		updateUser({
			username: state.username,
			fetchOptions: {
				onSuccess: () => {
					invalidateAll(); // force svelte to re-run load function so that updated username appears on dash https://svelte.dev/docs/kit/load#Rerunning-load-functions-Manual-invalidation

					state.username = '';

					state.success = 'Username changed';
				},
				onError: context => state.setError(context.error.message),
			},
		});
	},

};

import Flash from '$lib/Flash.svelte';
</script>

<form onsubmit={ mod.onsubmit }>

{#if state.success }
	<Flash type="success" message={ state.success } />
{/if}

{#if state.error }
	<Flash type="error" message={ state.error } />
{/if}

<label for="username">New username</label>
<input
	id="username"
	type="text"
	placeholder="…"
	required
	autofocus
	bind:value={ state.username }
	/>

<input type="submit" value="Continue" />

</form>
