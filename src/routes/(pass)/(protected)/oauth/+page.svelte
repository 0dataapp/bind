<script>
/** @type {import('./$types').PageProps} */
const { data } = $props();
</script>

<p>The app at <code>{ data.client_id }</code> would to like access</p>

<table>
<tbody>
{#each data.scopes as e}
<tr>
  <td>
    <code>{ e.name }</code>
  </td>
  <td>
    <code>{ e.permissions }</code>
  </td>
</tr>
{/each}
</tbody>
</table>

<p>using data source</p>

<form method="POST">
  <select name="_depot" required>
    <option disabled selected></option>
    {#each data.depots as e }
      {#if e._sources }
        <optgroup label={ e.name }>
          {#each e._sources as item }
            <option value={ item.optionId }>{ item.data.scopedName }</option>
          {/each}
        </optgroup>
        {:else}
        <option value={ e.optionId }>{ e.name }</option>
      {/if}
    {/each}
  </select>
  <fieldset role="group">
    <input class="secondary" type="submit" value="Allow" />
    <a class="contrast" role="button" href={ `${ data.redirect_uri }#error=access_denied` }>Deny</a>
  </fieldset>
</form>


