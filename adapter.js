import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const _storage = path.join(__dirname, 'data');

import { simpleGit, CleanOptions } from 'simple-git';
const git = simpleGit(_storage, {
	maxConcurrentProcesses: 10,
	trimmed: true,
}).clean(CleanOptions.FORCE);

// await git.pull('origin');

import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

const mod = {

	_resolvePath: (handle, url) => path.join(__dirname, '__storage', handle, url),

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

  permissions (handle, token) {
	  const user = mod._readJson(mod._resolvePath(handle, 'auth.json'));
	  if (!user)
	  	return {};

	  const data = user.sessions;
	  if (!data || !data[token])
	  	return {};

	  const permissions = data[token].permissions;
	  if (!permissions)
	  	return {};
	  
	  const output = {};

	  for (const category in permissions) {
	    output[category] = Object.keys(permissions[category]).sort();
	  }

	  return output;
	},

	dataPath: (handle, url) => path.join(_storage, url),
	gitPath: _url => `.${ _url }`,
	
	fakeJSON (e) {
		if (!['{', '['].includes(e.trim()[0]))
			return false;

		try {
			return JSON.parse(e);
		} catch (e) {
			return false
		}
	},

	async guessMimeType (data) {
		const mime = await fileTypeFromBuffer(data);
		if (mime)
			return mime.mime;
		
		return mod.fakeJSON(data.toString()) ? 'application/json' : 'text/plain';
	},

	meta: async (handle, _url) => {
		const target = mod.dataPath(handle, _url);

		if (!fs.existsSync(target))
			return {};

		const isFolder = fs.statSync(target).isDirectory();

		const meta = {
			ETag: await mod.etag(_url, isFolder),
		};

		if (isFolder)
			return meta;

		return Object.assign(meta, {
			'Content-Length': fs.statSync(target).size,
			'Content-Type': await mod.guessMimeType(fs.readFileSync(target)),
		});
	},

	etag: async (_url, isFolder) => (await git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod.gitPath(_url)))).trim().split('\n').shift(),

	async put (handle, _url, data, _folders, meta) {
		const target = mod.dataPath(handle, _url);

		fs.mkdirSync(path.dirname(target), { recursive: true });

		fs.writeFileSync(target, meta['Content-Type'] === 'application/json' ? JSON.stringify(data) : data);
		
		await git.add('./*')
			.commit('sync')
			// .push('origin');

		meta.ETag = (await mod.etag(_url, false));
	},

	delete (target, _folders) {
		return git.add('./*')
			.commit('sync')
			// .push('origin');
	},

	async folderItems (target, gitPath, _url) {
		const tree = (await git.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', gitPath)).trim();

		return !tree.length ? {} : tree.split('\n').map(e => {
			const [type, hash, size, path] = e.split(/\s+/);
			return {
				name: type === 'tree' ? `${ path }/` : path,
				type,
				hash,
				size: size === '-' ? null : parseInt(size),
			};
		}).reduce((coll, item) => {
			coll[item.name.match(new RegExp(`^${ _url.slice(1) }(.*)`)).pop()] = Object.assign(item.type === 'tree' ? {} : {
				'Content-Length': item.size,
				'Content-Type': mime.getType(path.join(_url, item.name)) || 'application/json',
			}, {
				ETag: item.hash,
			});

			return coll;
		}, {});
	},

};

export default mod;
