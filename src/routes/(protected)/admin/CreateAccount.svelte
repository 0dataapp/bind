<script>
import { admin } from '$lib/auth/client';

let { didCreate } = $props();

const password = 'changeme123';

const state = $state({});
const onsubmit = async event => {
  state.error = null;
  
  const { data, error } = await admin.createUser({
    email: event.target.querySelector('[name="email"]').value,
    password,
    name: '',
  });

  if (error)
    return state.flash = {
      type: 'error',
      message: error.message,
    };

  didCreate(data.user);

  return state.flash = {
    type: 'success',
    message: `Account created with password <code>${ password }</code>`,
  };
}
import Flash from '$lib/component/Flash.svelte';
</script>

{#if state.flash }
  <Flash type={ state.flash.type } message={ state.flash.message } />
{/if}

<form onsubmit={ onsubmit }>
  <fieldset role="group">
    <input type="email" name="email" placeholder="email" required />
    <input type="submit" value="Create account" />
  </fieldset>
</form>
