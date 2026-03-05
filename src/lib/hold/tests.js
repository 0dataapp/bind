import { describe, test, expect } from 'vitest';
import mod from '../hold.js';
import local_disk from './local_disk.js';
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
		local_disk,
		git_https,
	}).forEach(([wrapperId, wrapper]) => {

		describe(wrapperId, () => {

			[
				'startup',
				'prepare',
				'erase',
			].forEach(method => {

				test(method, () => {
					if (!['startup', 'prepare'].includes(method))
						expect(mod.interface(wrapperId)[method]).not.toBeUndefined();

					expect(mod.interface(wrapperId)[method]).toBe(wrapper.hold[method]);
				});

			});

		});

	});

});
