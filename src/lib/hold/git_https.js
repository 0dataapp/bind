import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/git_https');
import util from './util.js';

import { simpleGit, CleanOptions } from 'simple-git';

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

	folder,

	util: {

		_gitTreePath: e => ('./' + path.join('./', e.replace(/(.)\/$/, '$1'))).replace('././', './'),

		_clonePath: id => path.join(mod.folder, util.hash(id)),

	},

	git (path) {
		const repo = simpleGit(path, {
			maxConcurrentProcesses: 10,
			trimmed: true,
			config: [
				`user.name=${ env.GIT_CONFIG_NAME || 'Unknown' }`,
				`user.email=${ env.GIT_CONFIG_EMAIL || 'noreply@example.com' }`,
			],
		});

		return {

			repo,

			_init: () => repo.init(),

			commit: direct => {
				if (direct)
					return repo.add('./*').commit('sync');

				debounce(`commit-${ path }`, () => {
					repo.add('./*').commit('sync');

					debounce(`push-${ path }`, async () => {
						try {
							return await repo.push('origin');
						} catch (error) {
							console.error(path, error.message);
						}
					});
				});
			},

		};
	},

	filesystem: cloneURL => !cloneURL ? (function () { throw new Error('url blank') })() : {

		_localPath: e => path.join(mod.util._clonePath(cloneURL), e),
		
		async put ({ target, data, meta }) {
			const _target = this._localPath(target);

			fs.mkdirSync(path.dirname(_target), { recursive: true });

			fs.writeFileSync(_target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			await mod.git(mod.util._clonePath(cloneURL)).commit(target.startsWith('/api-test-suite/') ? true : undefined);

			Object.assign(meta, await this.meta({
				target,
			}));
		},

		get ({ target, contentType }) {
			return fs.readFileSync(this._localPath(target), util.encoding(contentType));
		},

		async meta ({ target }) {
			const _target = this._localPath(target);
			const stat = fs.statSync(_target);
			const isFolder = stat.isDirectory();

			const meta = {
				ETag: isFolder
					// ? (await mod.git(mod.util._clonePath(cloneURL)).repo.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', mod.util._gitPath(isFolder ? target.replace(/\/$/, '') : target)))).trim().split('\n').pop()
					? (
						await mod.git(mod.util._clonePath(cloneURL)).repo.raw(...['show-ref'])
						? (await mod.git(mod.util._clonePath(cloneURL)).repo.raw(...['ls-tree', '--object-only', '-d', 'HEAD', mod.util._gitTreePath(target)])).trim().split('\n').pop()
						: 'empty'
						)
					: stat.mtime.toJSON(),
			};

			if (isFolder)
				return meta;

			return Object.assign(meta, {
				'Content-Length': stat.size,
				'Content-Type': await util._guessType(fs.readFileSync(_target), _target),
				'Last-Modified': stat.mtime.toUTCString(),
			});
		},

		async remove ({ target, breadcrumbs }) {
			fs.unlinkSync(this._localPath(target));

			breadcrumbs.slice().sort().reverse().forEach(e => {
				e = this._localPath(e);

				if (fs.readdirSync(e).filter(e => !util.isJunk(e)).length)
					return;

				fs.rmSync(e, { recursive: true, force: true })
			});

			await mod.git(mod.util._clonePath(cloneURL)).commit(target.startsWith('/api-test-suite/') ? true : undefined);
		},

		async list ({ target }) {
			const tree = (await mod.git(mod.util._clonePath(cloneURL)).repo.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', `.${ target }`)).trim();

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
				const basename = e.name.match(new RegExp(`^${ target.slice(1) }(.*)`)).pop();
				return [
					basename,
					e.type === 'tree'
					? { ETag: e.hash }
					: await this.meta({
						target: path.join(target, basename),
					}),
				];
			})).then(Object.fromEntries);
		},

		exists ({ target }) {
			return fs.existsSync(this._localPath(target));
		},

		isFolder ({ target }) {
			return fs.statSync(this._localPath(target)).isDirectory();
		},

		erase: () => fs.rmSync(mod.util._clonePath(cloneURL), { recursive: true, force: true }),

	},

	sync: {

		pull () {
			if (!fs.existsSync(folder))
				return;
			
			fs.readdirSync(folder).map(e => path.join(folder, e)).filter(e => fs.statSync(e).isDirectory()).forEach(e => {
				q._pushAuto(async () => {
					try {
						return await mod.git(e).repo.pull('origin');
					} catch (error) {
						console.error(e, error.message);
					}
				});
			});
		},

	},

	hold: {

		startup () {
			setInterval(mod.sync.pull, pollSeconds * 1000);
		},

		prepare (id, url) {
			q._pushAuto(async () => {
				const target = mod.util._clonePath(id);

				if (!fs.existsSync(target))
					await simpleGit().clone(url, target);
			});
		},
		
	},

};

export default mod;
