import { describe, test, expect } from 'vitest';
import mod from '../hold.js';

describe('wrapperId', () => {

	test('unknown', () => {
		expect(() => mod.wrapperId(Math.random().toString())).toThrow(/unknown depot/);
	});

	test('github', () => {
		expect(mod.wrapperId('github')).toEqual('git_https');
	});

});
