import { describe, test, expect } from 'vitest';
import mod from '../hold.js';
import local from './local.js';
import git_https from './git_https.js';

describe('wrapperId', () => {

	test('unknown', () => {
		expect(() => mod.wrapperId(Math.random().toString())).toThrow(/unknown depot/);
	});

	test('github', () => {
		expect(mod.wrapperId('github')).toEqual('git_https');
	});

});

describe('interface', () => {

	Object.entries({
		local,
		git_https,
	}).forEach(([wrapperId, wrapper]) => {

		describe(wrapperId, () => {

			[
				'prepare',
				'erase',
			].forEach(method => {

				test(method, () => {
					expect(mod.interface(wrapperId)[method]).toBe(wrapper[method]);
				});

			});

		});

	});

});
