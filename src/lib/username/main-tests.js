import { describe, test, expect } from 'vitest';
import mod from './main.js';

describe('generate', () => {

	test('type', () => {
		expect(mod.generate()).toBeTypeOf('string');
	});

	test('letter number letter', () => {
		expect(mod.generate()).toMatch(/^[a-z][0-9][a-z]$/);
	});

	test('random', () => {
		const items = Array.from({ length: 10 }, mod.generate);
		expect(Array.from(new Set(items))).toEqual(items);
	});

	test('ambiguous letters', () => {
		const items = Array.from({ length: 100 }, mod.generate);
		expect(items.filter(e => e.match(/[ilo10]/i))).toEqual([]);
	});

	test('input under 3', () => {
		expect(() => mod.generate(2)).toThrow(/length too short/);
	});

	test('length', () => {
		const length = Math.max(Date.now() % 10, 4);
		expect(mod.generate(length)).toMatch(new RegExp(`^${ Array.from({ length }, (e, i) => i % 2 ? '[0-9]' : '[a-z]').join('') }$`));
	});

});
