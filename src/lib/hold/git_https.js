import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/git_https');
import util from '$lib/util';

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

const debounceSeconds = 1.5;
let timeout;
const debounce = cb => {
	const context = this;
	clearTimeout(timeout);
	timeout = setTimeout(function() {
		timeout = null;
		cb.apply(context);
	}, debounceSeconds * 1000);
};

const mod = {

	util: {

		_gitPath: _url => `.${ _url }`,

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

			async commit () {
				repo.addConfig('user.name', env.GIT_CONFIG_NAME || 'me');
				repo.addConfig('user.email', env.GIT_CONFIG_EMAIL || 'me@example.com');

				await repo.add('./*').commit('sync');
				
				debounce(() => repo.push('origin'));
				debounce(() => repo.push('origin'));
				debounce(() => repo.push('origin'));
			},

		};
	},

	middleware: cloneURL => ({

		dataPath: (handle, url) => path.join(mod.util._clonePath(cloneURL), url),
		
		async meta (handle, _url) {
			const _etag = async (_url, isFolder) => (await mod.git(mod.util._clonePath(cloneURL)).repo.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod.util._gitPath(isFolder ? _url.replace(/\/$/, '') : _url)))).trim().split('\n').pop();

			async function guessType (data, _path) {
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
				
				return mime.getType(_path) || 'text/plain';
			};
			
			const target = this.dataPath(handle, _url);

			if (!fs.existsSync(target))
				return {};

			const isFolder = fs.statSync(target).isDirectory();

			const meta = {
				ETag: await _etag(_url, isFolder),
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

		async put ({ handle, _url, data, ancestors, meta }) {
			const target = this.dataPath(handle, _url);

			fs.mkdirSync(path.dirname(target), { recursive: true });

			fs.writeFileSync(target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			await mod.git(mod.util._clonePath(cloneURL)).commit();

			Object.assign(meta, await this.meta(handle, _url));
		},

		async delete (target, ancestors) {
			fs.unlinkSync(target);

			ancestors.filter(e => !fs.readdirSync(e).filter(e => !mod.util._isIgnored(e)).length).forEach(e => fs.rmdirSync(e));
			
			await mod.git(mod.util._clonePath(cloneURL)).commit();
		},

		async folderItems (handle, _url) {
			const target = this.dataPath(handle, _url);
			const _this = this;

			const tree = (await mod.git(mod.util._clonePath(cloneURL)).repo.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', mod.util._gitPath(_url))).trim();

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
					'Last-Modified': fs.statSync(_this.dataPath(handle, _url)).mtime.toUTCString(),
				}, {
					ETag: item.hash,
				});

				return coll;
			}, {});
		},

	}),

	sync: {

		pull () {
			if (!fs.existsSync(folder))
				return;
			
			fs.readdirSync(folder).map(e => path.join(folder, e)).filter(e => fs.statSync(e).isDirectory()).forEach(e => {
				q._pushAuto(() => {
					const repo = mod.git(e).repo;

					repo.pull('origin');
				});
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
