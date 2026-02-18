import { createAdapterFactory } from "better-auth/adapters";
import jsonQ from 'js-jsonq';
import db from '$lib/db/main.js';

const _jsonQParams = where => {
  if (!where || where.length === 0)
    return [];

  return where.map(e => {
    const { field, operator, value } = e;

    const op = {
      ne: 'neq',
      starts_with: 'startswith',
      ends_with: 'endswith',
    }[operator] || ('eq in contains gt gte lt lte'.trim().split(/\s+/).includes(operator) ? operator : null);

    if (!op)
      throw new Error(`Unknown operator in better-auth where clause: ${ JSON.stringify(e) }`);

    return [field, op, value];
  });
};

const _filterItems = (array, where) => _jsonQParams(where).reduce((chain, item) => chain.where(...item), new jsonQ({
    array,
  }).from('array')).fetch();

const _adapterMethods = ({
  shouldLog = false,
  folder,
} = {}, getModelName) => {
  const _dbs = {};

  return {

    _log (message, meta = {}, error) {
      if (!shouldLog)
        return
      
      console['message' === 'error' ? 'error' : 'info'](`[genericAdapter] ${ message }`,  JSON.stringify(meta), error);
    },

    _attempt (cb, meta = {}) {
      try {
        return cb();
      } catch (error) {
        this._log('error', meta, error);

        throw error;
      }
    },

    _applyUpdate: (record, update) => Object.assign(Object.assign({}, record), update),

    _db: collection => _dbs[collection] = _dbs[collection] || db.collection(collection, {
      folder,
    }),

    _getItems (collection) {
      return this._attempt(() => this._db(collection).getItems(), {
        operation: '_getItems',
        collection,
      })
    },

    create ({ data, model }) {
      this._log('create', { model, data });

      const collection = getModelName(model);
      return this._attempt(() => this._db(collection).create(data), {
        operation: 'create',
        collection,
      });
    },

    findOne ({ model, where }) {
      this._log('findOne', { model, where });

      return _filterItems(this._getItems(getModelName(model)), where).shift() || null;
    },

    findMany ({ model, where, limit, offset, sortBy }) {
      this._log('findMany', { model, where, limit, offset, sortBy });

      const result = _filterItems(this._getItems(getModelName(model)), where);

      return (!sortBy ? result : result.sort(this[sortBy.direction === 'desc' ? '_sortDescending' : '_sortAscending'](e => e[sortBy.field]))).slice(0, limit);
    },

    _sortAscending: callback => (a, b) => ((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0))(callback(a), callback(b)),
    _sortDescending: callback => (a, b) => ((a, b) => (a > b) ? -1 : ((a < b) ? 1 : 0))(callback(a), callback(b)),

    update ({ model, where, update }) {
      this._log('update', { model, where, update });

      const collection = getModelName(model);
      const result = _filterItems(this._getItems(collection), where).shift();

      if (!result)
        return null;

      return this._attempt(() => this._db(collection).update(result.id, this._applyUpdate(result, update)), {
        operation: 'update',
        collection,
      });
    },

    updateMany ({ model, where, update }) {
      this._log('updateMany', { model, where, update });

      const collection = getModelName(model);
      return _filterItems(this._getItems(collection), where).map(record => this._attempt(() => this._db(collection).update(record.id, this._applyUpdate(record, update)), {
        operation: 'updateMany',
        collection,
      })).length;
    },

    delete ({ model, where }) {
      this._log('delete', { model, where });

      const collection = getModelName(model);
      const result = _filterItems(this._getItems(collection), where).shift();

      if (!result)
        return;

      this._attempt(() => this._db(collection).delete(result.id), {
        operation: 'delete',
        collection,
      });

      return;
    },

    deleteMany ({ model, where }) {
      this._log('deleteMany', { model, where });

      const collection = getModelName(model);
      return _filterItems(this._getItems(collection), where).map(record => this._attempt(() => this._db(collection).delete(record.id), {
        operation: 'deleteMany',
        collection,
      })).length;
    },

    count ({ model, where }) {
      this._log('count', { model, where });

      return _filterItems(this._getItems(getModelName(model)), where).length;
    },

  };
};

const genericAdapter = _config => createAdapterFactory({

  config: {
    adapterId: 'generic-adapter',
    adapterName: 'Generic Adapter',
    supportsDates: false,
    supportsBooleans: true,
    supportsJSON: false,
  },

  adapter: ({ getModelName }) => _adapterMethods(_config, getModelName),

});

export { _jsonQParams, _filterItems, _adapterMethods, genericAdapter };
