const mod = {

	encoding: contentType => [
		'application/json',
		'text',
	].filter(e => contentType.startsWith(e)).length ? 'utf8' : undefined,

};

export default mod;
