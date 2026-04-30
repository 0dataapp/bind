import { describe, test, expect } from 'vitest';
import mod from '$lib/glue.js';
import { options } from '$lib/hold/options.js';
import hold_util from '$lib/hold/util.js';

import { generate } from 'spec-check/generate.js';
import stub from 'spec-check/stub.js';
import util from 'spec-check/util.js';

const origin = stub.origin();
const handle = stub.tid();
const token_read_only = stub.tid();
const token_read_write = stub.tid();
const token_global = stub.tid();
const baseURL = `${ origin }/${ handle }`;
				
const State = stub.state({
	server: origin,
	origin,
	account_handle: handle,
	baseURL,

	token_read_only,
	token_read_write,
	token_global,

	spec_version: mod.remotestorage_spec_version,
});

State.storage = util.storage(Object.assign(util.clone(State), {
	token: State.token_read_write,
}));

import { join } from 'path';
import { vi, afterAll } from 'vitest';
for (const e in options) {
	if (![
		'local_disk',
		// 'git_https',
	].includes(e))
		continue

	let runs = 0;
	vi.spyOn(util, '_fetch').mockImplementation((url, params) => mod.vitest({
		middleware: mod.remotestorage({
			getScope (username, token) {
				if (username !== handle)
					return null;

				if (token === token_global)
					return '*:rw';

				if (token === token_read_write)
					return `${ State.scope }:rw`;

				if (token === token_read_only)
					return `${ State.scope }:r`;
			},

			async getFS () {
				const root = join(process.cwd(), '__testing/glue/');

				if (e === 'git_https') {
					const localDir = join(root, 'git_https');
					const cloneURL = 'testing-repo';
					const repo = `${ localDir }/${ hold_util.hash(cloneURL) }`;

					const mod = options.git_https;

					if (!runs) {
						await mod.util._reset(repo);
						runs += 1;
					}

					return mod.filesystem({
						localDir,
						cloneURL,
					});
				}

				return Object.assign(options.local_disk, {
					folder: join(root, 'local_disk'),
				}).filesystem(handle);
			},
		}),
		url: url.split(origin + '').pop(),
		method: params.method || 'GET',
		headers: Object.assign(params.headers, { origin }),
		body: params.body,
	}));

	describe(`spec-check ${ e }`, () => { generate({
		describe,
		it: test,
		expect,
		State,
		after: afterAll,
	}) });
}
