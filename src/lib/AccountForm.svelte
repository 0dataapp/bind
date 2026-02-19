<script>
const state = {
	emailorhandle: '',
	password: '',
	setError: message => state.error = message,
};

export let didSubmit;
export let acceptHandle = false;
</script>

<form id="account-form" onsubmit={ event => {
	event.preventDefault();

	state[acceptHandle && !state.emailOrHandle.match('@') ? 'username' : 'email'] = state.emailOrHandle;
	
	state.error = null;

	didSubmit(state);
} }>

{#if state.error }
	<p><error>{ state.error }</error></p>
{/if}

<label for={ acceptHandle ? 'emailOrHandle' : 'email' }>{ acceptHandle ? 'Email or Handle' : 'Email' }</label>
<input
  id={ acceptHandle ? 'emailOrHandle' : 'email' }
  type={ acceptHandle ? 'text' : 'email' }
  placeholder={ acceptHandle ? 'me' : 'me@example.com' }
  required
  bind:value={ state.emailOrHandle }
  />
<label for="password">Password</label>
<input
	id="password"
	type="password"
  placeholder="…"
  required
	bind:value={ state.password }
	/>

<input type="submit" value="Continue" />

</form>

<style>
error {
	color: #fd6666;
}
</style>
