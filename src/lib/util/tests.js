import { describe, test, expect } from 'vitest';
import mod from '../util.js';
import stub from '$lib/stub.js';

describe('humanLink', () => {

	test('returns input', () => {
		const item = Math.random().toString();
		expect(mod.humanLink(item)).toBe(item);
	});

	test('converts URL to host', () => {
		const item = stub.origin();
		expect(mod.humanLink(item)).toBe(new URL(item).hostname);
	});

	test('removes www.', () => {
		const item = stub.origin().replace('://', '://www.');
		expect(mod.humanLink(item)).toBe(new URL(item).hostname.replace('www.', ''));
	});

	test('includes path', () => {
		const item = `${ stub.origin() }/${ Math.random().toString() }`;
		expect(mod.humanLink(item)).toBe(item.split('://').pop());
	});
	
});
