import fs from 'fs';
import path from 'path';
import util from './util.js';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metaSuffix = '.meta.json';

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/local_disk');

const mod = {

	folder,

	util: {

		isIgnored: e => util.isJunk(e) || e.endsWith(metaSuffix),

	},

	filesystem: handle => !handle ? (function () { throw new Error('username blank') })() : {

		_metaPath: target => `${ target }${ metaSuffix }`,
		_localPath: target => path.join(mod.folder, handle, target),
		
		put ({ target, data, breadcrumbs, meta }) {
			const _target = this._localPath(target);

			fs.mkdirSync(path.dirname(_target), { recursive: true });
			
			fs.writeFileSync(_target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			const stat = fs.statSync(_target);
			fs.writeFileSync(this._metaPath(_target), JSON.stringify(Object.assign(meta, {
				ETag: stat.mtime.toJSON(),
				'Content-Length': Buffer.isBuffer(data) ? data.length : stat.size,
				'Last-Modified': stat.mtime.toUTCString(),
			})));

			breadcrumbs.forEach(e => {
				fs.writeFileSync(this._metaPath(this._localPath(e) + '/'), JSON.stringify({
					ETag: stat.mtime.toJSON(),
				}));
			});
		},

		get ({ target, contentType }) {
			return fs.readFileSync(this._localPath(target), util.encoding(contentType));
		},

		meta ({ target }) {
			const _target = this._metaPath(this._localPath(target));

			if (!fs.existsSync(_target))
				return null;
			
			
			return JSON.parse(fs.readFileSync(_target, 'utf8'));
		},

		remove ({ target, breadcrumbs }) {
			const _target = this._localPath(target);
			fs.unlinkSync(_target);
			fs.unlinkSync(this._metaPath(_target));

			breadcrumbs.slice().sort().reverse().forEach(e => {
				e = this._localPath(e);

				if (fs.readdirSync(e).filter(e => !mod.util.isIgnored(e)).length)
					return;

				fs.rmSync(e, { recursive: true, force: true });
			});

			breadcrumbs.map(e => this._localPath(e)).filter(e => fs.existsSync(e) && fs.readdirSync(e).filter(e => !mod.util.isIgnored(e)).length).forEach(e => fs.writeFileSync(this._metaPath(`${ e }/`), JSON.stringify({
				ETag: new Date().toJSON() + Math.random().toString(),
			})));
		},

		list ({ target }) {
			const _target = this._localPath(target);

			return fs.readdirSync(_target).filter(e => !mod.util.isIgnored(e)).reduce((coll, item) => {
				let e = path.join(_target, item);

				if (fs.statSync(e).isDirectory()) {
					item += '/';
					e += '/';
				}

				return Object.assign(coll, {
					[item]: JSON.parse(fs.readFileSync(this._metaPath(e), 'utf8')),
				});
			}, {});
		},

		exists ({ target }) {
			// this currently fails the 409 test where 'target file path is an existing folder' because breadcrumbs are passed without a trailing slash, which creates the wrong _metaPath. not sure yet where is the most sensible place to ensure trailing slashes as we assume most folder request should have trailing slashes.
			const _target = this._localPath(target);
			return fs.existsSync(_target) && fs.existsSync(this._metaPath(_target));
		},

		isFolder ({ target }) {
			return fs.statSync(this._localPath(target)).isDirectory();
		},

		erase (handle) {
			return fs.rmSync(this._localPath('/'), { recursive: true, force: true });
		},

	},
	
};

export default mod;
