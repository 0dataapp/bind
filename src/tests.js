import { describe, test, expect } from 'vitest';
import fs from 'fs';

describe('ignore', () => {

	test('sync', () => {
		const _read = e => fs.readFileSync(`.${ e }ignore`, 'utf8').split('\n').filter(e => !!e && !e.startsWith('#'));
		expect(_read('git')).toEqual(_read('docker').filter(e => ![
			'.git',
			'docs',
		].includes(e)));
	});

});
