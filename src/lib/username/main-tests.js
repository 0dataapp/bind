import { describe, it, expect } from 'vitest';
import mod from './main.js';

describe('generate', () => {

	it('returns string', () => {
		expect(mod.generate()).toBeTypeOf('string');
	});

	it('formats as letter number letter', () => {
		expect(mod.generate()).toMatch(/^[a-z][0-9][a-z]$/);
	});

	it('randomizes', () => {
		const items = Array.from({ length: 10 }, mod.generate);
		expect(Array.from(new Set(items))).toEqual(items);
	});

	it('excludes ambiguous letters', () => {
		const items = Array.from({ length: 100 }, mod.generate);
		expect(items.filter(e => e.match(/[ilo10]/i))).toEqual([]);
	});

});
