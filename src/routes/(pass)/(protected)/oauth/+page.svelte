<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

<p>The app at <code>{ data.client_id }</code> would to like access:</p>

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
  <fieldset role="group">
    <input class="secondary" type="submit" value="Allow" />
    <a class="contrast" role="button" href={ `${ data.redirect_uri }#error=access_denied` }>Deny</a>
  </fieldset>
</form>


