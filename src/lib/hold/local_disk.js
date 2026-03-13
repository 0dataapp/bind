import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metaSuffix = '.meta.json';

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/local_disk');

const mod = {

	folder,

	_isIgnored: e => e.endsWith(metaSuffix) || [
		'.DS_Store',
	].includes(path.basename(e)),

	filesystem: {

		_localPath: ({ handle, target }) => path.join(mod.folder, handle, target),
		_metaPath: target => `${ target }${ metaSuffix }`,
		_encoding: contentType => [
			'application/json',
			'text',
		].filter(e => contentType.startsWith(e)).length ? 'utf8' : undefined,
		_isJunk: e => [
			'.DS_Store',
		].includes(path.basename(e)),
		
		put ({ handle, target: _path, data, ancestors, meta }) {
			const target = this._localPath({
				handle,
				target: _path,
			});

			fs.mkdirSync(path.dirname(target), { recursive: true });
			ancestors.forEach(e => {
				const stat = fs.statSync(e);
				fs.writeFileSync(mod.middleware._metaPath(e), JSON.stringify({
					ETag: stat.mtime.toJSON(),
				}));
			});
			
			fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			const stat = fs.statSync(target);
			fs.writeFileSync(mod.middleware._metaPath(target), JSON.stringify(Object.assign(meta, {
				ETag: stat.mtime.toJSON(),
				'Content-Length': Buffer.isBuffer(data) ? data.length : stat.size,
			})));
		},

		delete ({ handle, target: _path, ancestors }) {
			const target = this._localPath({
				handle,
				target: _path,
			});
			fs.unlinkSync(target);
			fs.unlinkSync(this._metaPath(target));

			ancestors.slice().sort().reverse().forEach(e => {
				if (fs.readdirSync(e).filter(e => !mod.filesystem._isJunk(e) && (e !== metaSuffix)).length)
					return;

				fs.rmSync(e, { recursive: true, force: true })
			});

			ancestors.filter(e => fs.existsSync(e) && fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => fs.writeFileSync(this._metaPath(`${ e }/`), JSON.stringify({
				ETag: mod.middleware._etag(),
			})));
		},

	},
	
	middleware: {

		target: {

			localPath: ({ handle, target }) => path.join(folder, handle, target),
			exists (params) {
				return fs.existsSync(this.localPath(params));
			},
			isFolder (params) {
				return fs.statSync(this.localPath(params)).isDirectory();
			},
			read (params) {
				return fs.readFileSync(this.localPath(params), params.contentType.startsWith('application/json') ? 'utf8' : undefined);
			},

		},

		_resolvePath: (handle, url) => path.join(folder, handle, url),
		dataPath: (handle, url) => mod.middleware._resolvePath(handle, url),

		_metaPath: target => `${ target }${ metaSuffix }`,
		meta ({ handle, target: _path }) {
			const target = mod.middleware.dataPath(handle, _path);
			return fs.existsSync(target) ? JSON.parse(fs.readFileSync(mod.middleware._metaPath(target), 'utf8')) : {};
		},

		_etag: () => new Date().toJSON(),
		put ({ handle, target: _path, data, ancestors, meta }) {
			const target = mod.middleware.dataPath(handle, _path);

			fs.mkdirSync(path.dirname(target), { recursive: true });
			ancestors.forEach(e => fs.writeFileSync(mod.middleware._metaPath(`${ e }/`), JSON.stringify({
				ETag: mod.middleware._etag(),
			})));
			
			fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));
			fs.writeFileSync(mod.middleware._metaPath(target), JSON.stringify(Object.assign(meta, {
				ETag: mod.middleware._etag(),
				'Content-Length': Buffer.isBuffer(data) ? data.length : fs.statSync(target).size,
			})));
		},

		async delete ({ handle, target: _path, ancestors }) {
			const target = this.dataPath(handle, _path);
			fs.unlinkSync(target);
			fs.unlinkSync(mod.middleware._metaPath(target))

			ancestors.filter(e => !fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => {
				fs.unlinkSync(mod.middleware._metaPath(`${e}/`));
				fs.rmdirSync(e);
			});

			ancestors.filter(e => fs.existsSync(e) && fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => fs.writeFileSync(mod.middleware._metaPath(`${ e }/`), JSON.stringify({
				ETag: mod.middleware._etag(),
			})));
		},

		folderItems ({ handle, target: _path }) {
			const target = mod.middleware.dataPath(handle, _path);

			return fs.readdirSync(target).filter(e => !mod._isIgnored(e)).reduce((coll, item) => {
				let _path = path.join(target, item);

				if (fs.statSync(_path).isDirectory()) {
					item = `${ item }/`;
					_path = `${ _path }/`;
				}

				return Object.assign(coll, {
					[item]: JSON.parse(fs.readFileSync(mod.middleware._metaPath(_path), 'utf8')),
				});
			}, {});
		},

	},

	hold: {

		startup () {},
		
		erase: handle => fs.rmSync(mod.middleware.dataPath(handle, '/'), { recursive: true, force: true }),

	},
	
};

export default mod;
