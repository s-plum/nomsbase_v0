/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash exports="commonjs" modularize`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var htmlUnescapes = require('./htmlUnescapes').htmlUnescapes,
    keys = require('../objects/keys').keys;

/** Used to match HTML entities and HTML characters */
var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g');

exports.reEscapedHtml = reEscapedHtml;
