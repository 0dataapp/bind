import { describe, test, expect } from 'vitest';
import mod from '../util.js';
import stub from '../../stub.js';

import crypto from 'crypto';
test('hash', () => {
	const e = Math.random().toString();
	expect(mod.hash(e)).toBe(crypto.createHash('sha256').update(e).digest('hex').substring(0, 8));
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

describe('isJunk', () => {

	test('.DS_Store', () => {
		expect(mod.isJunk('.DS_Store')).toBe(true);
		expect(mod.isJunk(`${ stub.ulid() }/.DS_Store`)).toBe(true);
	});

	test('other', () => {
		expect(mod.isJunk(Math.random().toString())).toBe(false);
	});

});

describe('_guessType', () => {

	describe('basename', () => {

		test('text', async () => {
			expect(await mod._guessType(null, stub.basename())).toBe('text/plain');
		});

		test('json', async () => {
			expect(await mod._guessType(null, stub.basename().replace('.txt', '.json'))).toBe('application/json');
		});

		test('html', async () => {
			expect(await mod._guessType(null, stub.basename().replace('.txt', '.html'))).toBe('text/html');
		});

		test('zip', async () => {
			expect(await mod._guessType(null, stub.basename().replace('.txt', '.zip'))).toBe('application/zip');
		});

		test('jpg', async () => {
			expect(await mod._guessType(null, stub.basename().replace('.txt', '.jpg'))).toBe('image/jpeg');
		});

		test('mp4', async () => {
			expect(await mod._guessType(null, stub.basename().replace('.txt', '.mp4'))).toBe('video/mp4');
		});

	});

	describe('buffer', () => {

		test('text', async () => {
			expect(await mod._guessType(Buffer.from(Math.random().toString()), stub.ulid())).toBe('text/plain');
		});

		test('json', async () => {
			expect(await mod._guessType(Buffer.from(JSON.stringify({})), stub.ulid())).toBe('application/json');
			expect(await mod._guessType(Buffer.from(JSON.stringify([])), stub.ulid())).toBe('application/json');
		});

		test('html', async () => {
			expect(await mod._guessType(Buffer.from('<!DOCTYPE html>'), stub.ulid())).toBe('text/html');
		});

		test('zip', async () => {
			expect(await mod._guessType(stub.zip(), stub.ulid())).toBe('application/zip');
		});

	});

});
