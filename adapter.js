import fs from 'fs';
import path from 'path';

const _storage = path.join(process.env.DATA_DIRECTORY || process.cwd(), '__storage');

import { simpleGit, CleanOptions } from 'simple-git';

import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
  	var context = this, args = arguments;
  	clearTimeout(timeout);
  	if (immediate && !timeout) func.apply(context, args);
  	timeout = setTimeout(function() {
  		timeout = null;
  		if (!immediate) func.apply(context, args);
  	}, wait);
  };
};

const mod = {

	_resolvePath: (handle, url) => path.join(_storage, handle, url),

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

  dataPath: (handle, url) => path.join(_storage, url),
	_gitPath: _url => `.${ _url }`,
	
	_fakeJSON (e) {
		if (!['{', '['].includes(e.trim()[0]))
			return false;

		try {
			return JSON.parse(e);
		} catch (e) {
			return false
		}
	},

	async _guessMimeType (data) {
		const mime = await fileTypeFromBuffer(data);
		if (mime)
			return mime.mime;
		
		return mod._fakeJSON(data.toString()) ? 'application/json' : 'text/plain';
	},

	async meta (handle, _url) {
		const target = mod.dataPath(handle, _url);

		if (!fs.existsSync(target))
			return {};

		const isFolder = fs.statSync(target).isDirectory();

		const meta = {
			ETag: await mod._etag(_url, isFolder),
		};

		if (isFolder)
			return meta;

		const stat = fs.statSync(target);
		return Object.assign(meta, {
			'Content-Length': stat.size,
			'Content-Type': await mod._guessMimeType(fs.readFileSync(target)),
			'Last-Modified': stat.mtime.toUTCString(),
		});
	},

	_etag: async (_url, isFolder) => `"${ (await mod.git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod._gitPath(_url)))).trim().split('\n').shift() }"`,

	async put (handle, _url, data, ancestors, meta) {
		const target = mod.dataPath(handle, _url);

		fs.mkdirSync(path.dirname(target), { recursive: true });

		fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : data);
		
		
		await mod.gitCommit();

		meta.ETag = await mod._etag(_url, false);
	},

	async delete (target, ancestors) {
		fs.unlinkSync(target);
		
		return mod.gitCommit();
	},

	async folderItems (handle, _url) {
		const target = mod.dataPath(handle, _url);

		const tree = (await mod.git.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', mod._gitPath(_url))).trim();

		return !tree.length ? {} : tree.split('\n').map(e => {
			const [type, hash, size, path] = e.split(/\s+/);
			return {
				name: type === 'tree' ? `${ path }/` : path,
				type,
				hash,
				size: size === '-' ? null : parseInt(size),
			};
		}).reduce((coll, item) => {
			const _path = path.join(_url, item.name);
			coll[item.name.match(new RegExp(`^${ _url.slice(1) }(.*)`)).pop()] = Object.assign(item.type === 'tree' ? {} : {
				'Content-Length': item.size,
				'Content-Type': mime.getType(_path) || 'application/json',
				'Last-Modified': fs.statSync(mod.dataPath(handle, _url)).mtime.toUTCString(),
			}, {
				ETag: item.hash,
			});

			return coll;
		}, {});
	},

	gitPull: () => mod.git.pull('origin'),
	gitPush: debounce(() => mod.git.push('origin'), 5000),
	async gitCommit () {
		await mod.git.add('./*').commit('sync');
		
		mod.gitPush();
		
		return
	},

	async setupEverything () {
		if (!fs.existsSync(_storage))
			await simpleGit().clone(process.env.GIT_REMOTE, _storage);

		mod.git = simpleGit(_storage, {
			maxConcurrentProcesses: 10,
			trimmed: true,
		}).clean(CleanOptions.FORCE);

		mod.gitPull();

		setInterval(mod.gitPull, 10000);

		mod.git.addConfig('user.name', process.env.GIT_CONFIG_NAME || 'me');
		mod.git.addConfig('user.email', process.env.GIT_CONFIG_EMAIL || 'me@example.com');
	},

};

mod.setupEverything();

export default mod;
