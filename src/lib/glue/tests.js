import { describe, test, expect } from 'vitest';
import mod from '../oauth-implicit.js';

describe('_generateToken', () => {

	test('type', () => {
		expect(mod._generateToken()).toBeTypeOf('string');
	});

	test('length', () => {
		expect(mod._generateToken().length).toBe(64);
	});

	test('random', () => {
		const items = Array.from({ length: 100 }, mod._generateToken);
		expect(Array.from(new Set(items))).toEqual(items);
	});

	test('hex', () => {
		const items = Array.from({ length: 100 }, mod._generateToken);
		expect(items.filter(e => !e.match(/^[a-f0-9]+$/))).toEqual([]);
	});

});
