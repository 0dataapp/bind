<script>
const { data } = $props();
</script>

<form>
  <fieldset role="group">
    <pre class="account">{ JSON.stringify(data.session.user.email) }@{ data.origin }</pre>
    <button>copy</button>
  </fieldset>
</form>

<a href="/logout">Sign out</a>
