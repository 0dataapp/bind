<script>
import 'normalize.css';
import '@picocss/pico';
import '$lib/component/zero-data.css';
import './style.css';

import { page } from '$app/state';
let { children, data } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="{ page.data.viewport || 'width=device-width, initial-scale=1' }" />
	
	<title>{ page.data.title }</title>

	<link rel="icon" href="data:;base64,=">

	<meta name="referrer" content="no-referrer" />
</svelte:head>

<wrap class={ page.route.id?.split('/').pop() || 'home' }>

<focus class="container-fluid">

<h1>{ page.data.title }</h1>

{@render children?.()}

{#if data.navigation.length }
	
<hr>

<footer>
	<nav>
		{#each data.navigation as section, index}
			{#if index}&nbsp;·&nbsp;{/if}<a href="{section.path}">{section.title}</a>
		{/each}
	</nav>
</footer>

{/if}

</focus>

</wrap>
