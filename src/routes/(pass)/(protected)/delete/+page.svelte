<script>
import { deleteUser } from '$lib/better-auth/client';
import { goto } from '$app/navigation';

const state = {
	password: '',
	confirm: '',
	setError: message => state.error = message,
};

const mod = {

	onsubmit: event => {
		event.preventDefault();

		if (state.confirm !== 'CONFIRM')
			return state.setError('Confirmation incorrect')

		state.error = null;

		deleteUser({
			password: state.password,
			fetchOptions: {
				onSuccess: () => {
					goto('/');
				},
				onError: context => {
					state.password = '';
					state.confirm = '';
					
					state.setError(context.error.message)
				},
			},
		});
	},

};

import Flash from '$lib/Flash.svelte';
</script>

<form onsubmit={ mod.onsubmit }>

{#if state.error }
	<Flash type="error" message={ state.error } />
{/if}

<p>This will immediately and irreversibly delete all your data.</p>

<label for="password">Password</label>
<input
	id="password"
	type="password"
  placeholder="…"
  required
	bind:value={ state.password }
	/>

<label for="confirm">Confirmation (type <code>CONFIRM</code>)</label>
<input
	id="confirm"
	type="text"
  placeholder="…"
  required
	bind:value={ state.confirm }
	/>

<input type="submit" value="Delete my data" />

</form>
