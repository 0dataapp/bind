const mod = {

	_randomCharacter: chars => chars.charAt(Math.floor(Math.random() * chars.length)),
	_randomLetter: () => mod._randomCharacter('abcdefghjkmnpqrstuvwxyz'),
	_randomDigit: () => mod._randomCharacter('23456789'),
	generate: (length = 3) => {
		if (length < 3)
			throw new Error('length too short');

		return Array.from({ length }, (e, i) => i % 2 ? mod._randomDigit() : mod._randomLetter()).join('');
	},

};

export default mod;
