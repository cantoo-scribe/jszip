"use strict";

var external = require("./external");
var DataWorker = require("./stream/DataWorker");
var SyncDataWorker = require("./stream/SyncDataWorker");
var Crc32Probe = require("./stream/Crc32Probe");
var DataLengthProbe = require("./stream/DataLengthProbe");

/**
 * Represent a compressed object, with everything needed to decompress it.
 * @constructor
 * @param {number} compressedSize the size of the data compressed.
 * @param {number} uncompressedSize the size of the data after decompression.
 * @param {number} crc32 the crc32 of the decompressed file.
 * @param {object} compression the type of compression, see lib/compressions.js.
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the compressed data.
 */
function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
    this.compressedSize = compressedSize;
    this.uncompressedSize = uncompressedSize;
    this.crc32 = crc32;
    this.compression = compression;
    this.compressedContent = data;
}

CompressedObject.prototype = {
    /**
     * Create a worker for the raw compressed content. The content is always
     * available synchronously, the sync flag only changes how chunks are
     * scheduled.
     * @private
     * @param {Boolean} sync true to emit the chunks in a blocking loop.
     * @return {GenericWorker} the worker.
     */
    _rawWorker: function (sync) {
        if (sync) {
            return new SyncDataWorker(this.compressedContent);
        }
        return new DataWorker(external.Promise.resolve(this.compressedContent));
    },
    /**
     * Create a worker to get the uncompressed content.
     * @param {Boolean} sync true to emit the chunks in a blocking loop.
     * @return {GenericWorker} the worker.
     */
    getContentWorker: function (sync) {
        var worker = this._rawWorker(sync)
            .pipe(this.compression.uncompressWorker())
            .pipe(new DataLengthProbe("data_length"));

        var that = this;
        worker.on("end", function () {
            if (this.streamInfo["data_length"] !== that.uncompressedSize) {
                throw new Error("Bug : uncompressed data size mismatch");
            }
        });
        return worker;
    },
    /**
     * Create a worker to get the compressed content.
     * @param {Boolean} sync true to emit the chunks in a blocking loop.
     * @return {GenericWorker} the worker.
     */
    getCompressedWorker: function (sync) {
        return this._rawWorker(sync)
            .withStreamInfo("compressedSize", this.compressedSize)
            .withStreamInfo("uncompressedSize", this.uncompressedSize)
            .withStreamInfo("crc32", this.crc32)
            .withStreamInfo("compression", this.compression)
        ;
    }
};

/**
 * Chain the given worker with other workers to compress the content with the
 * given compression.
 * @param {GenericWorker} uncompressedWorker the worker to pipe.
 * @param {Object} compression the compression object.
 * @param {Object} compressionOptions the options to use when compressing.
 * @return {GenericWorker} the new worker compressing the content.
 */
CompressedObject.createWorkerFrom = function (uncompressedWorker, compression, compressionOptions) {
    return uncompressedWorker
        .pipe(new Crc32Probe())
        .pipe(new DataLengthProbe("uncompressedSize"))
        .pipe(compression.compressWorker(compressionOptions))
        .pipe(new DataLengthProbe("compressedSize"))
        .withStreamInfo("compression", compression);
};

module.exports = CompressedObject;
