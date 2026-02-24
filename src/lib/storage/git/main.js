import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__storage/git');

import crypto from 'crypto'

import { simpleGit, CleanOptions } from 'simple-git';

import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

const debounceSeconds = 1.5;
const pollSeconds = 5;

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

	_resolvePath: (handle, url) => path.join(mod._storage, handle, url),

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

  dataPath: (handle, url) => path.join(mod._storage, url),
	_gitPath: _url => `.${ _url }`,
	_isIgnored: e => [
		'.DS_Store',
	].includes(path.basename(e)),
	
	_fakeJSON (e) {
		if (!['{', '['].includes(e.trim()[0]))
			return false;

		try {
			return JSON.parse(e);
		} catch (e) {
			return false
		}
	},

	_fakeHTML: e => e.startsWith('<!DOCTYPE html>'),

	async _guessMimeType (data, _path) {
		const type = await fileTypeFromBuffer(data);
		if (type)
			return type.mime;

		const string = data.toString();

		if (mod._fakeJSON(string))
			return 'application/json';
		
		if (mod._fakeHTML(string))
			return 'text/html';
		
		return mime.getType(_path) || 'text/plain';
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
			'Content-Type': await mod._guessMimeType(fs.readFileSync(target), target),
			'Last-Modified': stat.mtime.toUTCString(),
		});
	},

	_etag: async (_url, isFolder) => (await mod.git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod._gitPath(isFolder ? _url.replace(/\/$/, '') : _url)))).trim().split('\n').pop(),

	async put (handle, _url, data, ancestors, meta) {
		const target = mod.dataPath(handle, _url);

		fs.mkdirSync(path.dirname(target), { recursive: true });

		fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));
		
		await mod.gitCommit();

		Object.assign(meta, await mod.meta(handle, _url));
	},

	async delete (target, ancestors) {
		fs.unlinkSync(target);

		ancestors.filter(e => !fs.readdirSync(e).filter(e => !mod._isIgnored(e)).length).forEach(e => fs.rmdirSync(e));
		
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
	gitPush: debounce(() => mod.git.push('origin'), debounceSeconds * 1000),
	async gitCommit () {
		await mod.git.add('./*').commit('sync');
		
		mod.gitPush();
		
		return
	},

	async setupEverything () {
		mod._storage = path.join(folder, crypto.createHash('sha256').update(env.GIT_REMOTE).digest('hex').substring(0, 8));

		if (!fs.existsSync(mod._storage))
			await simpleGit().clone(env.GIT_REMOTE, mod._storage);

		mod.git = simpleGit(mod._storage, {
			maxConcurrentProcesses: 10,
			trimmed: true,
		}).clean(CleanOptions.FORCE);

		mod.gitPull();

		setInterval(mod.gitPull, pollSeconds * 1000);

		mod.git.addConfig('user.name', env.GIT_CONFIG_NAME || 'me');
		mod.git.addConfig('user.email', env.GIT_CONFIG_EMAIL || 'me@example.com');
	},

};

export default mod;
