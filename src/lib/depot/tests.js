import { describe, test, expect } from 'vitest';
import mod from '../depot.js';
import auth from './auth.js';

describe('maxSize', () => {

	test('output', () => {
		expect(mod.maxSize()).toEqual(`${ mod._maxBytes / 1000 }MB`);
	});

});

import { afterAll, vi } from 'vitest';
import db from '$lib/database.js';
import stub from '$lib/stub.js';

import { fileURLToPath } from 'url';
import path from 'path';
const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '__testing');
const datasource = db.collection('datasource', { folder });
const account = db.collection('account', { folder });

import fs from 'fs';
describe('oauth-implicit', () => {

	afterAll(() => {
		fs.rmSync(folder, { recursive: true, force: true });
	});

	test('_datasource', async () => {
		const id = stub.random();
		vi.spyOn(db, 'collection').mockReturnValue(datasource);
		const created = await datasource.hydrating.create({ id });
		expect(await auth._datasource(id)).toEqual(created);
	});

	test('_account', async () => {
		const id = stub.random();
		vi.spyOn(db, 'collection').mockReturnValue(account);
		const created = await account.hydrating.create({ id });
		expect(await auth._account(id)).toEqual(created);
	});

	test('refs', async () => {
		const id = stub.random();
		const accountId = stub.random();
		vi.spyOn(db, 'collection').mockImplementation(name => ({
			datasource,
			account,
		}[name]));

		const source = await datasource.hydrating.create({ id, accountId });
		const _account = await account.hydrating.create({ id: accountId });
		expect(await auth.refs(id)).toEqual({
			source,
			account: _account,
		});
	});

});
