import { describe, test, expect } from 'vitest';
import mod from '../util.js';

describe('encoding', () => {

	test('text', () => {
		expect(mod.encoding(`text/${ Math.random().toString() }`)).toBe('utf8');
	});

	test('application/json', () => {
		expect(mod.encoding('application/json')).toBe('utf8');
	});

	test('other', () => {
		expect(mod.encoding(Math.random().toString())).toBe(undefined);
	});

});
