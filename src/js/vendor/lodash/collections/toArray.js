/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash exports="commonjs" modularize`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isString = require('../objects/isString').isString,
    slice = require('../internals/slice').slice,
    support = require('../support').support,
    values = require('../objects/values').values;

/**
 * Converts the `collection` to an array.
 *
 * @static
 * @memberOf _
 * @category Collections
 * @param {Array|Object|string} collection The collection to convert.
 * @returns {Array} Returns the new converted array.
 * @example
 *
 * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
 * // => [2, 3, 4]
 */
function toArray(collection) {
  if (collection && typeof collection.length == 'number') {
    return (support.unindexedChars && isString(collection))
      ? collection.split('')
      : slice(collection);
  }
  return values(collection);
}

exports.toArray = toArray;
