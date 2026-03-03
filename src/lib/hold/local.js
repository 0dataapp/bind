import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metaSuffix = '.meta.json';

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/local');

const mod = {

	_resolvePath: (handle, url) => path.join(folder, handle, url),

	_readJson (path) {
    try {
      const content = fs.readFileSync(path);
      return content ? JSON.parse(content) : null;
    } catch (e) {
      if (e.code !== 'ENOENT')
      	console.error('reading JSON failed:', e);

      return null;
    }
  },

  _metaPath: target => `${ target }${ metaSuffix }`,
	_isIgnored: e => e.endsWith(metaSuffix) || [
		'.DS_Store',
	].includes(path.basename(e)),

	_etag: () => new Date().toJSON(),

	middleware: {

		dataPath: (handle, url) => mod._resolvePath(handle, url),

		meta (handle, _url) {
			const target = mod.dataPath(handle, _url);
			return fs.existsSync(target) ? JSON.parse(fs.readFileSync(mod._metaPath(target), 'utf8')) : {};
		},

		put (handle, _url, data, ancestors, meta) {
			const target = mod.dataPath(handle, _url);

			fs.mkdirSync(path.dirname(target), { recursive: true });
			ancestors.forEach(e => fs.writeFileSync(mod._metaPath(`${ e }/`), JSON.stringify({
				ETag: mod._etag(),
			})));
			
			fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));
			fs.writeFileSync(mod._metaPath(target), JSON.stringify(Object.assign(meta, {
				ETag: mod._etag(),
				'Content-Length': Buffer.isBuffer(data) ? data.length : fs.statSync(target).size,
			})));
		},

		delete (target, ancestors) {
			fs.unlinkSync(target);
			fs.unlinkSync(mod._metaPath(target))

			ancestors.filter(e => !fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => {
				fs.unlinkSync(mod._metaPath(`${e}/`));
				fs.rmdirSync(e);
			});

			ancestors.filter(e => fs.existsSync(e) && fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => fs.writeFileSync(mod._metaPath(`${ e }/`), JSON.stringify({
				ETag: mod._etag(),
			})));
		},

		folderItems (handle, _url) {
			const target = mod.dataPath(handle, _url);

			return fs.readdirSync(target).filter(e => !mod._isIgnored(e)).reduce((coll, item) => {
				let _path = path.join(target, item);

				if (fs.statSync(_path).isDirectory()) {
					item = `${ item }/`;
					_path = `${ _path }/`;
				}

				return Object.assign(coll, {
					[item]: JSON.parse(fs.readFileSync(mod._metaPath(_path), 'utf8')),
				});
			}, {});
		},

	},

	hold: {
		
		erase: handle => fs.rmSync(mod.dataPath(handle, '/'), { recursive: true, force: true }),

	},
	
};

export default mod;
