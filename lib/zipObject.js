"use strict";

var StreamHelper = require("./stream/StreamHelper");
var DataWorker = require("./stream/DataWorker");
var SyncDataWorker = require("./stream/SyncDataWorker");
var utf8 = require("./utf8");
var CompressedObject = require("./compressedObject");
var GenericWorker = require("./stream/GenericWorker");

/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 * @param {{data: Object}|{error: Error}|null} dataSync the result of the
 * synchronous preparation of the content: the prepared data, the error
 * thrown while preparing it, or null when the source is asynchronous.
 */
var ZipObject = function(name, data, options, dataSync) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;
    this.unixPermissions = options.unixPermissions;
    this.dosPermissions = options.dosPermissions;

    this._data = data;
    this._dataSync = dataSync || null;
    this._dataBinary = options.binary;
    // keep only the compression
    this.options = {
        compression : options.compression,
        compressionOptions : options.compressionOptions
    };
};

ZipObject.prototype = {
    /**
     * Create an internal stream for the content of this object.
     * @private
     * @param {String} type the type of each chunk.
     * @param {Boolean} sync true to build a chain usable with accumulateSync.
     * @return StreamHelper the stream.
     */
    _internalStream: function (type, sync) {
        var result = null, outputType = "string";
        try {
            if (!type) {
                throw new Error("No output type specified.");
            }
            outputType = type.toLowerCase();
            var askUnicodeString = outputType === "string" || outputType === "text";
            if (outputType === "binarystring" || outputType === "text") {
                outputType = "string";
            }
            result = this._decompressWorker(sync);

            var isUnicodeString = !this._dataBinary;

            if (isUnicodeString && !askUnicodeString) {
                result = result.pipe(new utf8.Utf8EncodeWorker());
            }
            if (!isUnicodeString && askUnicodeString) {
                result = result.pipe(new utf8.Utf8DecodeWorker());
            }
        } catch (e) {
            result = new GenericWorker("error");
            result.error(e);
        }

        return new StreamHelper(result, outputType, "");
    },

    /**
     * Create an internal stream for the content of this object.
     * @param {String} type the type of each chunk.
     * @return StreamHelper the stream.
     */
    internalStream: function (type) {
        return this._internalStream(type, false);
    },

    /**
     * Prepare the content in the asked type.
     * @param {String} type the type of the result.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Promise the promise of the result.
     */
    async: function (type, onUpdate) {
        return this.internalStream(type).accumulate(onUpdate);
    },

    /**
     * Prepare the content in the asked type, synchronously. Only works when
     * the file comes from a synchronous source (a string, a TypedArray, a
     * zip file loaded from one...), throws otherwise.
     * @param {String} type the type of the result.
     * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content.
     */
    sync: function (type) {
        return this._internalStream(type, true).accumulateSync();
    },

    /**
     * Prepare the content as a nodejs stream.
     * @param {String} type the type of each chunk.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Stream the stream.
     */
    nodeStream: function (type, onUpdate) {
        return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
    },

    /**
     * Prepare the content as a web ReadableStream (WHATWG Streams).
     * @param {String} type the type of each chunk.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return {ReadableStream} the stream.
     */
    webStream: function (type, onUpdate) {
        return this.internalStream(type || "uint8array").toWebStream(onUpdate);
    },

    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    _compressWorker: function (compression, compressionOptions, sync) {
        if (
            this._data instanceof CompressedObject &&
            this._data.compression.magic === compression.magic
        ) {
            return this._data.getCompressedWorker(sync);
        } else {
            var result = this._decompressWorker(sync);
            if(!this._dataBinary) {
                result = result.pipe(new utf8.Utf8EncodeWorker());
            }
            return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
        }
    },
    /**
     * Return a worker for the decompressed content.
     * @private
     * @param {Boolean} sync true to build a worker usable in a synchronous
     * chain, throws if the source of this file is asynchronous.
     * @return Worker the worker.
     */
    _decompressWorker : function (sync) {
        if (this._data instanceof CompressedObject) {
            return this._data.getContentWorker(sync);
        } else if (this._data instanceof GenericWorker) {
            if (sync) {
                throw new Error("The file '" + this.name + "' comes from a stream and can't be read synchronously, please use the async API for it.");
            }
            return this._data;
        } else if (sync) {
            return new SyncDataWorker(this._syncData());
        } else {
            return new DataWorker(this._data);
        }
    },
    /**
     * Return the data of this file if it is available synchronously, throw
     * otherwise (or if its synchronous preparation failed).
     * @private
     * @return {String|Uint8Array|Array|Buffer} the data.
     */
    _syncData : function () {
        if (!this._dataSync) {
            throw new Error("The file '" + this.name + "' comes from an asynchronous source (Blob, Promise...) and can't be read synchronously, please use the async API for it.");
        }
        if (this._dataSync.error) {
            throw this._dataSync.error;
        }
        return this._dataSync.data;
    }
};

var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
var removedFn = function () {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
};

for(var i = 0; i < removedMethods.length; i++) {
    ZipObject.prototype[removedMethods[i]] = removedFn;
}
module.exports = ZipObject;
