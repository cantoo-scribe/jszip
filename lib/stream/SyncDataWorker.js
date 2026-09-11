"use strict";

var utils = require("../utils");
var GenericWorker = require("./GenericWorker");
var DataWorker = require("./DataWorker");

/**
 * A DataWorker for data already available synchronously: chunks are emitted
 * in a blocking loop on resume() instead of being scheduled on the event
 * loop. Since every other worker of a chain reacts synchronously to the
 * chunks it receives, a chain fed by SyncDataWorkers completes (emits "end")
 * before resume() returns.
 * @constructor
 * @param {String|Uint8Array|Array|Buffer} data the data to split.
 */
function SyncDataWorker(data) {
    GenericWorker.call(this, "SyncDataWorker");
    this.dataIsReady = true;
    this.index = 0;
    this.data = data;
    this.max = data && data.length || 0;
    this.type = utils.getTypeOf(data);
    this._tickScheduled = false;
}

utils.inherits(SyncDataWorker, DataWorker);

// Trampoline for the blocking drive. When a zip has many entries, ending
// worker A synchronously resumes worker B (ZipFileWorker.prepareNextSource
// runs in A's "end" event): naive recursion would grow the stack with the
// number of entries and overflow around a few thousand files. A resume
// happening while another SyncDataWorker is already being driven only
// queues the worker; the outermost drive loop picks it up once the current
// one unwinds.
var driving = false;
var pending = [];

/**
 * @see GenericWorker.resume
 */
SyncDataWorker.prototype.resume = function () {
    if (!GenericWorker.prototype.resume.call(this)) {
        return false;
    }
    this._tickAndRepeat();
    return true;
};

/**
 * Emit every remaining chunk synchronously (see the trampoline note above).
 */
SyncDataWorker.prototype._tickAndRepeat = function () {
    pending.push(this);
    if (driving) {
        return;
    }
    driving = true;
    try {
        while (pending.length) {
            var worker = pending.shift();
            while (!worker.isPaused && !worker.isFinished) {
                worker._tick();
            }
        }
    } finally {
        driving = false;
        pending.length = 0;
    }
};

module.exports = SyncDataWorker;
