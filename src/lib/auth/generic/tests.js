import { describe, test, expect, afterAll } from 'vitest';
import { _jsonQParams, _filterItems, _adapterMethods } from '../generic.js';
import database from '$lib/database/main.js';
import fs from 'fs';
import path from 'path';

// https://github.com/LightInn/pocketbase-better-auth/blob/main/src/index.ts

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _DATA_DIRECTORY = path.join(__dirname, '../../../__testing');
const folder = path.join(_DATA_DIRECTORY, database._subdirectory());

const uItem = params => Object.assign({
	id: Math.random().toString(),
}, params || {});

describe('_jsonQParams', () => {

	test('empty', () => {
		expect(_jsonQParams()).toEqual([]);
		expect(_jsonQParams([])).toEqual([]);
	});

	test('eq', () => {
		expect(_jsonQParams([{ field: 'email', operator: 'eq', value: 'test@example.com' }])).toEqual([['email', 'eq', 'test@example.com']]);
	});

	test('ne', () => {
		expect(_jsonQParams([{ field: 'status', operator: 'ne', value: 'active' }])).toEqual([['status', 'neq', 'active']]);
	});

	test('in', () => {
		expect(_jsonQParams([{ field: 'id', operator: 'in', value: ['1', '2', '3'] }])).toEqual([['id', 'in', ['1', '2', '3']]]);
	});

	test('contains', () => {
		expect(_jsonQParams([{ field: 'name', operator: 'contains', value: 'john' }])).toEqual([['name', 'contains', 'john']]);
	});

	test('starts_with', () => {
		expect(_jsonQParams([{ field: 'email', operator: 'starts_with', value: 'admin' }])).toEqual([['email', 'startswith', 'admin']]);
	});

	test('ends_with', () => {
		expect(_jsonQParams([{ field: 'email', operator: 'ends_with', value: '@example.com' }])).toEqual([['email', 'endswith', '@example.com']]);
	});

	test('gt', () => {
		expect(_jsonQParams([{ field: 'age', operator: 'gt', value: 18 }])).toEqual([['age', 'gt', 18]]);
	});

	test('gte', () => {
		expect(_jsonQParams([{ field: 'score', operator: 'gte', value: 100 }])).toEqual([['score', 'gte', 100]]);
	});

	test('lt', () => {
		expect(_jsonQParams([{ field: 'price', operator: 'lt', value: 50 }])).toEqual([['price', 'lt', 50]]);
	});

	test('lte', () => {
		expect(_jsonQParams([{ field: 'quantity', operator: 'lte', value: 10 }])).toEqual([['quantity', 'lte', 10]]);
	});

	test('conditions', () => {
		expect(_jsonQParams([
			{ field: 'status', operator: 'eq', value: 'active' },
			{ field: 'age', operator: 'gte', value: 18 },
		])).toEqual([
			['status', 'eq', 'active'],
			['age', 'gte', 18],
		]);
	});

	test('numeric values', () => {
		expect(_jsonQParams([{ field: 'count', operator: 'eq', value: 42 }])).toEqual([['count', 'eq', 42]]);
	});

	test('operator unknown', () => {
		const operator = Math.random().toString();
		const clause = {
			field: Math.random().toString(),
			operator,
			value: Math.random().toString(),
		};
		expect(() => _jsonQParams([clause])).toThrowError(`Unknown operator in better-auth where clause: ${ JSON.stringify(clause)}`);
	});

});

describe('_filterItems', () => {

	test('empty', () => {
		const item = uItem();
		expect(_filterItems([item], [])).toEqual([item]);
	});

	test('eq', () => {
		const field = Math.random().toString();
		const value = Math.random().toString();
		const item = uItem({
			[field]: value,
		});
		expect(_filterItems([uItem({
			[field]: value + value,
		}), item], [{ field, operator: 'eq', value }])).toEqual([item]);
	});

	test('ne', () => {
		const field = Math.random().toString();
		const value = Math.random().toString();
		const item = uItem({
			[field]: value + value,
		});
		expect(_filterItems([uItem({
			[field]: value,
		}), item], [{ field, operator: 'ne', value }])).toEqual([item]);
	});

	test('in', () => {
		const field = Math.random().toString();
		const value = Math.random().toString();
		const item = uItem({
			[field]: value,
		});
		expect(_filterItems([uItem({
			[field]: value + value,
		}), item], [{ field, operator: 'in', value: [value, Math.random().toString()] }])).toEqual([item]);
	});

	test('contains', () => {
		const field = Math.random().toString();
		const value = Math.random().toString();
		const item = uItem({
			[field]: `${ Math.random().toString() }${ value }${ Math.random().toString() }`,
		});
		expect(_filterItems([uItem({
			[field]: value.slice(0, -1),
		}), item], [{ field, operator: 'contains', value }])).toEqual([item]);
	});

  test('starts_with', () => {
  	const field = Math.random().toString();
  	const value = Math.random().toString();
  	const item = uItem({
  		[field]: `${ value }${ Math.random().toString() }`,
  	});
  	expect(_filterItems([uItem({
  		[field]: `${ Math.random().toString() }${ value }`,
  	}), item], [{ field, operator: 'starts_with', value }])).toEqual([item]);
  });

  test('ends_with', () => {
  	const field = Math.random().toString();
  	const value = Math.random().toString();
  	const item = uItem({
  		[field]: `${ Math.random().toString() }${ value }`,
  	});
  	expect(_filterItems([uItem({
  		[field]: `${ value }${ Math.random().toString() }`,
  	}), item], [{ field, operator: 'ends_with', value }])).toEqual([item]);
  });

  test('gt', () => {
  	const field = Math.random().toString();
  	const value = Math.random();
  	const item = uItem({
  		[field]: value + Math.random(),
  	});
  	expect(_filterItems([uItem({
  		[field]: value,
  	}), item], [{ field, operator: 'gt', value }])).toEqual([item]);
  });

  test('gte', () => {
  	const field = Math.random().toString();
  	const value = Math.random();
  	const item = uItem({
  		[field]: value,
  	});
  	expect(_filterItems([uItem({
  		[field]: value - Math.random(),
  	}), item], [{ field, operator: 'gte', value }])).toEqual([item]);
  });

  test('lt', () => {
  	const field = Math.random().toString();
  	const value = Math.random();
  	const item = uItem({
  		[field]: value - Math.random(),
  	});
  	expect(_filterItems([uItem({
  		[field]: value,
  	}), item], [{ field, operator: 'lt', value }])).toEqual([item]);
  });

  test('lte', () => {
  	const field = Math.random().toString();
  	const value = Math.random();
  	const item = uItem({
  		[field]: value,
  	});
  	expect(_filterItems([uItem({
  		[field]: value + Math.random(),
  	}), item], [{ field, operator: 'lte', value }])).toEqual([item]);
  });

  test('multiple', () => {
  	const field = Math.random().toString();
  	const value1 = Math.random().toString();
  	const value2 = Math.random().toString();
  	const item = uItem({
  		[field]: `${ value1 }${ Math.random().toString() }${ value2 }`,
  	});
  	expect(_filterItems([uItem({
  		[field]: `${ value1 }`,
  	}), item], [{ field, operator: 'starts_with', value: value1 }, { field, operator: 'ends_with', value: value2 }])).toEqual([item]);
  });

});

describe('genericAdapter', () => {

	afterAll(() => {
	  fs.readdirSync(folder).forEach(e => fs.unlinkSync(path.join(folder, e)));
	});

	const _adapter = ({
		collection = Math.random().toString(),
	} = {}) => {
		const methods = _adapterMethods({
			folder: _DATA_DIRECTORY,
		}, () => collection);

		return {

			create: data => methods.create({ data }),
			
			findOne: where => methods.findOne({ where }),
			findMany: ({ where, limit, sortBy }) => methods.findMany({ where, limit, sortBy }),
			
			update: (where, update) => methods.update({ where, update }),
			updateMany: (where, update) => methods.updateMany({ where, update }),
			
			delete: where => methods.delete({ where }),
			deleteMany: where => methods.deleteMany({ where }),
			
			count: where => methods.count({ where }),

		};
	};
	
	describe('create', () => {

		test('output', () => {
			const item = uItem();
			expect(_adapter().create(item)).toBe(item);
		});

		test('persist', () => {
			const collection = Math.random().toString();
			const item = {
				id: Math.random().toString(),
			};
			_adapter({ collection }).create(item);
			expect(JSON.parse(fs.readFileSync(path.join(folder, `${ collection }.json`), 'utf8'))).toEqual({ items: [item] });
		});

	});
	
	describe('findOne', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			adapter.create(uItem({
				[field]: Math.random().toString(),
			}));

			expect(adapter.findOne([{ field, operator: 'eq', value }])).toEqual(null);
		});

		test('output', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item = uItem({
				[field]: value,
			});
			[uItem({
				[field]: value + value,
			}), item].forEach(adapter.create);

			expect(adapter.findOne([{ field, operator: 'eq', value }])).toEqual(item);
		});

	});
	
	describe('findMany', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			adapter.create(uItem({
				[field]: Math.random().toString(),
			}));

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([]);
		});

		test('output', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item = uItem({
				[field]: value,
			});
			[uItem({
				[field]: value + value,
			}), item].forEach(adapter.create);

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item]);
		});

		test('limit', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const length = Math.max(Date.now() % 10, 5);
			const field = Math.random().toString();
			const value = Math.random().toString();

			const slice = Math.min(Math.max(Date.now() % 10, 1), 3);
			
			const items = Array.from({ length }, e => adapter.create(uItem({
				[field]: value,
			})));

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
				limit: length - slice,
			},)).toEqual(items.slice(0, -slice));
		});

		test('sortField', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const length = Math.max(Date.now() % 10, 5);
			const field = Math.random().toString();
			const value = Math.random().toString();

			const slice = Math.min(Math.max(Date.now() % 10, 1), 3);
			
			const items = Array.from({ length }, (e, i) => adapter.create(uItem({
				[field]: value,
				sortField: length - i,
			})));

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
				sortBy: {
					field: 'sortField',
				},
			},)).toEqual(items.slice().reverse());

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
				sortBy: {
					field: 'sortField',
					direction: 'desc',
				},
			},)).toEqual(items);
		});

	});
	
	describe('update', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			adapter.create(uItem({
				[field]: Math.random().toString(),
			}));

			expect(adapter.update([{ field, operator: 'eq', value }])).toEqual(null);
		});

		test('output', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item = uItem({
				[field]: value,
			});
			adapter.create(item);

			const update = Math.random().toString();
			expect(adapter.update([{ field, operator: 'eq', value }], {
				[field]: update,
			})).toEqual(Object.assign(Object.assign({}, item), {
				[field]: update,
			}));
		});

		test('update first only', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item1 = uItem({
				[field]: value,
			});
			adapter.create(item1);
			const item2 = uItem({
				[field]: value,
			});
			adapter.create(item2);

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item1, item2]);

			const update = Math.random().toString();
			adapter.update([{ field, operator: 'eq', value }], {
				[field]: update,
			})

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item2]);
		});

	});
	
	describe('updateMany', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			adapter.create(uItem({
				[field]: Math.random().toString(),
			}));

			expect(adapter.updateMany([{ field, operator: 'eq', value }])).toEqual(0);
		});

		test('output', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const length = Math.max(Date.now() % 10, 1);
			const field = Math.random().toString();
			const value = Math.random().toString();
			
			Array.from({ length }, e => adapter.create(uItem({
				[field]: value,
			})));

			const update = Math.random().toString();
			expect(adapter.updateMany([{ field, operator: 'eq', value }], {
				[field]: update,
			})).toEqual(length);

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([]);
		});

	});
	
	describe('delete', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item = uItem({
				[field]: Math.random().toString(),
			});
			adapter.create(item);

			expect(adapter.findMany([{ field, operator: 'ne', value }])).toEqual([item]);
			expect(adapter.delete([{ field, operator: 'eq', value }])).toEqual(undefined);
			expect(adapter.findMany([{ field, operator: 'ne', value }])).toEqual([item]);
		});

		test('delete first only', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item1 = uItem({
				[field]: value,
			});
			adapter.create(item1);
			const item2 = uItem({
				[field]: value,
			});
			adapter.create(item2);

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item1, item2]);
			expect(adapter.delete([{ field, operator: 'eq', value }])).toEqual(undefined);
			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item2]);
		});

	});
	
	describe('deleteMany', () => {

		test('no match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item = uItem({
				[field]: Math.random().toString(),
			});
			adapter.create(item);

			expect(adapter.findMany([{ field, operator: 'ne', value }])).toEqual([item]);
			expect(adapter.deleteMany([{ field, operator: 'eq', value }])).toEqual(0);
			expect(adapter.findMany([{ field, operator: 'ne', value }])).toEqual([item]);
		});

		test('match', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const field = Math.random().toString();
			const value = Math.random().toString();
			const item1 = uItem({
				[field]: value,
			});
			adapter.create(item1);
			const item2 = uItem({
				[field]: value,
			});
			adapter.create(item2);

			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([item1, item2]);
			expect(adapter.deleteMany([{ field, operator: 'eq', value }])).toEqual(2);
			expect(adapter.findMany({
				where: [{ field, operator: 'eq', value }],
			})).toEqual([]);
		});

	});

	describe('count', () => {

		test('output', () => {
			const collection = Math.random().toString();
			const adapter = _adapter({ collection });

			const length = Math.max(Date.now() % 10, 1);
			const field = Math.random().toString();
			const value = Math.random().toString();
			
			Array.from({ length }, e => adapter.create(uItem({
				[field]: value,
			})));

			expect(adapter.count([{ field, operator: 'eq', value }])).toEqual(length);
		});

	});

});
