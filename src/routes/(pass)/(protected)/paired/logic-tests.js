import { describe, test, expect } from 'vitest';
import mod from './logic.js';
import stub from '$lib/stub.js';

describe('groupName', () => {

	test('returns input', () => {
		const item = Math.random().toString();
		expect(mod.groupName(item)).toBe(item);
	});

	test('converts URL to host', () => {
		const item = stub.origin();
		expect(mod.groupName(item)).toBe(new URL(item).hostname);
	});
	
});
