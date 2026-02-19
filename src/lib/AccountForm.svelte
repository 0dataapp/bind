<script>
const state = {
	email: '',
	password: '',
	setError: message => state.error = message,
};

export let didSubmit;
</script>

<form id="account-form" onsubmit={ event => {
	event.preventDefault();
	
	state.error = null;

	didSubmit(state);
} }>

{#if state.error }
	<p><error>{ state.error }</error></p>
{/if}

<label for="email">Email</label>
<input
  id="email"
  type="email"
  placeholder="me@example.com"
  required
  bind:value={ state.email }
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
