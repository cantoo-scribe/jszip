"use strict";

var utils = require("../utils");
var GenericWorker = require("./GenericWorker");

/**
 * A worker that uses a web ReadableStream (WHATWG Streams) as source.
 * Backpressure comes for free: the next read() is only issued while the
 * worker is running, so pausing the chain stops pulling from the stream.
 * @constructor
 * @param {String} filename the name of the file entry for this stream.
 * @param {ReadableStream} stream the web stream.
 */
function WebStreamInputAdapter(filename, stream) {
    GenericWorker.call(this, "Web stream input adapter for " + filename);
    this._filename = filename;
    this._reader = stream.getReader();
    // a read() is in flight: don't issue a second one, the pending one will
    // continue the loop (or stash its result) when it settles.
    this._reading = false;
    // the (chunk, done, error) received while the worker was paused, to be
    // replayed on resume.
    this._pendingChunk = null;
    this._upstreamEnded = false;
}

utils.inherits(WebStreamInputAdapter, GenericWorker);

/**
 * @see GenericWorker.resume
 */
WebStreamInputAdapter.prototype.resume = function () {
    if (!GenericWorker.prototype.resume.call(this)) {
        return false;
    }

    if (this._pendingChunk !== null) {
        var chunk = this._pendingChunk;
        this._pendingChunk = null;
        this._pushChunk(chunk);
        if (this.isPaused || this.isFinished) {
            return true;
        }
    }
    if (this._upstreamEnded) {
        this.end();
    } else {
        this._readChunk();
    }
    return true;
};

/**
 * Issue a read() on the stream and process its result: push the chunk and
 * read again, or replay it later if the worker got paused in the meantime.
 */
WebStreamInputAdapter.prototype._readChunk = function () {
    if (this._reading || this.isPaused || this.isFinished) {
        return;
    }
    this._reading = true;
    var self = this;
    this._reader.read().then(function (result) {
        self._reading = false;
        if (self.isFinished) {
            return;
        }
        if (result.done) {
            if (self.isPaused) {
                self._upstreamEnded = true;
            } else {
                self.end();
            }
            return;
        }
        if (self.isPaused) {
            self._pendingChunk = result.value;
            return;
        }
        self._pushChunk(result.value);
        self._readChunk();
    }, function (e) {
        self._reading = false;
        if (self.isPaused) {
            self.generatedError = e;
        } else {
            self.error(e);
        }
    });
};

/**
 * Push a chunk of the stream to the next workers, converting it to a type
 * they understand.
 * @param {Object} chunk the chunk read from the stream.
 */
WebStreamInputAdapter.prototype._pushChunk = function (chunk) {
    var type = utils.getTypeOf(chunk);
    if (!type) {
        this.error(new Error(
            "The web stream of '" + this._filename + "' produced a chunk in " +
            "an unsupported type, only strings, TypedArrays and ArrayBuffers " +
            "are supported."
        ));
        return;
    }
    if (type === "arraybuffer") {
        // the internal workers expect array-like chunks (with a length)
        chunk = utils.transformTo("uint8array", chunk);
    }
    this.push({
        data: chunk,
        meta: {
            percent: 0
        }
    });
};

module.exports = WebStreamInputAdapter;
