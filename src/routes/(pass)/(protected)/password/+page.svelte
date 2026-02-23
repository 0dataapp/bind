<script>
import { changePassword } from '$lib/better-auth/client';

const state = {
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
	setError: message => state.error = message,
};

const mod = {

	onsubmit: event => {
		event.preventDefault();

		if (state.newPassword !== state.confirmPassword)
			return state.setError('New password should match confirmation')

		if (state.oldPassword === state.newPassword)
			return state.setError('New password is the same as old password')

		state.error = null;

		changePassword({
			currentPassword: state.oldPassword,
			newPassword: state.confirmPassword,
			fetchOptions: {
				onSuccess: () => {
					Object.keys(state).filter(e => e.endsWith('Password')).forEach(e => state[e] = '');
					
					state.success = 'Password changed';
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

<label for="oldPassword">Current password</label>
<input
	id="oldPassword"
	type="password"
  placeholder="…"
  required
	bind:value={ state.oldPassword }
	/>

<label for="newPassword">New password</label>
<input
	id="newPassword"
	type="password"
  placeholder="…"
  required
	bind:value={ state.newPassword }
	/>

<label for="confirmPassword">Confirm password</label>
<input
	id="confirmPassword"
	type="password"
  placeholder="…"
  required
	bind:value={ state.confirmPassword }
	/>

<input type="submit" value="Continue" />

</form>
