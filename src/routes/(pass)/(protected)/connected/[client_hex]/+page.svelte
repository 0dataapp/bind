<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

<ul>
	<li>{ data.connections.length } connections</li>
</ul>

<form method="POST">
  <input type="submit" value="Revoke access" />
</form>
