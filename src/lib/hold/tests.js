import { describe, test, expect } from 'vitest';
import mod from '../hold.js';

describe('identifier', () => {

	test('unknown', () => {
		expect(() => mod.identifier(Math.random().toString())).toThrow(/unknown depot/);
	});

	test('local_custody', () => {
		expect(mod.identifier('local_custody')).toEqual('local_disk');
	});

	test('github', () => {
		expect(mod.identifier('github')).toEqual('github_api');
	});

	test('gitea_selfhosted', () => {
		expect(mod.identifier('gitea_selfhosted')).toEqual('git_https');
	});

});
