import { describe, test, expect } from 'vitest';
import mod from '../util.js';
import stub from '../../stub.js';

import crypto from 'crypto';
describe('hash', () => {

	test('text', () => {
		const e = Math.random().toString();
		expect(mod.hash(e)).toBe(crypto.createHash('sha256').update(e).digest('hex').substring(0, 8));
	});

});

describe('encoding', () => {

	test('text', () => {
		expect(mod.encoding(`text/${ Math.random().toString() }`)).toBe('utf8');
	});

	test('application/json', () => {
		expect(mod.encoding('application/json')).toBe('utf8');
	});

	test('other', () => {
		expect(mod.encoding(Math.random().toString())).toBe(undefined);
	});

});
