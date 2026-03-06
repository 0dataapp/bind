<script>
import { admin } from '$lib/auth/client';

let { didCreate } = $props();

const state = $state({});
const onsubmit = async event => {
  state.error = null;
  
  const { data, error } = await admin.createUser({
    email: event.target.querySelector('[name="email"]').value,
    password: 'changeme123',
    name: '',
  });

  if (error) {
    return state.error = error.message;
  }

  didCreate(data.user);
}
import Flash from '$lib/component/Flash.svelte';
</script>

{#if state.error }
  <Flash type="error" message={ state.error } />
{/if}

<form onsubmit={ onsubmit }>
  <fieldset role="group">
    <input type="email" name="email" placeholder="email" required />
    <input type="submit" value="Create account" />
  </fieldset>
</form>
