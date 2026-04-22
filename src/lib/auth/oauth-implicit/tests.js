import { describe, test, expect, afterAll, vi } from 'vitest';
import db from '$lib/database.js';
import stub from '$lib/stub.js';
import mod from '../oauth-implicit.js';

import { fileURLToPath } from 'url';
import path from 'path';
const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '__testing');
const _collection = db.collection('oauth_connections', { folder });
vi.spyOn(db, 'collection').mockReturnValue(_collection);

import fs from 'fs';
describe('oauth-implicit', () => {

	afterAll(() => {
		// vi.restoreAllMocks();
		fs.rmSync(folder, { recursive: true, force: true });
	});

	describe('_generateToken', () => {

		test('type', () => {
			expect(mod._generateToken()).toBeTypeOf('string');
		});

		test('length', () => {
			expect(mod._generateToken().length).toBe(64);
		});

		test('random', () => {
			const items = Array.from({ length: 100 }, mod._generateToken);
			expect(Array.from(new Set(items))).toEqual(items);
		});

		test('hex', () => {
			const items = Array.from({ length: 100 }, mod._generateToken);
			expect(items.filter(e => !e.match(/^[a-f0-9]+$/))).toEqual([]);
		});

	});

	test('createToken', async () => {
		const username = stub.random();
		const data = stub.object();
		const spy = vi.spyOn(mod, '_generateToken');
		let token;
		expect(await mod.createToken(username, data)).toEqual(token = spy.mock.results[0].value);
		// spy.mockRestore();
		expect(await _collection.hydrating.getItems()).toMatchObject([{
			username,
			data,
			token,
		}]);
	});

	test('authorizations', async () => {
		const username = stub.random();
		await mod.createToken(username, {});
		await mod.createToken(stub.random(), {});
		expect(await mod.authorizations(username)).toMatchObject([{ username }]);
	});

	test('authorization', async () => {
		const username = stub.random();
		const data = stub.object();
		const token = await mod.createToken(username, data);
		expect(await mod.authorization(username, token)).toMatchObject({
			username,
			data,
			token,
		});
	});

	test('getScope', async () => {
		const username = stub.random();
		const scope = stub.random();
		const token = await mod.createToken(username, stub.object({ scope }));
		expect(await mod.getScope(username, token)).toEqual(scope);
	});

	test('revokeClient', async () => {
		const username = stub.random();
		const client_id = stub.random();
		await mod.createToken(username, stub.object({ client_id }));
		const token = await mod.createToken(username, stub.object({ client_id: stub.random() }));
		expect(await mod.revokeClient(username, client_id)).toEqual([
			undefined,
		]);
		expect(await mod.authorizations(username)).toMatchObject([{
			token,
		}]);
	});

	test('revokeAll', async () => {
		const username = stub.random();
		await mod.createToken(username, stub.object());
		await mod.createToken(username, stub.object());
		expect(await mod.revokeAll(username)).toEqual([
			undefined,
			undefined,
		]);
		expect(await mod.authorizations(username)).toMatchObject([]);
	});

});
