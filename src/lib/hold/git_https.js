import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { env } from '$env/dynamic/private';
const folder = path.join(env.DATA_DIRECTORY || __dirname, '__hold/git_https');
import util from './util.js';

import { simpleGit } from 'simple-git';

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

		_gitTreePath: e => ('./' + path.join('./', e.replace(/(.)\/$/, '$1'))).replace('././', './'),
		
		_isTestPath: e => e.match('/api-test-suite'),

		_reset (path) {
			fs.rmSync(path, { recursive: true, force: true });

			fs.mkdirSync(path, { recursive: true });

			return mod.git(path).repo.init();
		},

	},

	git (path) {
		const repo = simpleGit(path, {
			baseDir: path,
			maxConcurrentProcesses: 10,
			trimmed: true,
			config: [
				`user.name=${ env.GIT_CONFIG_NAME || 'Unknown' }`,
				`user.email=${ env.GIT_CONFIG_EMAIL || 'noreply@example.com' }`,
			],
		});

		return {

			repo,

			_commit: () => repo.add('./*').commit('sync'),

			commit (direct) {
				if (direct)
					return this._commit();

				debounce(`commit-${ path }`, () => {
					this._commit();

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

	filesystem: ({ localDir, cloneURL, direct }) => !cloneURL ? (function () { throw new Error('url blank') })() : {

		_clonePath: path.join(localDir || folder, util.hash(cloneURL)),

		_localPath (e) {
			return path.join(this._clonePath, e);
		},
		
		async put ({ target, data, meta }) {
			const _target = this._localPath(target);

			fs.mkdirSync(path.dirname(_target), { recursive: true });

			fs.writeFileSync(_target, meta['Content-Type'].startsWith('application/json') ? JSON.stringify(data) : Buffer.from(data));

			await mod.git(this._clonePath).commit(direct || mod.util._isTestPath(target));

			Object.assign(meta, await this.meta({
				target,
			}));
		},

		get ({ target, contentType }) {
			return fs.readFileSync(this._localPath(target), util.encoding(contentType));
		},

		async meta ({ target }) {
			const _target = this._localPath(target);
			
			if (!fs.existsSync(_target))
				return null;
			
			const stat = fs.statSync(_target);
			const isFolder = stat.isDirectory();

			const { repo } = mod.git(this._clonePath);

			const meta = {
				ETag: isFolder
					// ? (await repo.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', this._gitPath(isFolder ? target.replace(/\/$/, '') : target)))).trim().split('\n').pop()
					? (
						await repo.raw('show-ref')
						? (await repo.raw(...['ls-tree', '--object-only', '-d', 'HEAD', mod.util._gitTreePath(target)])).trim().split('\n').pop()
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

			await mod.git(this._clonePath).commit(direct || mod.util._isTestPath(target));
		},

		async list ({ target }) {
			const { repo } = mod.git(this._clonePath);
			const tree = (await repo.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', `.${ target }`)).trim();

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

		erase () {
			return fs.rmSync(this._clonePath, { recursive: true, force: true })
		},

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

	task: {

		startup () {
			setInterval(mod.sync.pull, pollSeconds * 1000);
		},

		prepare (id, url) {
			q._pushAuto(async () => {
				const target = this._clonePath(id);

				if (!fs.existsSync(target))
					await simpleGit({
						baseDir: target,
					}).clone(url, target);
			});
		},
		
	},

};

export default mod;
