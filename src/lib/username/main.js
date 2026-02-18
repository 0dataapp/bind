const mod = {

	_randomCharacter: chars => chars.charAt(Math.floor(Math.random() * chars.length)),
	_randomLetter: () => mod._randomCharacter('abcdefghjkmnpqrstuvwxyz'),
	_randomDigit: () => mod._randomCharacter('23456789'),
	generate: () => [
		mod._randomLetter(),
		mod._randomDigit(),
		mod._randomLetter(),
	].join(''),

};

export default mod;
