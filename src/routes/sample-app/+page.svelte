<script>
import { browser } from '$app/environment';
let href;

if (browser)
	href = `/authorize?${ new URLSearchParams({
		redirect_uri: location.href,
		scope: 'bind-sample-app:r',
		response_type: 'token',
		client_id: location.href,
	}) }`;
</script>

<p>For development and testing purposes only.</p>

<a { href } role="button">Authorize</a>
