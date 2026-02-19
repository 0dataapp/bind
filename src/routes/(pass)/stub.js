const mod = {

	email: () => `${ 'example' || Math.random().toString(36) }@${ Date.now().toString(36) }.xyz`,
	
	account: () => ({
		email: mod.email(),
		password: Math.random().toString(),
	}),

};

export default mod;
