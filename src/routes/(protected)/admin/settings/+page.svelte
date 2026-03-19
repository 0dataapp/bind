<script>
/** @type {import('./$types').PageProps} */
let { data, form } = $props();

import Flash from '$lib/component/Flash.svelte';
</script>

<form method="POST">

{#if form?.flash }
	<Flash type={ form.flash.type } message={ form.flash.message } />
{/if}

<p>
	<input
		id="disable_signups"
		name="disable_signups"
		type="checkbox"
		checked={ data.map.disable_signups }
		/>
	<label for="disable_signups">Disable signups</label>
</p>

<input type="submit" value="Continue" />

</form>
