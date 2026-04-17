import { describe, test, expect } from 'vitest';
import mod from '../oauth-implicit.js';

test('_generateToken', () => {
	const items = Array.from({ length: 100 }, mod._generateToken);
	expect(Array.from(new Set(items))).toEqual(items);
});
