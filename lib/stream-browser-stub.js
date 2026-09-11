"use strict";
/*
 * This file replaces the "stream" module in browser bundles (see the
 * "browser" field in package.json). Node streams make no sense in a browser:
 * with no Readable available, support.nodestream stays false and the
 * nodejs stream adapters are never loaded.
 */
module.exports = {
    Readable: null
};
