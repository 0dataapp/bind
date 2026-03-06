const mod = {

	_randomCharacter: chars => chars.charAt(Math.floor(Math.random() * chars.length)),
	_randomLetter: () => mod._randomCharacter('abcdefghjkmnpqrstuvwxyz'),
	_randomDigit: () => mod._randomCharacter('23456789'),
	_generate (length = 3) {
		if (length < 3)
			throw new Error('length too short');

		return Array.from({ length }, (e, i) => i % 2 ? mod._randomDigit() : mod._randomLetter()).join('');
	},

	async generate (auth) {
		let username, response;
		let tries = 0;
		const check = username => auth.api.isUsernameAvailable({
		  body: { username },
		});
		while (!response || !response?.available)
		  response = await check(username = mod._generate(3 + tries++ / 10));

		return username;
	},

};

export default mod;
