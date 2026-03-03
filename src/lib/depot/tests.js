import { describe, test, expect } from 'vitest';
import mod from '../depot.js';

describe('maxSize', () => {

	test('output', () => {
		expect(mod.maxSize()).toEqual(`${ mod._maxBytes / 1000 }MB`);
	});

});
