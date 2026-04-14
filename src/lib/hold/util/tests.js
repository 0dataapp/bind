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

describe('_guessBuffer', () => {

	test('bytes random', async () => {
		expect(mod._guessBuffer(stub.buffer())).toEqual(true);
	});

	test('bytes static', async () => {
		expect(mod._guessBuffer(Buffer.from([0x77, 0xee, 0x4a, 0xf9, 0xd0, 0xfb, 0x37, 0x52, 0x3b, 0x9d, 0x38, 0xee, 0x29, 0xc5, 0x02, 0x1d]))).toEqual(true);
	});

	test('text', async () => {
		expect(mod._guessBuffer(Buffer.from('Hello'))).toEqual(false);
	});

	// test('replace character', async () => {
	// 	expect(mod._guessBuffer(Buffer.from('hello \ufffd'))).toEqual(false);
	// });

	test('char codes', async () => {
		expect([
			String.fromCharCode(72, 101, 108, 108, 111), // Hello
			String.fromCharCode(...(new Uint8Array([71, 111, 111, 100, 98, 121, 101]))), // Goodbye
			(new TextDecoder('utf-8')).decode(new Uint8Array([74, 97, 118, 97, 83, 99, 114, 105, 112, 116])), // JavaScript
			// String.fromCharCode(
			//   0x01,  // SOH (Start of Heading)
			//   0x02,  // STX (Start of Text)
			//   0x03   // ETX (End of Text)
			// ),
			// String.fromCharCode(
			//   0x1C,  // FS (File Separator)
			//   0x1D,  // GS (Group Separator)
			//   0x1E   // RS (Record Separator)
			// ),
		].filter(e => mod._guessBuffer(Buffer.from(e)))).toEqual([]);
	});

});
