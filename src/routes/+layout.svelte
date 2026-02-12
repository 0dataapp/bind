<script>
import 'normalize.css';
import '@picocss/pico';
import './style.css';

import { page } from '$app/state';
let { children, data } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="{ page.data.viewport || 'width=device-width, initial-scale=1' }" />
	
	<title>{ page.data.title }</title>

	<link rel="icon" href="data:;base64,=">
</svelte:head>

<wrap>

<focus class="container-fluid">

<h1>{ page.data.title }</h1>

{@render children?.()}

<hr>

<footer>
	<nav>
		{#each data.navigation as section, index}
			{#if index}&nbsp;·&nbsp;{/if}<a href="{section.path}">{section.title}</a>
		{/each}
	</nav>
</footer>

</focus>

</wrap>
