<script>
import util from '$lib/util.js';

/** @type {import('./$types').PageProps} */
const { data } = $props();

const mod = {


};
</script>

<ul>
	<li>{ data.connections.length } connections</li>
</ul>

<form method="POST">
  <input type="submit" value="Revoke access" />
</form>





