<script>
const { data } = $props();
</script>

<form method="POST">
  <input type="submit" value="yes" />
  <a href={ `${ data.redirect_uri }#error=access_denied` }>no</a>
</form>


