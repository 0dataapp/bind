<script>
const { data } = $props();
</script>

<form>
  <fieldset role="group">
    <pre class="account">{ data.user.handle }@{ data.origin }</pre>
    <button>copy</button>
  </fieldset>
</form>

<a href="/logout">Sign out</a>
