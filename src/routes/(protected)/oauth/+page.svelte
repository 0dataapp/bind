<script>
const { data } = $props();
</script>

The app at <code>{ data.client_id }</code> would to like access:

<table>
<tbody>
{#each data.scopes as e}
<tr>
  <td>{ e.name }</td>
  <td>({ e.permissions })</td>
</tr>
{/each}
</tbody>
</table>

<form method="POST">
  <input type="submit" value="yes" />
  <a href={ `${ data.redirect_uri }#error=access_denied` }>no</a>
</form>


