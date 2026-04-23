import { describe, test, expect } from 'vitest';
import mod from '$lib/glue.js';
import { options } from '$lib/hold/options.js';

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
import { vi } from 'vitest';
for (const e in options) {
	if (![
		'local_disk',
		// 'git_https',
	].includes(e))
		continue

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

			getFS () {
				if (e === 'git_https') {
					const cloneURL = 'testing-repo';

					const mod = Object.assign(options.git_https, {
						folder: join(process.cwd(), '__testing/glue/git_https'),
					});

					// mod.util._reset(mod.util._clonePath(cloneURL));

					return mod.filesystem(cloneURL);
				}

				return Object.assign(options.local_disk, {
					folder: join(process.cwd(), '__testing/glue/local_disk'),
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
	}) });
}
