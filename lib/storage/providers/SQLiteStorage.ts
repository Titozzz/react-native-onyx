/**
 * The SQLiteStorage provider stores everything in a key/value store by
 * converting the value to a JSON string
 */
import {open} from 'react-native-quick-sqlite';
import _ from 'underscore';

const DB_NAME = 'OnyxDB';
const db = open({name: DB_NAME});

db.execute('CREATE TABLE IF NOT EXISTS keyvaluepairs (record_key TEXT NOT NULL PRIMARY KEY , valueJSON JSON NOT NULL) WITHOUT ROWID;');

// All of the 3 pragmas below were suggested by SQLite team.
// You can find more info about them here: https://www.sqlite.org/pragma.html
db.execute('PRAGMA CACHE_SIZE=-20000;');
db.execute('PRAGMA synchronous=NORMAL;');
db.execute('PRAGMA journal_mode=WAL;');

const provider = {
    /**
    * Get the value of a given key or return `null` if it's not available in storage
    * @param {String} key
    * @return {Promise<*>}
    */
    getItem(key: string) {
        return db.executeAsync('SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key = ?;', [key]).then(({rows}) => {
            if (!rows || rows.length === 0) {
                return null;
            }
            const result = rows.item(0);
            return JSON.parse(result.valueJSON);
        });
    },

    /**
    * Get multiple key-value pairs for the given array of keys in a batch
    * @param {String[]} keys
    * @return {Promise<Array<[key, value]>>}
    */
    multiGet(keys: string[]) {
        const placeholders = _.map(keys, () => '?').join(',');
        const command = `SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key IN (${placeholders});`;
        return db.executeAsync(command, keys)
            .then(({rows}) => {
                // eslint-disable-next-line no-underscore-dangle
                const result = _.map(rows?._array ?? [], row => [row.record_key, JSON.parse(row.valueJSON)]);
                return result;
            });
    },

    /**
    * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
    * @param {String} key
    * @param {*} value
    * @return {Promise<void>}
    */
    setItem(key: string, value: unknown) {
        return db.executeAsync('REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, ?);', [key, JSON.stringify(value)]);
    },

    /**
    * Stores multiple key-value pairs in a batch
    * @param {Array<[key, value]>} pairs
    * @return {Promise<void>}
    */
    multiSet(pairs: [string, unknown][]) {
        const stringifiedPairs = _.map(pairs, pair => [
            pair[0],
            JSON.stringify(_.isUndefined(pair[1]) ? null : pair[1]),
        ]);
        if (_.isEmpty(stringifiedPairs)) {
            return Promise.resolve();
        }
        return db.executeBatchAsync([['REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, json(?));', stringifiedPairs]]);
    },

    /**
    * Multiple merging of existing and new values in a batch
    * @param {Array<[key, value]>} pairs
    * @return {Promise<void>}
    */
    multiMerge(pairs: [string, unknown][]) {
        // Note: We use `ON CONFLICT DO UPDATE` here instead of `INSERT OR REPLACE INTO`
        // so the new JSON value is merged into the old one if there's an existing value
        const query = `INSERT INTO keyvaluepairs (record_key, valueJSON)
             VALUES (:key, JSON(:value))
             ON CONFLICT DO UPDATE
             SET valueJSON = JSON_PATCH(valueJSON, JSON(:value));
        `;
        const queryArguments = _.map(pairs, (pair) => {
            const value = JSON.stringify(pair[1]);
            return [pair[0], value];
        });
        return db.executeBatchAsync([[query, queryArguments]]);
    },

    /**
    * Returns all keys available in storage
    * @returns {Promise<String[]>}
    */
    getAllKeys: () => db.executeAsync('SELECT record_key FROM keyvaluepairs;').then(({rows}) => {
        // eslint-disable-next-line no-underscore-dangle
        const result = _.map(rows?._array ?? [], row => row.record_key);
        return result;
    }),

    /**
    * Removes given key and it's value from storage
    * @param {String} key
    * @returns {Promise<void>}
    */
    removeItem: (key: string) => db.executeAsync('DELETE FROM keyvaluepairs WHERE record_key = ?;', [key]),

    /**
    * Clears absolutely everything from storage
    * @returns {Promise<void>}
    */
    clear: () => db.executeAsync('DELETE FROM keyvaluepairs;', []),
};

export default provider;