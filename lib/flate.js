"use strict";

var fflate = require("fflate");
var utils = require("./utils");
var GenericWorker = require("./stream/GenericWorker");

exports.magic = "\x08\x00";

/**
 * Create a worker that uses fflate to inflate/deflate.
 * @constructor
 * @param {String} action the fflate class to use : either "Deflate" or "Inflate".
 * @param {Object} options the options to use when (de)compressing.
 */
function FlateWorker(action, options) {
    GenericWorker.call(this, "FlateWorker/" + action);

    this._flate = null;
    this._action = action;
    this._options = options || {};
    // the `meta` object from the last chunk received
    // this allow this worker to pass around metadata
    this.meta = {};
}

utils.inherits(FlateWorker, GenericWorker);

/**
 * @see GenericWorker.processChunk
 */
FlateWorker.prototype.processChunk = function (chunk) {
    this.meta = chunk.meta;
    if (this._flate === null) {
        this._createFlate();
    }
    try {
        this._flate.push(utils.transformTo("uint8array", chunk.data), false);
    } catch (err) {
        this.error(err);
    }
};

/**
 * @see GenericWorker.flush
 */
FlateWorker.prototype.flush = function () {
    GenericWorker.prototype.flush.call(this);
    if (this._flate === null) {
        this._createFlate();
    }
    try {
        this._flate.push(new Uint8Array(0), true);
    } catch (err) {
        this.error(err);
    }
};

/**
 * @see GenericWorker.cleanUp
 */
FlateWorker.prototype.cleanUp = function () {
    GenericWorker.prototype.cleanUp.call(this);
    this._flate = null;
};

/**
 * Create the fflate stream.
 * TODO: lazy-loading this object isn't the best solution but it's the
 * quickest. The best solution is to lazy-load the worker list. See also the
 * issue #446.
 */
FlateWorker.prototype._createFlate = function () {
    var self = this;
    var opts = {};
    var level = this._options.level;

    // pako used -1 for zlib's default compression; fflate defaults to 6 when omitted.
    if (level !== undefined && level !== null && level !== -1) {
        opts.level = level;
    }

    // fflate's Deflate/Inflate are raw (no zlib/gzip headers), as required by ZIP.
    this._flate = new fflate[this._action](opts);
    this._flate.ondata = function (data) {
        if (!data || !data.length) {
            return;
        }
        self.push({
            data: data,
            meta: self.meta
        });
    };
};

exports.compressWorker = function (compressionOptions) {
    return new FlateWorker("Deflate", compressionOptions);
};
exports.uncompressWorker = function () {
    return new FlateWorker("Inflate", {});
};
