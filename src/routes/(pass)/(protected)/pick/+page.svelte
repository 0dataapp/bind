<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

<label for="source-select">Choose source</label>
<select id="source-select">
	{#each data.groups as e }
	<optgroup label={ e.label }>
	  {#each e.options as e }
	  	<option>{ e.name }</option>
	  {/each}
	</optgroup>
	{/each}
</select>
