<script>
export let message = '';
export let type = '';
</script>

<p><flash class={ type }>{ message }</flash></p>

<style>
flash {
	--color: #0f80ff;

	display: block;
	padding: var(--spacing);
	color: var(--color);
	border: 1px solid var(--color);
	background-color: color-mix(in srgb, transparent, var(--color) 5%);
}

flash:global(.success) {
	--color: #408002;
}

flash:global(.error) {
	--color: #fd6666;
}
</style>
