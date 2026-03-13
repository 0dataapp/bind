import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/git_https');
import util from './util.js';

import { simpleGit, CleanOptions } from 'simple-git';

import { fileTypeFromBuffer } from 'file-type';
import mime from 'mime';

const pollSeconds = 5;

import Queue from 'queue';
const q = Object.assign(new Queue({
	autostart: true,
	concurrency: 5,
}), {
	// https://github.com/jessetane/queue
	// "jobs can accept a callback or return a promise"
	_pushAuto: job => Promise.resolve(job()),
});

const debounceMilliseconds = 1500;
import pDebounce from 'p-debounce';
const _debounceMap = {};
const debounce = (id, cb) => (_debounceMap[id] = _debounceMap[id] || pDebounce(() => {
	cb()
	delete _debounceMap[id];
}, debounceMilliseconds))();

const mod = {

	util: {

		_gitPath: _path => `.${ _path }`,

		_isIgnored: e => [
			'.DS_Store',
		].includes(path.basename(e)),

		_clonePath: id => path.join(folder, util.hash(id)),

	},

	git (path) {
		const repo = simpleGit(path, {
			maxConcurrentProcesses: 10,
			trimmed: true,
		});

		return {

			repo,

			commit () {
				repo.addConfig('user.name', env.GIT_CONFIG_NAME || 'Unknown');
				repo.addConfig('user.email', env.GIT_CONFIG_EMAIL || 'noreply@example.com');

				debounce(`commit-${ path }`, () => {
					repo.add('./*').commit('sync');

					debounce(`push-${ path }`, () => repo.push('origin'));
				});
			},

		};
	},

	middleware: cloneURL => ({

		target: {

			localPath: _path => path.join(mod.util._clonePath(cloneURL), _path),
			exists ({ target }) {
				return fs.existsSync(this.localPath(target));
			},
			isFolder ({ target }) {
				return fs.statSync(this.localPath(target)).isDirectory();
			},
			read ({ target, contentType }) {
				return fs.readFileSync(this.localPath(target), contentType.startsWith('application/json') ? 'utf8' : undefined);
			},

		},
		
		dataPath: (handle, url) => path.join(mod.util._clonePath(cloneURL), url),
		
		async meta ({ handle, target: _path }) {
			const target = this.dataPath(handle, _path);

			async function _etag (_path, isFolder) {
				if (isFolder)
					return (await mod.git(mod.util._clonePath(cloneURL)).repo.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod.util._gitPath(isFolder ? _path.replace(/\/$/, '') : _path)))).trim().split('\n').pop();

				return fs.statSync(target).mtime.toUTCString();
			};

			async function guessType (data, __path) {
				function guessJSON (e) {
					if (!['{', '['].includes(e.trim()[0]))
						return false;

					try {
						return JSON.parse(e);
					} catch (e) {
						return false
					}
				};
				const guessHTML = e => e.startsWith('<!DOCTYPE html>');

				const type = await fileTypeFromBuffer(data);
				if (type)
					return type.mime;

				const string = data.toString();

				if (guessJSON(string))
					return 'application/json';
				
				if (guessHTML(string))
					return 'text/html';
				
				return mime.getType(__path) || 'text/plain';
			};
			
			if (!fs.existsSync(target))
				return {};

			const isFolder = fs.statSync(target).isDirectory();

			const meta = {
				ETag: await _etag(_path, isFolder),
			};

			if (isFolder)
				return meta;

			const stat = fs.statSync(target);
			return Object.assign(meta, {
				'Content-Length': stat.size,
				'Content-Type': await guessType(fs.readFileSync(target), target),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		},

		async put ({ handle, target: _path, data, ancestors, meta }) {
			const target = this.dataPath(handle, _path);

			fs.mkdirSync(path.dirname(target), { recursive: true });

			fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			await mod.git(mod.util._clonePath(cloneURL)).commit();

			Object.assign(meta, await this.meta({
				handle,
				target: _path,
			}));
		},

		async delete ({ handle, target: _path, ancestors }) {
			const target = this.dataPath(handle, _path);
			fs.unlinkSync(target);

			ancestors.filter(e => !fs.readdirSync(e).filter(e => !mod.util._isIgnored(e)).length).forEach(e => fs.rmdirSync(e));
			
			await mod.git(mod.util._clonePath(cloneURL)).commit();
		},

		async folderItems ({ handle, target: _path }) {
			const target = this.dataPath(handle, _path);
			const _this = this;

			const tree = (await mod.git(mod.util._clonePath(cloneURL)).repo.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', mod.util._gitPath(_path))).trim();

			if (!tree.length)
				return {};

			return Promise.all(tree.split('\n').map(e => {
				const [type, hash, size, path] = e.split(/\s+/);
				return {
					name: type === 'tree' ? `${ path }/` : path,
					type,
					hash,
					size: size === '-' ? null : parseInt(size),
				};
			}).map(async e => {
				const basename = e.name.match(new RegExp(`^${ _path.slice(1) }(.*)`)).pop();
				return [
					basename,
					e.type === 'tree'
					? { ETag: e.hash }
					: await _this.meta({
						handle,
						target: path.join(_path, basename),
					}),
				];
			})).then(Object.fromEntries);
		},

	}),

	sync: {

		pull () {
			if (!fs.existsSync(folder))
				return;
			
			fs.readdirSync(folder).map(e => path.join(folder, e)).filter(e => fs.statSync(e).isDirectory()).forEach(e => {
				q._pushAuto(() => mod.git(e).repo.pull('origin'));
			});
		},

	},

	hold: {

		startup () {
			setInterval(mod.sync.pull, pollSeconds * 1000);
		},

		erase: id => fs.rmSync(mod.util._clonePath(id), { recursive: true, force: true }),

		async _prepare (id, url) {
			const target = mod.util._clonePath(id);

			if (!fs.existsSync(target))
				await simpleGit().clone(url, target);
		},

		prepare (id, url) {
			q._pushAuto(() => mod.hold._prepare(...arguments));
		},
		
	},

};

export default mod;
