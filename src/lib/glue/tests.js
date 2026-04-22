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
const testFolder = './__testing/local_disk/';
				
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

import { vi } from 'vitest';
for (const prop in options) {
	if (prop !== 'local_disk')
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

			getFS ({ handle, token }) {
				options.local_disk.folder = testFolder;

				return options.local_disk.filesystem(handle);
			},
		}),
		url: url.split(origin + '').pop(),
		method: params.method || 'GET',
		headers: Object.assign(params.headers, { origin }),
		body: params.body,
	}));

	describe(`spec-check ${ prop }`, () => { generate({
		describe,
		it: test,
		expect,
		State,
	}) });
}
