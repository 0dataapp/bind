import { describe, test, expect } from 'vitest';
import mod from '../local_disk.js';

describe('filesystem', () => {

	describe('_encoding', () => {

		test('text', () => {
			expect(mod.filesystem._encoding(`text/${ Math.random().toString() }`)).toBe('utf8');
		});

		test('application/json', () => {
			expect(mod.filesystem._encoding('application/json')).toBe('utf8');
		});

		test('other', () => {
			expect(mod.filesystem._encoding(Math.random().toString())).toBe(undefined);
		});

	});

});
