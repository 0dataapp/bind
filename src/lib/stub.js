const mod = {

	domain: () => `${ Date.now().toString(36) }.xyz`,
	
	email: () => `${ 'example' || Math.random().toString(36) }@${ mod.domain() }`,
	
	account: () => ({
		email: mod.email(),
		password: Math.random().toString(),
	}),

	origin: () => `http://${ mod.domain() }`,

	scope: () => `${ Date.now().toString(36) }:rw`,

};

export default mod;
