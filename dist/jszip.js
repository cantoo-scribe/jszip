"use strict";
var JSZip = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // lib/stream-browser-stub.js
  var require_stream_browser_stub = __commonJS({
    "lib/stream-browser-stub.js"(exports, module) {
      "use strict";
      module.exports = {
        Readable: null
      };
    }
  });

  // lib/support.js
  var require_support = __commonJS({
    "lib/support.js"(exports) {
      "use strict";
      exports.base64 = true;
      exports.array = true;
      exports.string = true;
      exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
      exports.nodebuffer = typeof Buffer !== "undefined";
      exports.uint8array = typeof Uint8Array !== "undefined";
      if (typeof Blob === "undefined" || typeof ArrayBuffer === "undefined") {
        exports.blob = false;
      } else {
        try {
          exports.blob = new Blob([new ArrayBuffer(0)], {
            type: "application/zip"
          }).size === 0;
        } catch (e) {
          exports.blob = false;
        }
      }
      try {
        exports.nodestream = !!require_stream_browser_stub().Readable;
      } catch (e) {
        exports.nodestream = false;
      }
      exports.webstream = typeof ReadableStream !== "undefined";
    }
  });

  // lib/base64.js
  var require_base64 = __commonJS({
    "lib/base64.js"(exports) {
      "use strict";
      var utils = require_utils();
      var support = require_support();
      var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      exports.encode = function(input) {
        var output = [];
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0, len = input.length, remainingBytes = len;
        var isArray = utils.getTypeOf(input) !== "string";
        while (i < input.length) {
          remainingBytes = len - i;
          if (!isArray) {
            chr1 = input.charCodeAt(i++);
            chr2 = i < len ? input.charCodeAt(i++) : 0;
            chr3 = i < len ? input.charCodeAt(i++) : 0;
          } else {
            chr1 = input[i++];
            chr2 = i < len ? input[i++] : 0;
            chr3 = i < len ? input[i++] : 0;
          }
          enc1 = chr1 >> 2;
          enc2 = (chr1 & 3) << 4 | chr2 >> 4;
          enc3 = remainingBytes > 1 ? (chr2 & 15) << 2 | chr3 >> 6 : 64;
          enc4 = remainingBytes > 2 ? chr3 & 63 : 64;
          output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));
        }
        return output.join("");
      };
      exports.decode = function(input) {
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0, resultIndex = 0;
        var dataUrlPrefix = "data:";
        if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
          throw new Error("Invalid base64 input, it looks like a data url.");
        }
        input = input.replace(/[^A-Za-z0-9+/=]/g, "");
        var totalLength = input.length * 3 / 4;
        if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
          totalLength--;
        }
        if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
          totalLength--;
        }
        if (totalLength % 1 !== 0) {
          throw new Error("Invalid base64 input, bad content length.");
        }
        var output;
        if (support.uint8array) {
          output = new Uint8Array(totalLength | 0);
        } else {
          output = new Array(totalLength | 0);
        }
        while (i < input.length) {
          enc1 = _keyStr.indexOf(input.charAt(i++));
          enc2 = _keyStr.indexOf(input.charAt(i++));
          enc3 = _keyStr.indexOf(input.charAt(i++));
          enc4 = _keyStr.indexOf(input.charAt(i++));
          chr1 = enc1 << 2 | enc2 >> 4;
          chr2 = (enc2 & 15) << 4 | enc3 >> 2;
          chr3 = (enc3 & 3) << 6 | enc4;
          output[resultIndex++] = chr1;
          if (enc3 !== 64) {
            output[resultIndex++] = chr2;
          }
          if (enc4 !== 64) {
            output[resultIndex++] = chr3;
          }
        }
        return output;
      };
    }
  });

  // lib/nodejsUtils.js
  var require_nodejsUtils = __commonJS({
    "lib/nodejsUtils.js"(exports, module) {
      "use strict";
      module.exports = {
        /**
         * True if this is running in Nodejs, will be undefined in a browser.
         * In a browser, browserify won't include this file and the whole module
         * will be resolved an empty object.
         */
        isNode: typeof Buffer !== "undefined",
        /**
         * Create a new nodejs Buffer from an existing content.
         * @param {Object} data the data to pass to the constructor.
         * @param {String} encoding the encoding to use.
         * @return {Buffer} a new Buffer.
         */
        newBufferFrom: function(data, encoding) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) {
            return Buffer.from(data, encoding);
          } else {
            if (typeof data === "number") {
              throw new Error('The "data" argument must not be a number');
            }
            return new Buffer(data, encoding);
          }
        },
        /**
         * Create a new nodejs Buffer with the specified size.
         * @param {Integer} size the size of the buffer.
         * @return {Buffer} a new Buffer.
         */
        allocBuffer: function(size) {
          if (Buffer.alloc) {
            return Buffer.alloc(size);
          } else {
            var buf = new Buffer(size);
            buf.fill(0);
            return buf;
          }
        },
        /**
         * Find out if an object is a Buffer.
         * @param {Object} b the object to test.
         * @return {Boolean} true if the object is a Buffer, false otherwise.
         */
        isBuffer: function(b) {
          return Buffer.isBuffer(b);
        },
        isStream: function(obj) {
          return obj && typeof obj.on === "function" && typeof obj.pause === "function" && typeof obj.resume === "function";
        }
      };
    }
  });

  // lib/external.js
  var require_external = __commonJS({
    "lib/external.js"(exports, module) {
      "use strict";
      module.exports = {
        Promise
      };
    }
  });

  // lib/utils.js
  var require_utils = __commonJS({
    "lib/utils.js"(exports) {
      "use strict";
      var support = require_support();
      var base64 = require_base64();
      var nodejsUtils = require_nodejsUtils();
      var external = require_external();
      var scheduleMacrotask;
      if (typeof setImmediate === "function") {
        scheduleMacrotask = setImmediate;
      } else if (typeof MessageChannel !== "undefined") {
        macrotaskQueue = [];
        macrotaskChannel = new MessageChannel();
        macrotaskChannel.port1.onmessage = function() {
          macrotaskQueue.shift()();
        };
        scheduleMacrotask = function(fn) {
          macrotaskQueue.push(fn);
          macrotaskChannel.port2.postMessage(null);
        };
      } else {
        scheduleMacrotask = function(fn) {
          setTimeout(fn, 0);
        };
      }
      var macrotaskQueue;
      var macrotaskChannel;
      function string2binary(str) {
        var result = null;
        if (support.uint8array) {
          result = new Uint8Array(str.length);
        } else {
          result = new Array(str.length);
        }
        return stringToArrayLike(str, result);
      }
      exports.newBlob = function(part, type) {
        exports.checkSupport("blob");
        try {
          return new Blob([part], {
            type
          });
        } catch (e) {
          try {
            var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
            var builder = new Builder();
            builder.append(part);
            return builder.getBlob(type);
          } catch (e2) {
            throw new Error("Bug : can't construct the Blob.");
          }
        }
      };
      function identity(input) {
        return input;
      }
      function stringToArrayLike(str, array) {
        for (var i = 0; i < str.length; ++i) {
          array[i] = str.charCodeAt(i) & 255;
        }
        return array;
      }
      var arrayToStringHelper = {
        /**
         * Transform an array of int into a string, chunk by chunk.
         * See the performances notes on arrayLikeToString.
         * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
         * @param {String} type the type of the array.
         * @param {Integer} chunk the chunk size.
         * @return {String} the resulting string.
         * @throws Error if the chunk is too big for the stack.
         */
        stringifyByChunk: function(array, type, chunk) {
          var result = [], k = 0, len = array.length;
          if (len <= chunk) {
            return String.fromCharCode.apply(null, array);
          }
          while (k < len) {
            if (type === "array" || type === "nodebuffer") {
              result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            } else {
              result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
            }
            k += chunk;
          }
          return result.join("");
        },
        /**
         * Call String.fromCharCode on every item in the array.
         * This is the naive implementation, which generate A LOT of intermediate string.
         * This should be used when everything else fail.
         * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
         * @return {String} the result.
         */
        stringifyByChar: function(array) {
          var resultStr = "";
          for (var i = 0; i < array.length; i++) {
            resultStr += String.fromCharCode(array[i]);
          }
          return resultStr;
        },
        applyCanBeUsed: {
          /**
           * true if the browser accepts to use String.fromCharCode on Uint8Array
           */
          uint8array: (function() {
            try {
              return support.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
            } catch (e) {
              return false;
            }
          })(),
          /**
           * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
           */
          nodebuffer: (function() {
            try {
              return support.nodebuffer && String.fromCharCode.apply(null, nodejsUtils.allocBuffer(1)).length === 1;
            } catch (e) {
              return false;
            }
          })()
        }
      };
      function arrayLikeToString(array) {
        var chunk = 65536, type = exports.getTypeOf(array), canUseApply = true;
        if (type === "uint8array") {
          canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
        } else if (type === "nodebuffer") {
          canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
        }
        if (canUseApply) {
          while (chunk > 1) {
            try {
              return arrayToStringHelper.stringifyByChunk(array, type, chunk);
            } catch (e) {
              chunk = Math.floor(chunk / 2);
            }
          }
        }
        return arrayToStringHelper.stringifyByChar(array);
      }
      exports.applyFromCharCode = arrayLikeToString;
      function arrayLikeToArrayLike(arrayFrom, arrayTo) {
        for (var i = 0; i < arrayFrom.length; i++) {
          arrayTo[i] = arrayFrom[i];
        }
        return arrayTo;
      }
      var transform = {};
      transform["string"] = {
        "string": identity,
        "array": function(input) {
          return stringToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
          return transform["string"]["uint8array"](input).buffer;
        },
        "uint8array": function(input) {
          return stringToArrayLike(input, new Uint8Array(input.length));
        },
        "nodebuffer": function(input) {
          return stringToArrayLike(input, nodejsUtils.allocBuffer(input.length));
        }
      };
      transform["array"] = {
        "string": arrayLikeToString,
        "array": identity,
        "arraybuffer": function(input) {
          return new Uint8Array(input).buffer;
        },
        "uint8array": function(input) {
          return new Uint8Array(input);
        },
        "nodebuffer": function(input) {
          return nodejsUtils.newBufferFrom(input);
        }
      };
      transform["arraybuffer"] = {
        "string": function(input) {
          return arrayLikeToString(new Uint8Array(input));
        },
        "array": function(input) {
          return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
        },
        "arraybuffer": identity,
        "uint8array": function(input) {
          return new Uint8Array(input);
        },
        "nodebuffer": function(input) {
          return nodejsUtils.newBufferFrom(new Uint8Array(input));
        }
      };
      transform["uint8array"] = {
        "string": arrayLikeToString,
        "array": function(input) {
          return arrayLikeToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
          return input.buffer;
        },
        "uint8array": identity,
        "nodebuffer": function(input) {
          return nodejsUtils.newBufferFrom(input);
        }
      };
      transform["nodebuffer"] = {
        "string": arrayLikeToString,
        "array": function(input) {
          return arrayLikeToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
          return transform["nodebuffer"]["uint8array"](input).buffer;
        },
        "uint8array": function(input) {
          return arrayLikeToArrayLike(input, new Uint8Array(input.length));
        },
        "nodebuffer": identity
      };
      exports.transformTo = function(outputType, input) {
        if (!input) {
          input = "";
        }
        if (!outputType) {
          return input;
        }
        exports.checkSupport(outputType);
        var inputType = exports.getTypeOf(input);
        var result = transform[inputType][outputType](input);
        return result;
      };
      exports.resolve = function(path) {
        var parts = path.split("/");
        var result = [];
        for (var index = 0; index < parts.length; index++) {
          var part = parts[index];
          if (part === "." || part === "" && index !== 0 && index !== parts.length - 1) {
            continue;
          } else if (part === "..") {
            result.pop();
          } else {
            result.push(part);
          }
        }
        return result.join("/");
      };
      exports.getTypeOf = function(input) {
        if (typeof input === "string") {
          return "string";
        }
        if (Object.prototype.toString.call(input) === "[object Array]") {
          return "array";
        }
        if (support.nodebuffer && nodejsUtils.isBuffer(input)) {
          return "nodebuffer";
        }
        if (support.uint8array && input instanceof Uint8Array) {
          return "uint8array";
        }
        if (support.arraybuffer && input instanceof ArrayBuffer) {
          return "arraybuffer";
        }
      };
      exports.checkSupport = function(type) {
        var supported = support[type.toLowerCase()];
        if (!supported) {
          throw new Error(type + " is not supported by this platform");
        }
      };
      exports.MAX_VALUE_16BITS = 65535;
      exports.MAX_VALUE_32BITS = -1;
      exports.pretty = function(str) {
        var res = "", code, i;
        for (i = 0; i < (str || "").length; i++) {
          code = str.charCodeAt(i);
          res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
        }
        return res;
      };
      exports.delay = function(callback, args, self2) {
        scheduleMacrotask(function() {
          callback.apply(self2 || null, args || []);
        });
      };
      exports.inherits = function(ctor, superCtor) {
        var Obj = function() {
        };
        Obj.prototype = superCtor.prototype;
        ctor.prototype = new Obj();
      };
      exports.extend = function() {
        var result = {}, i, attr;
        for (i = 0; i < arguments.length; i++) {
          for (attr in arguments[i]) {
            if (Object.prototype.hasOwnProperty.call(arguments[i], attr) && typeof result[attr] === "undefined") {
              result[attr] = arguments[i][attr];
            }
          }
        }
        return result;
      };
      function isBlob(data) {
        return support.blob && (data instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(data)) !== -1);
      }
      exports.isWebReadableStream = function(data) {
        return !!data && typeof data.getReader === "function" && typeof data.tee === "function";
      };
      exports.readWebStream = function(stream) {
        var reader = stream.getReader();
        var chunks = [];
        var totalLength = 0;
        return new external.Promise(function(resolve, reject) {
          function next() {
            reader.read().then(function(result) {
              if (result.done) {
                var merged = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < chunks.length; i++) {
                  merged.set(chunks[i], offset);
                  offset += chunks[i].length;
                }
                resolve(merged);
                return;
              }
              var chunk = result.value;
              if (!exports.getTypeOf(chunk)) {
                reject(new Error(
                  "The web stream produced a chunk in an unsupported type, only strings, TypedArrays and ArrayBuffers are supported."
                ));
                return;
              }
              chunk = exports.transformTo("uint8array", chunk);
              chunks.push(chunk);
              totalLength += chunk.length;
              next();
            }, reject);
          }
          next();
        });
      };
      exports.prepareContentSync = function(name, data, isBinary, isOptimizedBinaryString, isBase64) {
        var dataType = exports.getTypeOf(data);
        if (!dataType) {
          if (isBlob(data) || exports.isWebReadableStream(data) || data && typeof data.then === "function") {
            throw new Error(
              "Can't read the data of '" + name + "' synchronously: it comes from an asynchronous source (Blob, Promise or stream), please use the async API for it."
            );
          }
          throw new Error(
            "Can't read the data of '" + name + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"
          );
        }
        if (dataType === "arraybuffer") {
          data = exports.transformTo("uint8array", data);
        } else if (dataType === "string") {
          if (isBase64) {
            data = base64.decode(data);
          } else if (isBinary) {
            if (isOptimizedBinaryString !== true) {
              data = string2binary(data);
            }
          }
        }
        return data;
      };
      exports.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {
        var promise = external.Promise.resolve(inputData).then(function(data) {
          if (exports.isWebReadableStream(data)) {
            return exports.readWebStream(data);
          }
          if (isBlob(data) && typeof data.arrayBuffer === "function") {
            return data.arrayBuffer();
          } else if (isBlob(data) && typeof FileReader !== "undefined") {
            return new external.Promise(function(resolve, reject) {
              var reader = new FileReader();
              reader.onload = function(e) {
                resolve(e.target.result);
              };
              reader.onerror = function(e) {
                reject(e.target.error);
              };
              reader.readAsArrayBuffer(data);
            });
          } else {
            return data;
          }
        });
        return promise.then(function(data) {
          return exports.prepareContentSync(name, data, isBinary, isOptimizedBinaryString, isBase64);
        });
      };
    }
  });

  // lib/stream/GenericWorker.js
  var require_GenericWorker = __commonJS({
    "lib/stream/GenericWorker.js"(exports, module) {
      "use strict";
      function GenericWorker(name) {
        this.name = name || "default";
        this.streamInfo = {};
        this.generatedError = null;
        this.extraStreamInfo = {};
        this.isPaused = true;
        this.isFinished = false;
        this.isLocked = false;
        this._listeners = {
          "data": [],
          "end": [],
          "error": []
        };
        this.previous = null;
      }
      GenericWorker.prototype = {
        /**
         * Push a chunk to the next workers.
         * @param {Object} chunk the chunk to push
         */
        push: function(chunk) {
          this.emit("data", chunk);
        },
        /**
         * End the stream.
         * @return {Boolean} true if this call ended the worker, false otherwise.
         */
        end: function() {
          if (this.isFinished) {
            return false;
          }
          this.flush();
          try {
            this.emit("end");
            this.cleanUp();
            this.isFinished = true;
          } catch (e) {
            this.emit("error", e);
          }
          return true;
        },
        /**
         * End the stream with an error.
         * @param {Error} e the error which caused the premature end.
         * @return {Boolean} true if this call ended the worker with an error, false otherwise.
         */
        error: function(e) {
          if (this.isFinished) {
            return false;
          }
          if (this.isPaused) {
            this.generatedError = e;
          } else {
            this.isFinished = true;
            this.emit("error", e);
            if (this.previous) {
              this.previous.error(e);
            }
            this.cleanUp();
          }
          return true;
        },
        /**
         * Add a callback on an event.
         * @param {String} name the name of the event (data, end, error)
         * @param {Function} listener the function to call when the event is triggered
         * @return {GenericWorker} the current object for chainability
         */
        on: function(name, listener) {
          this._listeners[name].push(listener);
          return this;
        },
        /**
         * Clean any references when a worker is ending.
         */
        cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null;
          this._listeners = [];
        },
        /**
         * Trigger an event. This will call registered callback with the provided arg.
         * @param {String} name the name of the event (data, end, error)
         * @param {Object} arg the argument to call the callback with.
         */
        emit: function(name, arg) {
          if (this._listeners[name]) {
            for (var i = 0; i < this._listeners[name].length; i++) {
              this._listeners[name][i].call(this, arg);
            }
          }
        },
        /**
         * Chain a worker with an other.
         * @param {Worker} next the worker receiving events from the current one.
         * @return {worker} the next worker for chainability
         */
        pipe: function(next) {
          return next.registerPrevious(this);
        },
        /**
         * Same as `pipe` in the other direction.
         * Using an API with `pipe(next)` is very easy.
         * Implementing the API with the point of view of the next one registering
         * a source is easier, see the ZipFileWorker.
         * @param {Worker} previous the previous worker, sending events to this one
         * @return {Worker} the current worker for chainability
         */
        registerPrevious: function(previous) {
          if (this.isLocked) {
            throw new Error("The stream '" + this + "' has already been used.");
          }
          this.streamInfo = previous.streamInfo;
          this.mergeStreamInfo();
          this.previous = previous;
          var self2 = this;
          previous.on("data", function(chunk) {
            self2.processChunk(chunk);
          });
          previous.on("end", function() {
            self2.end();
          });
          previous.on("error", function(e) {
            self2.error(e);
          });
          return this;
        },
        /**
         * Pause the stream so it doesn't send events anymore.
         * @return {Boolean} true if this call paused the worker, false otherwise.
         */
        pause: function() {
          if (this.isPaused || this.isFinished) {
            return false;
          }
          this.isPaused = true;
          if (this.previous) {
            this.previous.pause();
          }
          return true;
        },
        /**
         * Resume a paused stream.
         * @return {Boolean} true if this call resumed the worker, false otherwise.
         */
        resume: function() {
          if (!this.isPaused || this.isFinished) {
            return false;
          }
          this.isPaused = false;
          var withError = false;
          if (this.generatedError) {
            this.error(this.generatedError);
            withError = true;
          }
          if (this.previous) {
            this.previous.resume();
          }
          return !withError;
        },
        /**
         * Flush any remaining bytes as the stream is ending.
         */
        flush: function() {
        },
        /**
         * Process a chunk. This is usually the method overridden.
         * @param {Object} chunk the chunk to process.
         */
        processChunk: function(chunk) {
          this.push(chunk);
        },
        /**
         * Add a key/value to be added in the workers chain streamInfo once activated.
         * @param {String} key the key to use
         * @param {Object} value the associated value
         * @return {Worker} the current worker for chainability
         */
        withStreamInfo: function(key, value) {
          this.extraStreamInfo[key] = value;
          this.mergeStreamInfo();
          return this;
        },
        /**
         * Merge this worker's streamInfo into the chain's streamInfo.
         */
        mergeStreamInfo: function() {
          for (var key in this.extraStreamInfo) {
            if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
              continue;
            }
            this.streamInfo[key] = this.extraStreamInfo[key];
          }
        },
        /**
         * Lock the stream to prevent further updates on the workers chain.
         * After calling this method, all calls to pipe will fail.
         */
        lock: function() {
          if (this.isLocked) {
            throw new Error("The stream '" + this + "' has already been used.");
          }
          this.isLocked = true;
          if (this.previous) {
            this.previous.lock();
          }
        },
        /**
         *
         * Pretty print the workers chain.
         */
        toString: function() {
          var me = "Worker " + this.name;
          if (this.previous) {
            return this.previous + " -> " + me;
          } else {
            return me;
          }
        }
      };
      module.exports = GenericWorker;
    }
  });

  // lib/utf8.js
  var require_utf8 = __commonJS({
    "lib/utf8.js"(exports) {
      "use strict";
      var utils = require_utils();
      var support = require_support();
      var nodejsUtils = require_nodejsUtils();
      var GenericWorker = require_GenericWorker();
      var _utf8len = new Array(256);
      for (i = 0; i < 256; i++) {
        _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
      }
      var i;
      _utf8len[254] = _utf8len[254] = 1;
      var string2buf = function(str) {
        var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
        for (m_pos = 0; m_pos < str_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
        }
        if (support.uint8array) {
          buf = new Uint8Array(buf_len);
        } else {
          buf = new Array(buf_len);
        }
        for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          if (c < 128) {
            buf[i2++] = c;
          } else if (c < 2048) {
            buf[i2++] = 192 | c >>> 6;
            buf[i2++] = 128 | c & 63;
          } else if (c < 65536) {
            buf[i2++] = 224 | c >>> 12;
            buf[i2++] = 128 | c >>> 6 & 63;
            buf[i2++] = 128 | c & 63;
          } else {
            buf[i2++] = 240 | c >>> 18;
            buf[i2++] = 128 | c >>> 12 & 63;
            buf[i2++] = 128 | c >>> 6 & 63;
            buf[i2++] = 128 | c & 63;
          }
        }
        return buf;
      };
      var utf8border = function(buf, max) {
        var pos;
        max = max || buf.length;
        if (max > buf.length) {
          max = buf.length;
        }
        pos = max - 1;
        while (pos >= 0 && (buf[pos] & 192) === 128) {
          pos--;
        }
        if (pos < 0) {
          return max;
        }
        if (pos === 0) {
          return max;
        }
        return pos + _utf8len[buf[pos]] > max ? pos : max;
      };
      var buf2string = function(buf) {
        var i2, out, c, c_len;
        var len = buf.length;
        var utf16buf = new Array(len * 2);
        for (out = 0, i2 = 0; i2 < len; ) {
          c = buf[i2++];
          if (c < 128) {
            utf16buf[out++] = c;
            continue;
          }
          c_len = _utf8len[c];
          if (c_len > 4) {
            utf16buf[out++] = 65533;
            i2 += c_len - 1;
            continue;
          }
          c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
          while (c_len > 1 && i2 < len) {
            c = c << 6 | buf[i2++] & 63;
            c_len--;
          }
          if (c_len > 1) {
            utf16buf[out++] = 65533;
            continue;
          }
          if (c < 65536) {
            utf16buf[out++] = c;
          } else {
            c -= 65536;
            utf16buf[out++] = 55296 | c >> 10 & 1023;
            utf16buf[out++] = 56320 | c & 1023;
          }
        }
        if (utf16buf.length !== out) {
          if (utf16buf.subarray) {
            utf16buf = utf16buf.subarray(0, out);
          } else {
            utf16buf.length = out;
          }
        }
        return utils.applyFromCharCode(utf16buf);
      };
      exports.utf8encode = function utf8encode(str) {
        if (support.nodebuffer) {
          return nodejsUtils.newBufferFrom(str, "utf-8");
        }
        return string2buf(str);
      };
      exports.utf8decode = function utf8decode(buf) {
        if (support.nodebuffer) {
          return utils.transformTo("nodebuffer", buf).toString("utf-8");
        }
        buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);
        return buf2string(buf);
      };
      function Utf8DecodeWorker() {
        GenericWorker.call(this, "utf-8 decode");
        this.leftOver = null;
      }
      utils.inherits(Utf8DecodeWorker, GenericWorker);
      Utf8DecodeWorker.prototype.processChunk = function(chunk) {
        var data = utils.transformTo(support.uint8array ? "uint8array" : "array", chunk.data);
        if (this.leftOver && this.leftOver.length) {
          if (support.uint8array) {
            var previousData = data;
            data = new Uint8Array(previousData.length + this.leftOver.length);
            data.set(this.leftOver, 0);
            data.set(previousData, this.leftOver.length);
          } else {
            data = this.leftOver.concat(data);
          }
          this.leftOver = null;
        }
        var nextBoundary = utf8border(data);
        var usableData = data;
        if (nextBoundary !== data.length) {
          if (support.uint8array) {
            usableData = data.subarray(0, nextBoundary);
            this.leftOver = data.subarray(nextBoundary, data.length);
          } else {
            usableData = data.slice(0, nextBoundary);
            this.leftOver = data.slice(nextBoundary, data.length);
          }
        }
        this.push({
          data: exports.utf8decode(usableData),
          meta: chunk.meta
        });
      };
      Utf8DecodeWorker.prototype.flush = function() {
        if (this.leftOver && this.leftOver.length) {
          this.push({
            data: exports.utf8decode(this.leftOver),
            meta: {}
          });
          this.leftOver = null;
        }
      };
      exports.Utf8DecodeWorker = Utf8DecodeWorker;
      function Utf8EncodeWorker() {
        GenericWorker.call(this, "utf-8 encode");
      }
      utils.inherits(Utf8EncodeWorker, GenericWorker);
      Utf8EncodeWorker.prototype.processChunk = function(chunk) {
        this.push({
          data: exports.utf8encode(chunk.data),
          meta: chunk.meta
        });
      };
      exports.Utf8EncodeWorker = Utf8EncodeWorker;
    }
  });

  // lib/reader/DataReader.js
  var require_DataReader = __commonJS({
    "lib/reader/DataReader.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      function DataReader(data) {
        this.data = data;
        this.length = data.length;
        this.index = 0;
        this.zero = 0;
      }
      DataReader.prototype = {
        /**
         * Check that the offset will not go too far.
         * @param {string} offset the additional offset to check.
         * @throws {Error} an Error if the offset is out of bounds.
         */
        checkOffset: function(offset) {
          this.checkIndex(this.index + offset);
        },
        /**
         * Check that the specified index will not be too far.
         * @param {string} newIndex the index to check.
         * @throws {Error} an Error if the index is out of bounds.
         */
        checkIndex: function(newIndex) {
          if (this.length < this.zero + newIndex || newIndex < 0) {
            throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
          }
        },
        /**
         * Change the index.
         * @param {number} newIndex The new index.
         * @throws {Error} if the new index is out of the data.
         */
        setIndex: function(newIndex) {
          this.checkIndex(newIndex);
          this.index = newIndex;
        },
        /**
         * Skip the next n bytes.
         * @param {number} n the number of bytes to skip.
         * @throws {Error} if the new index is out of the data.
         */
        skip: function(n) {
          this.setIndex(this.index + n);
        },
        /**
         * Get the byte at the specified index.
         * @param {number} i the index to use.
         * @return {number} a byte.
         */
        byteAt: function() {
        },
        /**
         * Get the next number with a given byte size.
         * @param {number} size the number of bytes to read.
         * @return {number} the corresponding number.
         */
        readInt: function(size) {
          var result = 0, i;
          this.checkOffset(size);
          if (size > 4) {
            for (i = this.index + size - 1; i >= this.index; i--) {
              result = result * 256 + this.byteAt(i);
            }
          } else {
            for (i = this.index + size - 1; i >= this.index; i--) {
              result = (result << 8) + this.byteAt(i);
            }
          }
          this.index += size;
          return result;
        },
        /**
         * Get the next string with a given byte size.
         * @param {number} size the number of bytes to read.
         * @return {string} the corresponding string.
         */
        readString: function(size) {
          return utils.transformTo("string", this.readData(size));
        },
        /**
         * Get raw data without conversion, <size> bytes.
         * @param {number} size the number of bytes to read.
         * @return {Object} the raw data, implementation specific.
         */
        readData: function() {
        },
        /**
         * Find the last occurrence of a zip signature (4 bytes).
         * @param {string} sig the signature to find.
         * @return {number} the index of the last occurrence, -1 if not found.
         */
        lastIndexOfSignature: function() {
        },
        /**
         * Read the signature (4 bytes) at the current position and compare it with sig.
         * @param {string} sig the expected signature
         * @return {boolean} true if the signature matches, false otherwise.
         */
        readAndCheckSignature: function() {
        },
        /**
         * Get the next date.
         * @return {Date} the date.
         */
        readDate: function() {
          var dostime = this.readInt(4);
          return new Date(Date.UTC(
            (dostime >> 25 & 127) + 1980,
            // year
            (dostime >> 21 & 15) - 1,
            // month
            dostime >> 16 & 31,
            // day
            dostime >> 11 & 31,
            // hour
            dostime >> 5 & 63,
            // minute
            (dostime & 31) << 1
          ));
        }
      };
      module.exports = DataReader;
    }
  });

  // lib/reader/ArrayReader.js
  var require_ArrayReader = __commonJS({
    "lib/reader/ArrayReader.js"(exports, module) {
      "use strict";
      var DataReader = require_DataReader();
      var utils = require_utils();
      function ArrayReader(data) {
        DataReader.call(this, data);
        for (var i = 0; i < this.data.length; i++) {
          data[i] = data[i] & 255;
        }
      }
      utils.inherits(ArrayReader, DataReader);
      ArrayReader.prototype.byteAt = function(i) {
        return this.data[this.zero + i];
      };
      ArrayReader.prototype.lastIndexOfSignature = function(sig) {
        var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3);
        for (var i = this.length - 4; i >= 0; --i) {
          if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
            return i - this.zero;
          }
        }
        return -1;
      };
      ArrayReader.prototype.readAndCheckSignature = function(sig) {
        var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3), data = this.readData(4);
        return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
      };
      ArrayReader.prototype.readData = function(size) {
        this.checkOffset(size);
        if (size === 0) {
          return [];
        }
        var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
        this.index += size;
        return result;
      };
      module.exports = ArrayReader;
    }
  });

  // lib/reader/StringReader.js
  var require_StringReader = __commonJS({
    "lib/reader/StringReader.js"(exports, module) {
      "use strict";
      var DataReader = require_DataReader();
      var utils = require_utils();
      function StringReader(data) {
        DataReader.call(this, data);
      }
      utils.inherits(StringReader, DataReader);
      StringReader.prototype.byteAt = function(i) {
        return this.data.charCodeAt(this.zero + i);
      };
      StringReader.prototype.lastIndexOfSignature = function(sig) {
        return this.data.lastIndexOf(sig) - this.zero;
      };
      StringReader.prototype.readAndCheckSignature = function(sig) {
        var data = this.readData(4);
        return sig === data;
      };
      StringReader.prototype.readData = function(size) {
        this.checkOffset(size);
        var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
        this.index += size;
        return result;
      };
      module.exports = StringReader;
    }
  });

  // lib/reader/Uint8ArrayReader.js
  var require_Uint8ArrayReader = __commonJS({
    "lib/reader/Uint8ArrayReader.js"(exports, module) {
      "use strict";
      var ArrayReader = require_ArrayReader();
      var utils = require_utils();
      function Uint8ArrayReader(data) {
        ArrayReader.call(this, data);
      }
      utils.inherits(Uint8ArrayReader, ArrayReader);
      Uint8ArrayReader.prototype.readData = function(size) {
        this.checkOffset(size);
        if (size === 0) {
          return new Uint8Array(0);
        }
        var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
        this.index += size;
        return result;
      };
      module.exports = Uint8ArrayReader;
    }
  });

  // lib/reader/NodeBufferReader.js
  var require_NodeBufferReader = __commonJS({
    "lib/reader/NodeBufferReader.js"(exports, module) {
      "use strict";
      var Uint8ArrayReader = require_Uint8ArrayReader();
      var utils = require_utils();
      function NodeBufferReader(data) {
        Uint8ArrayReader.call(this, data);
      }
      utils.inherits(NodeBufferReader, Uint8ArrayReader);
      NodeBufferReader.prototype.readData = function(size) {
        this.checkOffset(size);
        var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
        this.index += size;
        return result;
      };
      module.exports = NodeBufferReader;
    }
  });

  // lib/reader/readerFor.js
  var require_readerFor = __commonJS({
    "lib/reader/readerFor.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var support = require_support();
      var ArrayReader = require_ArrayReader();
      var StringReader = require_StringReader();
      var NodeBufferReader = require_NodeBufferReader();
      var Uint8ArrayReader = require_Uint8ArrayReader();
      module.exports = function(data) {
        var type = utils.getTypeOf(data);
        utils.checkSupport(type);
        if (type === "string" && !support.uint8array) {
          return new StringReader(data);
        }
        if (type === "nodebuffer") {
          return new NodeBufferReader(data);
        }
        if (support.uint8array) {
          return new Uint8ArrayReader(utils.transformTo("uint8array", data));
        }
        return new ArrayReader(utils.transformTo("array", data));
      };
    }
  });

  // lib/signature.js
  var require_signature = __commonJS({
    "lib/signature.js"(exports) {
      "use strict";
      exports.LOCAL_FILE_HEADER = "PK";
      exports.CENTRAL_FILE_HEADER = "PK";
      exports.CENTRAL_DIRECTORY_END = "PK";
      exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
      exports.ZIP64_CENTRAL_DIRECTORY_END = "PK";
      exports.DATA_DESCRIPTOR = "PK\x07\b";
    }
  });

  // lib/stream/DataWorker.js
  var require_DataWorker = __commonJS({
    "lib/stream/DataWorker.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      var DEFAULT_BLOCK_SIZE = 16 * 1024;
      function DataWorker(dataP) {
        GenericWorker.call(this, "DataWorker");
        var self2 = this;
        this.dataIsReady = false;
        this.index = 0;
        this.max = 0;
        this.data = null;
        this.type = "";
        this._tickScheduled = false;
        dataP.then(function(data) {
          self2.dataIsReady = true;
          self2.data = data;
          self2.max = data && data.length || 0;
          self2.type = utils.getTypeOf(data);
          if (!self2.isPaused) {
            self2._tickAndRepeat();
          }
        }, function(e) {
          self2.error(e);
        });
      }
      utils.inherits(DataWorker, GenericWorker);
      DataWorker.prototype.cleanUp = function() {
        GenericWorker.prototype.cleanUp.call(this);
        this.data = null;
      };
      DataWorker.prototype.resume = function() {
        if (!GenericWorker.prototype.resume.call(this)) {
          return false;
        }
        if (!this._tickScheduled && this.dataIsReady) {
          this._tickScheduled = true;
          utils.delay(this._tickAndRepeat, [], this);
        }
        return true;
      };
      DataWorker.prototype._tickAndRepeat = function() {
        this._tickScheduled = false;
        if (this.isPaused || this.isFinished) {
          return;
        }
        this._tick();
        if (!this.isFinished) {
          utils.delay(this._tickAndRepeat, [], this);
          this._tickScheduled = true;
        }
      };
      DataWorker.prototype._tick = function() {
        if (this.isPaused || this.isFinished) {
          return false;
        }
        var size = DEFAULT_BLOCK_SIZE;
        var data = null, nextIndex = Math.min(this.max, this.index + size);
        if (this.index >= this.max) {
          return this.end();
        } else {
          switch (this.type) {
            case "string":
              data = this.data.substring(this.index, nextIndex);
              break;
            case "uint8array":
              data = this.data.subarray(this.index, nextIndex);
              break;
            case "array":
            case "nodebuffer":
              data = this.data.slice(this.index, nextIndex);
              break;
          }
          this.index = nextIndex;
          return this.push({
            data,
            meta: {
              percent: this.max ? this.index / this.max * 100 : 0
            }
          });
        }
      };
      module.exports = DataWorker;
    }
  });

  // lib/stream/SyncDataWorker.js
  var require_SyncDataWorker = __commonJS({
    "lib/stream/SyncDataWorker.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      var DataWorker = require_DataWorker();
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
      var driving = false;
      var pending = [];
      SyncDataWorker.prototype.resume = function() {
        if (!GenericWorker.prototype.resume.call(this)) {
          return false;
        }
        this._tickAndRepeat();
        return true;
      };
      SyncDataWorker.prototype._tickAndRepeat = function() {
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
    }
  });

  // lib/crc32.js
  var require_crc32 = __commonJS({
    "lib/crc32.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      function makeTable() {
        var c, table = [];
        for (var n = 0; n < 256; n++) {
          c = n;
          for (var k = 0; k < 8; k++) {
            c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
          }
          table[n] = c;
        }
        return table;
      }
      var crcTable = makeTable();
      function crc32(crc, buf, len, pos) {
        var t = crcTable, end = pos + len;
        crc = crc ^ -1;
        for (var i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
        }
        return crc ^ -1;
      }
      function crc32str(crc, str, len, pos) {
        var t = crcTable, end = pos + len;
        crc = crc ^ -1;
        for (var i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ str.charCodeAt(i)) & 255];
        }
        return crc ^ -1;
      }
      module.exports = function crc32wrapper(input, crc) {
        if (typeof input === "undefined" || !input.length) {
          return 0;
        }
        var isArray = utils.getTypeOf(input) !== "string";
        if (isArray) {
          return crc32(crc | 0, input, input.length, 0);
        } else {
          return crc32str(crc | 0, input, input.length, 0);
        }
      };
    }
  });

  // lib/stream/Crc32Probe.js
  var require_Crc32Probe = __commonJS({
    "lib/stream/Crc32Probe.js"(exports, module) {
      "use strict";
      var GenericWorker = require_GenericWorker();
      var crc32 = require_crc32();
      var utils = require_utils();
      function Crc32Probe() {
        GenericWorker.call(this, "Crc32Probe");
        this.withStreamInfo("crc32", 0);
      }
      utils.inherits(Crc32Probe, GenericWorker);
      Crc32Probe.prototype.processChunk = function(chunk) {
        this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
        this.push(chunk);
      };
      module.exports = Crc32Probe;
    }
  });

  // lib/stream/DataLengthProbe.js
  var require_DataLengthProbe = __commonJS({
    "lib/stream/DataLengthProbe.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      function DataLengthProbe(propName) {
        GenericWorker.call(this, "DataLengthProbe for " + propName);
        this.propName = propName;
        this.withStreamInfo(propName, 0);
      }
      utils.inherits(DataLengthProbe, GenericWorker);
      DataLengthProbe.prototype.processChunk = function(chunk) {
        if (chunk) {
          var length = this.streamInfo[this.propName] || 0;
          this.streamInfo[this.propName] = length + chunk.data.length;
        }
        GenericWorker.prototype.processChunk.call(this, chunk);
      };
      module.exports = DataLengthProbe;
    }
  });

  // lib/compressedObject.js
  var require_compressedObject = __commonJS({
    "lib/compressedObject.js"(exports, module) {
      "use strict";
      var external = require_external();
      var DataWorker = require_DataWorker();
      var SyncDataWorker = require_SyncDataWorker();
      var Crc32Probe = require_Crc32Probe();
      var DataLengthProbe = require_DataLengthProbe();
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
        _rawWorker: function(sync) {
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
        getContentWorker: function(sync) {
          var worker = this._rawWorker(sync).pipe(this.compression.uncompressWorker()).pipe(new DataLengthProbe("data_length"));
          var that = this;
          worker.on("end", function() {
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
        getCompressedWorker: function(sync) {
          return this._rawWorker(sync).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        }
      };
      CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
        return uncompressedWorker.pipe(new Crc32Probe()).pipe(new DataLengthProbe("uncompressedSize")).pipe(compression.compressWorker(compressionOptions)).pipe(new DataLengthProbe("compressedSize")).withStreamInfo("compression", compression);
      };
      module.exports = CompressedObject;
    }
  });

  // node_modules/fflate/lib/browser.cjs
  var require_browser = __commonJS({
    "node_modules/fflate/lib/browser.cjs"(exports) {
      "use strict";
      exports.deflate = deflate;
      exports.deflateSync = deflateSync;
      exports.inflate = inflate;
      exports.inflateSync = inflateSync;
      exports.gzip = gzip;
      exports.compress = gzip;
      exports.gzipSync = gzipSync;
      exports.compressSync = gzipSync;
      exports.gunzip = gunzip;
      exports.gunzipSync = gunzipSync;
      exports.zlib = zlib;
      exports.zlibSync = zlibSync;
      exports.unzlib = unzlib;
      exports.unzlibSync = unzlibSync;
      exports.gzip = gzip;
      exports.compress = gzip;
      exports.decompress = decompress;
      exports.decompressSync = decompressSync;
      exports.strToU8 = strToU8;
      exports.strFromU8 = strFromU8;
      exports.zip = zip;
      exports.zipSync = zipSync;
      exports.unzip = unzip;
      exports.unzipSync = unzipSync;
      var ch2 = {};
      var node_worker_1 = {};
      node_worker_1["default"] = (function(c, id, msg, transfer, cb) {
        var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
          c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
        ], { type: "text/javascript" }))));
        w.onmessage = function(e) {
          var d = e.data, ed = d.$e$;
          if (ed) {
            var err2 = new Error(ed[0]);
            err2["code"] = ed[1];
            err2.stack = ed[2];
            cb(err2, null);
          } else
            cb(null, d);
        };
        w.postMessage(msg, transfer);
        return w;
      });
      var u8 = Uint8Array;
      var u16 = Uint16Array;
      var i32 = Int32Array;
      var fleb = new u8([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        5,
        0,
        /* unused */
        0,
        0,
        /* impossible */
        0
      ]);
      var fdeb = new u8([
        0,
        0,
        0,
        0,
        1,
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        8,
        8,
        9,
        9,
        10,
        10,
        11,
        11,
        12,
        12,
        13,
        13,
        /* unused */
        0,
        0
      ]);
      var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var freb = function(eb, start) {
        var b = new u16(31);
        for (var i2 = 0; i2 < 31; ++i2) {
          b[i2] = start += 1 << eb[i2 - 1];
        }
        var r = new i32(b[30]);
        for (var i2 = 1; i2 < 30; ++i2) {
          for (var j = b[i2]; j < b[i2 + 1]; ++j) {
            r[j] = j - b[i2] << 5 | i2;
          }
        }
        return { b, r };
      };
      var _a = freb(fleb, 2);
      var fl = _a.b;
      var revfl = _a.r;
      fl[28] = 258, revfl[258] = 28;
      var _b = freb(fdeb, 0);
      var fd = _b.b;
      var revfd = _b.r;
      var rev = new u16(32768);
      for (i = 0; i < 32768; ++i) {
        x = (i & 43690) >> 1 | (i & 21845) << 1;
        x = (x & 52428) >> 2 | (x & 13107) << 2;
        x = (x & 61680) >> 4 | (x & 3855) << 4;
        rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
      }
      var x;
      var i;
      var hMap = (function(cd, mb, r) {
        var s = cd.length;
        var i2 = 0;
        var l = new u16(mb);
        for (; i2 < s; ++i2) {
          if (cd[i2])
            ++l[cd[i2] - 1];
        }
        var le = new u16(mb);
        for (i2 = 1; i2 < mb; ++i2) {
          le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
        }
        var co;
        if (r) {
          co = new u16(1 << mb);
          var rvb = 15 - mb;
          for (i2 = 0; i2 < s; ++i2) {
            if (cd[i2]) {
              var sv = i2 << 4 | cd[i2];
              var r_1 = mb - cd[i2];
              var v = le[cd[i2] - 1]++ << r_1;
              for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
                co[rev[v] >> rvb] = sv;
              }
            }
          }
        } else {
          co = new u16(s);
          for (i2 = 0; i2 < s; ++i2) {
            if (cd[i2]) {
              co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
            }
          }
        }
        return co;
      });
      var flt = new u8(288);
      for (i = 0; i < 144; ++i)
        flt[i] = 8;
      var i;
      for (i = 144; i < 256; ++i)
        flt[i] = 9;
      var i;
      for (i = 256; i < 280; ++i)
        flt[i] = 7;
      var i;
      for (i = 280; i < 288; ++i)
        flt[i] = 8;
      var i;
      var fdt = new u8(32);
      for (i = 0; i < 32; ++i)
        fdt[i] = 5;
      var i;
      var flm = /* @__PURE__ */ hMap(flt, 9, 0);
      var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
      var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
      var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
      var max = function(a) {
        var m = a[0];
        for (var i2 = 1; i2 < a.length; ++i2) {
          if (a[i2] > m)
            m = a[i2];
        }
        return m;
      };
      var bits = function(d, p, m) {
        var o = p / 8 | 0;
        return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
      };
      var bits16 = function(d, p) {
        var o = p / 8 | 0;
        return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
      };
      var shft = function(p) {
        return (p + 7) / 8 | 0;
      };
      var slc = function(v, s, e) {
        if (s == null || s < 0)
          s = 0;
        if (e == null || e > v.length)
          e = v.length;
        return new u8(v.subarray(s, e));
      };
      exports.FlateErrorCode = {
        UnexpectedEOF: 0,
        InvalidBlockType: 1,
        InvalidLengthLiteral: 2,
        InvalidDistance: 3,
        StreamFinished: 4,
        NoStreamHandler: 5,
        InvalidHeader: 6,
        NoCallback: 7,
        InvalidUTF8: 8,
        ExtraFieldTooLong: 9,
        InvalidDate: 10,
        FilenameTooLong: 11,
        StreamFinishing: 12,
        InvalidZipData: 13,
        UnknownCompressionMethod: 14
      };
      var ec = [
        "unexpected EOF",
        "invalid block type",
        "invalid length/literal",
        "invalid distance",
        "stream finished",
        "no stream handler",
        ,
        // determined by compression function
        "no callback",
        "invalid UTF-8 data",
        "extra field too long",
        "date not in range 1980-2099",
        "filename too long",
        "stream finishing",
        "invalid zip data"
        // determined by unknown compression method
      ];
      var err = function(ind, msg, nt) {
        var e = new Error(msg || ec[ind]);
        e.code = ind;
        if (Error.captureStackTrace)
          Error.captureStackTrace(e, err);
        if (!nt)
          throw e;
        return e;
      };
      var inflt = function(dat, st, buf, dict) {
        var sl = dat.length, dl = dict ? dict.length : 0;
        if (!sl || st.f && !st.l)
          return buf || new u8(0);
        var noBuf = !buf;
        var resize = noBuf || st.i != 2;
        var noSt = st.i;
        if (noBuf)
          buf = new u8(sl * 3);
        var cbuf = function(l2) {
          var bl = buf.length;
          if (l2 > bl) {
            var nbuf = new u8(Math.max(bl * 2, l2));
            nbuf.set(buf);
            buf = nbuf;
          }
        };
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        var tbts = sl * 8;
        do {
          if (!lm) {
            final = bits(dat, pos, 1);
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
              var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
              if (t > sl) {
                if (noSt)
                  err(0);
                break;
              }
              if (resize)
                cbuf(bt + l);
              buf.set(dat.subarray(s, t), bt);
              st.b = bt += l, st.p = pos = t * 8, st.f = final;
              continue;
            } else if (type == 1)
              lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
              var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
              var tl = hLit + bits(dat, pos + 5, 31) + 1;
              pos += 14;
              var ldt = new u8(tl);
              var clt = new u8(19);
              for (var i2 = 0; i2 < hcLen; ++i2) {
                clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
              }
              pos += hcLen * 3;
              var clb = max(clt), clbmsk = (1 << clb) - 1;
              var clm = hMap(clt, clb, 1);
              for (var i2 = 0; i2 < tl; ) {
                var r = clm[bits(dat, pos, clbmsk)];
                pos += r & 15;
                var s = r >> 4;
                if (s < 16) {
                  ldt[i2++] = s;
                } else {
                  var c = 0, n = 0;
                  if (s == 16)
                    n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
                  else if (s == 17)
                    n = 3 + bits(dat, pos, 7), pos += 3;
                  else if (s == 18)
                    n = 11 + bits(dat, pos, 127), pos += 7;
                  while (n--)
                    ldt[i2++] = c;
                }
              }
              var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
              lbt = max(lt);
              dbt = max(dt);
              lm = hMap(lt, lbt, 1);
              dm = hMap(dt, dbt, 1);
            } else
              err(1);
            if (pos > tbts) {
              if (noSt)
                err(0);
              break;
            }
          }
          if (resize)
            cbuf(bt + 131072);
          var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
          var lpos = pos;
          for (; ; lpos = pos) {
            var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
              if (noSt)
                err(0);
              break;
            }
            if (!c)
              err(2);
            if (sym < 256)
              buf[bt++] = sym;
            else if (sym == 256) {
              lpos = pos, lm = null;
              break;
            } else {
              var add = sym - 254;
              if (sym > 264) {
                var i2 = sym - 257, b = fleb[i2];
                add = bits(dat, pos, (1 << b) - 1) + fl[i2];
                pos += b;
              }
              var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
              if (!d)
                err(3);
              pos += d & 15;
              var dt = fd[dsym];
              if (dsym > 3) {
                var b = fdeb[dsym];
                dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
              }
              if (pos > tbts) {
                if (noSt)
                  err(0);
                break;
              }
              if (resize)
                cbuf(bt + 131072);
              var end = bt + add;
              if (bt < dt) {
                var shift = dl - dt, dend = Math.min(dt, end);
                if (shift + bt < 0)
                  err(3);
                for (; bt < dend; ++bt)
                  buf[bt] = dict[shift + bt];
              }
              for (; bt < end; ++bt)
                buf[bt] = buf[bt - dt];
            }
          }
          st.l = lm, st.p = lpos, st.b = bt, st.f = final;
          if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
      };
      var wbits = function(d, p, v) {
        v <<= p & 7;
        var o = p / 8 | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
      };
      var wbits16 = function(d, p, v) {
        v <<= p & 7;
        var o = p / 8 | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
        d[o + 2] |= v >> 16;
      };
      var hTree = function(d, mb) {
        var t = [];
        for (var i2 = 0; i2 < d.length; ++i2) {
          if (d[i2])
            t.push({ s: i2, f: d[i2] });
        }
        var s = t.length;
        var t2 = t.slice();
        if (!s)
          return { t: et, l: 0 };
        if (s == 1) {
          var v = new u8(t[0].s + 1);
          v[t[0].s] = 1;
          return { t: v, l: 1 };
        }
        t.sort(function(a, b) {
          return a.f - b.f;
        });
        t.push({ s: -1, f: 25001 });
        var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
        t[0] = { s: -1, f: l.f + r.f, l, r };
        while (i1 != s - 1) {
          l = t[t[i0].f < t[i22].f ? i0++ : i22++];
          r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
          t[i1++] = { s: -1, f: l.f + r.f, l, r };
        }
        var maxSym = t2[0].s;
        for (var i2 = 1; i2 < s; ++i2) {
          if (t2[i2].s > maxSym)
            maxSym = t2[i2].s;
        }
        var tr = new u16(maxSym + 1);
        var mbt = ln(t[i1 - 1], tr, 0);
        if (mbt > mb) {
          var i2 = 0, dt = 0;
          var lft = mbt - mb, cst = 1 << lft;
          t2.sort(function(a, b) {
            return tr[b.s] - tr[a.s] || a.f - b.f;
          });
          for (; i2 < s; ++i2) {
            var i2_1 = t2[i2].s;
            if (tr[i2_1] > mb) {
              dt += cst - (1 << mbt - tr[i2_1]);
              tr[i2_1] = mb;
            } else
              break;
          }
          dt >>= lft;
          while (dt > 0) {
            var i2_2 = t2[i2].s;
            if (tr[i2_2] < mb)
              dt -= 1 << mb - tr[i2_2]++ - 1;
            else
              ++i2;
          }
          for (; i2 >= 0 && dt; --i2) {
            var i2_3 = t2[i2].s;
            if (tr[i2_3] == mb) {
              --tr[i2_3];
              ++dt;
            }
          }
          mbt = mb;
        }
        return { t: new u8(tr), l: mbt };
      };
      var ln = function(n, l, d) {
        return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
      };
      var lc = function(c) {
        var s = c.length;
        while (s && !c[--s])
          ;
        var cl = new u16(++s);
        var cli = 0, cln = c[0], cls = 1;
        var w = function(v) {
          cl[cli++] = v;
        };
        for (var i2 = 1; i2 <= s; ++i2) {
          if (c[i2] == cln && i2 != s)
            ++cls;
          else {
            if (!cln && cls > 2) {
              for (; cls > 138; cls -= 138)
                w(32754);
              if (cls > 2) {
                w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
                cls = 0;
              }
            } else if (cls > 3) {
              w(cln), --cls;
              for (; cls > 6; cls -= 6)
                w(8304);
              if (cls > 2)
                w(cls - 3 << 5 | 8208), cls = 0;
            }
            while (cls--)
              w(cln);
            cls = 1;
            cln = c[i2];
          }
        }
        return { c: cl.subarray(0, cli), n: s };
      };
      var clen = function(cf, cl) {
        var l = 0;
        for (var i2 = 0; i2 < cl.length; ++i2)
          l += cf[i2] * cl[i2];
        return l;
      };
      var wfblk = function(out, pos, dat) {
        var s = dat.length;
        var o = shft(pos + 2);
        out[o] = s & 255;
        out[o + 1] = s >> 8;
        out[o + 2] = out[o] ^ 255;
        out[o + 3] = out[o + 1] ^ 255;
        for (var i2 = 0; i2 < s; ++i2)
          out[o + i2 + 4] = dat[i2];
        return (o + 4 + s) * 8;
      };
      var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
        wbits(out, p++, final);
        ++lf[256];
        var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
        var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
        var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
        var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
        var lcfreq = new u16(19);
        for (var i2 = 0; i2 < lclt.length; ++i2)
          ++lcfreq[lclt[i2] & 31];
        for (var i2 = 0; i2 < lcdt.length; ++i2)
          ++lcfreq[lcdt[i2] & 31];
        var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
        var nlcc = 19;
        for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
          ;
        var flen = bl + 5 << 3;
        var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
        var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
        if (bs >= 0 && flen <= ftlen && flen <= dtlen)
          return wfblk(out, p, dat.subarray(bs, bs + bl));
        var lm, ll, dm, dl;
        wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
        if (dtlen < ftlen) {
          lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
          var llm = hMap(lct, mlcb, 0);
          wbits(out, p, nlc - 257);
          wbits(out, p + 5, ndc - 1);
          wbits(out, p + 10, nlcc - 4);
          p += 14;
          for (var i2 = 0; i2 < nlcc; ++i2)
            wbits(out, p + 3 * i2, lct[clim[i2]]);
          p += 3 * nlcc;
          var lcts = [lclt, lcdt];
          for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i2 = 0; i2 < clct.length; ++i2) {
              var len = clct[i2] & 31;
              wbits(out, p, llm[len]), p += lct[len];
              if (len > 15)
                wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
            }
          }
        } else {
          lm = flm, ll = flt, dm = fdm, dl = fdt;
        }
        for (var i2 = 0; i2 < li; ++i2) {
          var sym = syms[i2];
          if (sym > 255) {
            var len = sym >> 18 & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
              wbits(out, p, sym >> 23 & 31), p += fleb[len];
            var dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
              wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
          } else {
            wbits16(out, p, lm[sym]), p += ll[sym];
          }
        }
        wbits16(out, p, lm[256]);
        return p + ll[256];
      };
      var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
      var et = /* @__PURE__ */ new u8(0);
      var dflt = function(dat, lvl, plvl, pre, post, st) {
        var s = st.z || dat.length;
        var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
        var w = o.subarray(pre, o.length - post);
        var lst = st.l;
        var pos = (st.r || 0) & 7;
        if (lvl) {
          if (pos)
            w[0] = st.r >> 3;
          var opt = deo[lvl - 1];
          var n = opt >> 13, c = opt & 8191;
          var msk_1 = (1 << plvl) - 1;
          var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
          var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
          var hsh = function(i3) {
            return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
          };
          var syms = new i32(25e3);
          var lf = new u16(288), df = new u16(32);
          var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
          for (; i2 + 2 < s; ++i2) {
            var hv = hsh(i2);
            var imod = i2 & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            if (wi <= i2) {
              var rem = s - i2;
              if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
                pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
                li = lc_1 = eb = 0, bs = i2;
                for (var j = 0; j < 286; ++j)
                  lf[j] = 0;
                for (var j = 0; j < 30; ++j)
                  df[j] = 0;
              }
              var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
              if (rem > 2 && hv == hsh(i2 - dif)) {
                var maxn = Math.min(n, rem) - 1;
                var maxd = Math.min(32767, i2);
                var ml = Math.min(258, rem);
                while (dif <= maxd && --ch_1 && imod != pimod) {
                  if (dat[i2 + l] == dat[i2 + l - dif]) {
                    var nl = 0;
                    for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                      ;
                    if (nl > l) {
                      l = nl, d = dif;
                      if (nl > maxn)
                        break;
                      var mmd = Math.min(dif, nl - 2);
                      var md = 0;
                      for (var j = 0; j < mmd; ++j) {
                        var ti = i2 - dif + j & 32767;
                        var pti = prev[ti];
                        var cd = ti - pti & 32767;
                        if (cd > md)
                          md = cd, pimod = ti;
                      }
                    }
                  }
                  imod = pimod, pimod = prev[imod];
                  dif += imod - pimod & 32767;
                }
              }
              if (d) {
                syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
                var lin = revfl[l] & 31, din = revfd[d] & 31;
                eb += fleb[lin] + fdeb[din];
                ++lf[257 + lin];
                ++df[din];
                wi = i2 + l;
                ++lc_1;
              } else {
                syms[li++] = dat[i2];
                ++lf[dat[i2]];
              }
            }
          }
          for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
            syms[li++] = dat[i2];
            ++lf[dat[i2]];
          }
          pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
          if (!lst) {
            st.r = pos & 7 | w[pos / 8 | 0] << 3;
            pos -= 7;
            st.h = head, st.p = prev, st.i = i2, st.w = wi;
          }
        } else {
          for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
            var e = i2 + 65535;
            if (e >= s) {
              w[pos / 8 | 0] = lst;
              e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i2, e));
          }
          st.i = s;
        }
        return slc(o, 0, pre + shft(pos) + post);
      };
      var crct = /* @__PURE__ */ (function() {
        var t = new Int32Array(256);
        for (var i2 = 0; i2 < 256; ++i2) {
          var c = i2, k = 9;
          while (--k)
            c = (c & 1 && -306674912) ^ c >>> 1;
          t[i2] = c;
        }
        return t;
      })();
      var crc = function() {
        var c = -1;
        return {
          p: function(d) {
            var cr = c;
            for (var i2 = 0; i2 < d.length; ++i2)
              cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
            c = cr;
          },
          d: function() {
            return ~c;
          }
        };
      };
      var adler = function() {
        var a = 1, b = 0;
        return {
          p: function(d) {
            var n = a, m = b;
            var l = d.length | 0;
            for (var i2 = 0; i2 != l; ) {
              var e = Math.min(i2 + 2655, l);
              for (; i2 < e; ++i2)
                m += n += d[i2];
              n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
          },
          d: function() {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a & 65280) << 8 | (b & 255) << 8 | b >> 8;
          }
        };
      };
      var dopt = function(dat, opt, pre, post, st) {
        if (!st) {
          st = { l: 1 };
          if (opt.dictionary) {
            var dict = opt.dictionary.subarray(-32768);
            var newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
          }
        }
        return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
      };
      var mrg = function(a, b) {
        var o = {};
        for (var k in a)
          o[k] = a[k];
        for (var k in b)
          o[k] = b[k];
        return o;
      };
      var wcln = function(fn, fnStr, td2) {
        var dt = fn();
        var st = fn.toString();
        var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
        for (var i2 = 0; i2 < dt.length; ++i2) {
          var v = dt[i2], k = ks[i2];
          if (typeof v == "function") {
            fnStr += ";" + k + "=";
            var st_1 = v.toString();
            if (v.prototype) {
              if (st_1.indexOf("[native code]") != -1) {
                var spInd = st_1.indexOf(" ", 8) + 1;
                fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
              } else {
                fnStr += st_1;
                for (var t in v.prototype)
                  fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
              }
            } else
              fnStr += st_1;
          } else
            td2[k] = v;
        }
        return fnStr;
      };
      var ch = [];
      var cbfs = function(v) {
        var tl = [];
        for (var k in v) {
          if (v[k].buffer) {
            tl.push((v[k] = new v[k].constructor(v[k])).buffer);
          }
        }
        return tl;
      };
      var wrkr = function(fns, init, id, cb) {
        if (!ch[id]) {
          var fnStr = "", td_1 = {}, m = fns.length - 1;
          for (var i2 = 0; i2 < m; ++i2)
            fnStr = wcln(fns[i2], fnStr, td_1);
          ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
        }
        var td2 = mrg({}, ch[id].e);
        return (0, node_worker_1.default)(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
      };
      var bInflt = function() {
        return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
      };
      var bDflt = function() {
        return [u8, u16, i32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf];
      };
      var gze = function() {
        return [gzh, gzhl, wbytes, crc, crct];
      };
      var guze = function() {
        return [gzs, gzl];
      };
      var zle = function() {
        return [zlh, wbytes, adler];
      };
      var zule = function() {
        return [zls];
      };
      var pbf = function(msg) {
        return postMessage(msg, [msg.buffer]);
      };
      var gopt = function(o) {
        return o && {
          out: o.size && new u8(o.size),
          dictionary: o.dictionary
        };
      };
      var cbify = function(dat, opts, fns, init, id, cb) {
        var w = wrkr(fns, init, id, function(err2, dat2) {
          w.terminate();
          cb(err2, dat2);
        });
        w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
        return function() {
          w.terminate();
        };
      };
      var astrm = function(strm) {
        strm.ondata = function(dat, final) {
          return postMessage([dat, final], [dat.buffer]);
        };
        return function(ev) {
          if (ev.data[0]) {
            strm.push(ev.data[0], ev.data[1]);
            postMessage([ev.data[0].length]);
          } else
            strm.flush(ev.data[1]);
        };
      };
      var astrmify = function(fns, strm, opts, init, id, flush, ext) {
        var t;
        var w = wrkr(fns, init, id, function(err2, dat) {
          if (err2)
            w.terminate(), strm.ondata.call(strm, err2);
          else if (!Array.isArray(dat))
            ext(dat);
          else if (dat.length == 1) {
            strm.queuedSize -= dat[0];
            if (strm.ondrain)
              strm.ondrain(dat[0]);
          } else {
            if (dat[1])
              w.terminate();
            strm.ondata.call(strm, err2, dat[0], dat[1]);
          }
        });
        w.postMessage(opts);
        strm.queuedSize = 0;
        strm.push = function(d, f) {
          if (!strm.ondata)
            err(5);
          if (t)
            strm.ondata(err(4, 0, 1), null, !!f);
          strm.queuedSize += d.length;
          w.postMessage([d, t = f], d.buffer instanceof ArrayBuffer ? [d.buffer] : []);
        };
        strm.terminate = function() {
          w.terminate();
        };
        if (flush) {
          strm.flush = function(sync) {
            w.postMessage([0, sync]);
          };
        }
      };
      var b2 = function(d, b) {
        return d[b] | d[b + 1] << 8;
      };
      var b4 = function(d, b) {
        return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
      };
      var b8 = function(d, b) {
        return b4(d, b) + b4(d, b + 4) * 4294967296;
      };
      var wbytes = function(d, b, v) {
        for (; v; ++b)
          d[b] = v, v >>>= 8;
      };
      var gzh = function(c, o) {
        var fn = o.filename;
        c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3;
        if (o.mtime != 0)
          wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1e3));
        if (fn) {
          c[3] = 8;
          for (var i2 = 0; i2 <= fn.length; ++i2)
            c[i2 + 10] = fn.charCodeAt(i2);
        }
      };
      var gzs = function(d) {
        if (d[0] != 31 || d[1] != 139 || d[2] != 8)
          err(6, "invalid gzip data");
        var flg = d[3];
        var st = 10;
        if (flg & 4)
          st += (d[10] | d[11] << 8) + 2;
        for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
          ;
        return st + (flg & 2);
      };
      var gzl = function(d) {
        var l = d.length;
        return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
      };
      var gzhl = function(o) {
        return 10 + (o.filename ? o.filename.length + 1 : 0);
      };
      var zlh = function(c, o) {
        var lv = o.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
        c[0] = 120, c[1] = fl2 << 6 | (o.dictionary && 32);
        c[1] |= 31 - (c[0] << 8 | c[1]) % 31;
        if (o.dictionary) {
          var h = adler();
          h.p(o.dictionary);
          wbytes(c, 2, h.d());
        }
      };
      var zls = function(d, dict) {
        if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31)
          err(6, "invalid zlib data");
        if ((d[1] >> 5 & 1) == +!dict)
          err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
        return (d[1] >> 3 & 4) + 2;
      };
      function StrmOpt(opts, cb) {
        if (typeof opts == "function")
          cb = opts, opts = {};
        this.ondata = cb;
        return opts;
      }
      var Deflate = /* @__PURE__ */ (function() {
        function Deflate2(opts, cb) {
          if (typeof opts == "function")
            cb = opts, opts = {};
          this.ondata = cb;
          this.o = opts || {};
          this.s = { l: 0, i: 32768, w: 32768, z: 32768 };
          this.b = new u8(98304);
          if (this.o.dictionary) {
            var dict = this.o.dictionary.subarray(-32768);
            this.b.set(dict, 32768 - dict.length);
            this.s.i = 32768 - dict.length;
          }
        }
        Deflate2.prototype.p = function(c, f) {
          this.ondata(dopt(c, this.o, 0, 0, this.s), f);
        };
        Deflate2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (this.s.l)
            err(4);
          var endLen = chunk.length + this.s.z;
          if (endLen > this.b.length) {
            if (endLen > 2 * this.b.length - 32768) {
              var newBuf = new u8(endLen & -32768);
              newBuf.set(this.b.subarray(0, this.s.z));
              this.b = newBuf;
            }
            var split = this.b.length - this.s.z;
            this.b.set(chunk.subarray(0, split), this.s.z);
            this.s.z = this.b.length;
            this.p(this.b, false);
            this.b.set(this.b.subarray(-32768));
            this.b.set(chunk.subarray(split), 32768);
            this.s.z = chunk.length - split + 32768;
            this.s.i = 32766, this.s.w = 32768;
          } else {
            this.b.set(chunk, this.s.z);
            this.s.z += chunk.length;
          }
          this.s.l = final & 1;
          if (this.s.z > this.s.w + 8191 || final) {
            this.p(this.b, final || false);
            this.s.w = this.s.i, this.s.i -= 2;
          }
          if (final) {
            this.s = this.o = {};
            this.b = et;
          }
        };
        Deflate2.prototype.flush = function(sync) {
          if (!this.ondata)
            err(5);
          if (this.s.l)
            err(4);
          this.p(this.b, false);
          this.s.w = this.s.i, this.s.i -= 2;
          if (sync) {
            var c = new u8(6);
            c[0] = this.s.r >> 3;
            var ep = wfblk(c, this.s.r, et);
            this.s.r = 0;
            this.ondata(c.subarray(0, ep >> 3), false);
          }
        };
        return Deflate2;
      })();
      exports.Deflate = Deflate;
      var AsyncDeflate = /* @__PURE__ */ (function() {
        function AsyncDeflate2(opts, cb) {
          astrmify([
            bDflt,
            function() {
              return [astrm, Deflate];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Deflate(ev.data);
            onmessage = astrm(strm);
          }, 6, 1);
        }
        return AsyncDeflate2;
      })();
      exports.AsyncDeflate = AsyncDeflate;
      function deflate(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt
        ], function(ev) {
          return pbf(deflateSync(ev.data[0], ev.data[1]));
        }, 0, cb);
      }
      function deflateSync(data, opts) {
        return dopt(data, opts || {}, 0, 0);
      }
      var Inflate = /* @__PURE__ */ (function() {
        function Inflate2(opts, cb) {
          if (typeof opts == "function")
            cb = opts, opts = {};
          this.ondata = cb;
          var dict = opts && opts.dictionary && opts.dictionary.subarray(-32768);
          this.s = { i: 0, b: dict ? dict.length : 0 };
          this.o = new u8(32768);
          this.p = new u8(0);
          if (dict)
            this.o.set(dict);
        }
        Inflate2.prototype.e = function(c) {
          if (!this.ondata)
            err(5);
          if (this.d)
            err(4);
          if (!this.p.length)
            this.p = c;
          else if (c.length) {
            var n = new u8(this.p.length + c.length);
            n.set(this.p), n.set(c, this.p.length), this.p = n;
          }
        };
        Inflate2.prototype.c = function(final) {
          this.s.i = +(this.d = final || false);
          var bts = this.s.b;
          var dt = inflt(this.p, this.s, this.o);
          this.ondata(slc(dt, bts, this.s.b), this.d);
          this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
          this.p = slc(this.p, this.s.p / 8 | 0), this.s.p &= 7;
        };
        Inflate2.prototype.push = function(chunk, final) {
          this.e(chunk), this.c(final);
        };
        return Inflate2;
      })();
      exports.Inflate = Inflate;
      var AsyncInflate = /* @__PURE__ */ (function() {
        function AsyncInflate2(opts, cb) {
          astrmify([
            bInflt,
            function() {
              return [astrm, Inflate];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Inflate(ev.data);
            onmessage = astrm(strm);
          }, 7, 0);
        }
        return AsyncInflate2;
      })();
      exports.AsyncInflate = AsyncInflate;
      function inflate(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt
        ], function(ev) {
          return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
        }, 1, cb);
      }
      function inflateSync(data, opts) {
        return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
      }
      var Gzip = /* @__PURE__ */ (function() {
        function Gzip2(opts, cb) {
          this.c = crc();
          this.l = 0;
          this.v = 1;
          Deflate.call(this, opts, cb);
        }
        Gzip2.prototype.push = function(chunk, final) {
          this.c.p(chunk);
          this.l += chunk.length;
          Deflate.prototype.push.call(this, chunk, final);
        };
        Gzip2.prototype.p = function(c, f) {
          var raw = dopt(c, this.o, this.v && gzhl(this.o), f && 8, this.s);
          if (this.v)
            gzh(raw, this.o), this.v = 0;
          if (f)
            wbytes(raw, raw.length - 8, this.c.d()), wbytes(raw, raw.length - 4, this.l);
          this.ondata(raw, f);
        };
        Gzip2.prototype.flush = function(sync) {
          Deflate.prototype.flush.call(this, sync);
        };
        return Gzip2;
      })();
      exports.Gzip = Gzip;
      exports.Compress = Gzip;
      var AsyncGzip = /* @__PURE__ */ (function() {
        function AsyncGzip2(opts, cb) {
          astrmify([
            bDflt,
            gze,
            function() {
              return [astrm, Deflate, Gzip];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Gzip(ev.data);
            onmessage = astrm(strm);
          }, 8, 1);
        }
        return AsyncGzip2;
      })();
      exports.AsyncGzip = AsyncGzip;
      exports.AsyncCompress = AsyncGzip;
      function gzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt,
          gze,
          function() {
            return [gzipSync];
          }
        ], function(ev) {
          return pbf(gzipSync(ev.data[0], ev.data[1]));
        }, 2, cb);
      }
      function gzipSync(data, opts) {
        if (!opts)
          opts = {};
        var c = crc(), l = data.length;
        c.p(data);
        var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
        return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
      }
      var Gunzip = /* @__PURE__ */ (function() {
        function Gunzip2(opts, cb) {
          this.v = 1;
          this.r = 0;
          Inflate.call(this, opts, cb);
        }
        Gunzip2.prototype.push = function(chunk, final) {
          Inflate.prototype.e.call(this, chunk);
          this.r += chunk.length;
          if (this.v) {
            var p = this.p.subarray(this.v - 1);
            var s = p.length > 3 ? gzs(p) : 4;
            if (s > p.length) {
              if (!final)
                return;
            } else if (this.v > 1 && this.onmember) {
              this.onmember(this.r - p.length);
            }
            this.p = p.subarray(s), this.v = 0;
          }
          Inflate.prototype.c.call(this, 0);
          if (this.s.f && !this.s.l) {
            this.v = shft(this.s.p) + 9;
            this.s = { i: 0 };
            this.o = new u8(0);
            this.push(new u8(0), final);
          } else if (final) {
            Inflate.prototype.c.call(this, final);
          }
        };
        return Gunzip2;
      })();
      exports.Gunzip = Gunzip;
      var AsyncGunzip = /* @__PURE__ */ (function() {
        function AsyncGunzip2(opts, cb) {
          var _this = this;
          astrmify([
            bInflt,
            guze,
            function() {
              return [astrm, Inflate, Gunzip];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Gunzip(ev.data);
            strm.onmember = function(offset) {
              return postMessage(offset);
            };
            onmessage = astrm(strm);
          }, 9, 0, function(offset) {
            return _this.onmember && _this.onmember(offset);
          });
        }
        return AsyncGunzip2;
      })();
      exports.AsyncGunzip = AsyncGunzip;
      function gunzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt,
          guze,
          function() {
            return [gunzipSync];
          }
        ], function(ev) {
          return pbf(gunzipSync(ev.data[0], ev.data[1]));
        }, 3, cb);
      }
      function gunzipSync(data, opts) {
        var st = gzs(data);
        if (st + 8 > data.length)
          err(6, "invalid gzip data");
        return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
      }
      var Zlib = /* @__PURE__ */ (function() {
        function Zlib2(opts, cb) {
          this.c = adler();
          this.v = 1;
          Deflate.call(this, opts, cb);
        }
        Zlib2.prototype.push = function(chunk, final) {
          this.c.p(chunk);
          Deflate.prototype.push.call(this, chunk, final);
        };
        Zlib2.prototype.p = function(c, f) {
          var raw = dopt(c, this.o, this.v && (this.o.dictionary ? 6 : 2), f && 4, this.s);
          if (this.v)
            zlh(raw, this.o), this.v = 0;
          if (f)
            wbytes(raw, raw.length - 4, this.c.d());
          this.ondata(raw, f);
        };
        Zlib2.prototype.flush = function(sync) {
          Deflate.prototype.flush.call(this, sync);
        };
        return Zlib2;
      })();
      exports.Zlib = Zlib;
      var AsyncZlib = /* @__PURE__ */ (function() {
        function AsyncZlib2(opts, cb) {
          astrmify([
            bDflt,
            zle,
            function() {
              return [astrm, Deflate, Zlib];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Zlib(ev.data);
            onmessage = astrm(strm);
          }, 10, 1);
        }
        return AsyncZlib2;
      })();
      exports.AsyncZlib = AsyncZlib;
      function zlib(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt,
          zle,
          function() {
            return [zlibSync];
          }
        ], function(ev) {
          return pbf(zlibSync(ev.data[0], ev.data[1]));
        }, 4, cb);
      }
      function zlibSync(data, opts) {
        if (!opts)
          opts = {};
        var a = adler();
        a.p(data);
        var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
        return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
      }
      var Unzlib = /* @__PURE__ */ (function() {
        function Unzlib2(opts, cb) {
          Inflate.call(this, opts, cb);
          this.v = opts && opts.dictionary ? 2 : 1;
        }
        Unzlib2.prototype.push = function(chunk, final) {
          Inflate.prototype.e.call(this, chunk);
          if (this.v) {
            if (this.p.length < 6 && !final)
              return;
            this.p = this.p.subarray(zls(this.p, this.v - 1)), this.v = 0;
          }
          if (final) {
            if (this.p.length < 4)
              err(6, "invalid zlib data");
            this.p = this.p.subarray(0, -4);
          }
          Inflate.prototype.c.call(this, final);
        };
        return Unzlib2;
      })();
      exports.Unzlib = Unzlib;
      var AsyncUnzlib = /* @__PURE__ */ (function() {
        function AsyncUnzlib2(opts, cb) {
          astrmify([
            bInflt,
            zule,
            function() {
              return [astrm, Inflate, Unzlib];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Unzlib(ev.data);
            onmessage = astrm(strm);
          }, 11, 0);
        }
        return AsyncUnzlib2;
      })();
      exports.AsyncUnzlib = AsyncUnzlib;
      function unzlib(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt,
          zule,
          function() {
            return [unzlibSync];
          }
        ], function(ev) {
          return pbf(unzlibSync(ev.data[0], gopt(ev.data[1])));
        }, 5, cb);
      }
      function unzlibSync(data, opts) {
        return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
      }
      var Decompress = /* @__PURE__ */ (function() {
        function Decompress2(opts, cb) {
          this.o = StrmOpt.call(this, opts, cb) || {};
          this.G = Gunzip;
          this.I = Inflate;
          this.Z = Unzlib;
        }
        Decompress2.prototype.i = function() {
          var _this = this;
          this.s.ondata = function(dat, final) {
            _this.ondata(dat, final);
          };
        };
        Decompress2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (!this.s) {
            if (this.p && this.p.length) {
              var n = new u8(this.p.length + chunk.length);
              n.set(this.p), n.set(chunk, this.p.length);
            } else
              this.p = chunk;
            if (this.p.length > 2) {
              this.s = this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8 ? new this.G(this.o) : (this.p[0] & 15) != 8 || this.p[0] >> 4 > 7 || (this.p[0] << 8 | this.p[1]) % 31 ? new this.I(this.o) : new this.Z(this.o);
              this.i();
              this.s.push(this.p, final);
              this.p = null;
            }
          } else
            this.s.push(chunk, final);
        };
        return Decompress2;
      })();
      exports.Decompress = Decompress;
      var AsyncDecompress = /* @__PURE__ */ (function() {
        function AsyncDecompress2(opts, cb) {
          Decompress.call(this, opts, cb);
          this.queuedSize = 0;
          this.G = AsyncGunzip;
          this.I = AsyncInflate;
          this.Z = AsyncUnzlib;
        }
        AsyncDecompress2.prototype.i = function() {
          var _this = this;
          this.s.ondata = function(err2, dat, final) {
            _this.ondata(err2, dat, final);
          };
          this.s.ondrain = function(size) {
            _this.queuedSize -= size;
            if (_this.ondrain)
              _this.ondrain(size);
          };
        };
        AsyncDecompress2.prototype.push = function(chunk, final) {
          this.queuedSize += chunk.length;
          Decompress.prototype.push.call(this, chunk, final);
        };
        return AsyncDecompress2;
      })();
      exports.AsyncDecompress = AsyncDecompress;
      function decompress(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzip(data, opts, cb) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflate(data, opts, cb) : unzlib(data, opts, cb);
      }
      function decompressSync(data, opts) {
        return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzipSync(data, opts) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflateSync(data, opts) : unzlibSync(data, opts);
      }
      var fltn = function(d, p, t, o) {
        for (var k in d) {
          var val = d[k], n = p + k, op = o;
          if (Array.isArray(val))
            op = mrg(o, val[1]), val = val[0];
          if (ArrayBuffer.isView(val))
            t[n] = [val, op];
          else {
            t[n += "/"] = [new u8(0), op];
            fltn(val, n, t, o);
          }
        }
      };
      var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
      var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
      var tds = 0;
      try {
        td.decode(et, { stream: true });
        tds = 1;
      } catch (e) {
      }
      var dutf8 = function(d) {
        for (var r = "", i2 = 0; ; ) {
          var c = d[i2++];
          var eb = (c > 127) + (c > 223) + (c > 239);
          if (i2 + eb > d.length)
            return { s: r, r: slc(d, i2 - 1) };
          if (!eb)
            r += String.fromCharCode(c);
          else if (eb == 3) {
            c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
          } else if (eb & 1)
            r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
          else
            r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
        }
      };
      var DecodeUTF8 = /* @__PURE__ */ (function() {
        function DecodeUTF82(cb) {
          this.ondata = cb;
          if (tds)
            this.t = new TextDecoder();
          else
            this.p = et;
        }
        DecodeUTF82.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          final = !!final;
          if (this.t) {
            this.ondata(this.t.decode(chunk, { stream: true }), final);
            if (final) {
              if (this.t.decode().length)
                err(8);
              this.t = null;
            }
            return;
          }
          if (!this.p)
            err(4);
          var dat = new u8(this.p.length + chunk.length);
          dat.set(this.p);
          dat.set(chunk, this.p.length);
          var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
          if (final) {
            if (r.length)
              err(8);
            this.p = null;
          } else
            this.p = r;
          this.ondata(s, final);
        };
        return DecodeUTF82;
      })();
      exports.DecodeUTF8 = DecodeUTF8;
      var EncodeUTF8 = /* @__PURE__ */ (function() {
        function EncodeUTF82(cb) {
          this.ondata = cb;
        }
        EncodeUTF82.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (this.d)
            err(4);
          this.ondata(strToU8(chunk), this.d = final || false);
        };
        return EncodeUTF82;
      })();
      exports.EncodeUTF8 = EncodeUTF8;
      function strToU8(str, latin1) {
        if (latin1) {
          var ar_1 = new u8(str.length);
          for (var i2 = 0; i2 < str.length; ++i2)
            ar_1[i2] = str.charCodeAt(i2);
          return ar_1;
        }
        if (te)
          return te.encode(str);
        var l = str.length;
        var ar = new u8(str.length + (str.length >> 1));
        var ai = 0;
        var w = function(v) {
          ar[ai++] = v;
        };
        for (var i2 = 0; i2 < l; ++i2) {
          if (ai + 5 > ar.length) {
            var n = new u8(ai + 8 + (l - i2 << 1));
            n.set(ar);
            ar = n;
          }
          var c = str.charCodeAt(i2);
          if (c < 128 || latin1)
            w(c);
          else if (c < 2048)
            w(192 | c >> 6), w(128 | c & 63);
          else if (c > 55295 && c < 57344)
            c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
          else
            w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
        }
        return slc(ar, 0, ai);
      }
      function strFromU8(dat, latin1) {
        if (latin1) {
          var r = "";
          for (var i2 = 0; i2 < dat.length; i2 += 16384)
            r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
          return r;
        } else if (td) {
          return td.decode(dat);
        } else {
          var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
          if (r.length)
            err(8);
          return s;
        }
      }
      var dbf = function(l) {
        return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0;
      };
      var slzh = function(d, b) {
        return b + 30 + b2(d, b + 26) + b2(d, b + 28);
      };
      var zh = function(d, b, z) {
        var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
        var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
        return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
      };
      var z64hs = function(d, b, l, z, sc, su, off) {
        var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
        var nf = nsc + nsu + noff;
        if (z && nf) {
          for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
            if (b2(d, b) == 1) {
              return [
                nsc ? b8(d, b + 4 + 8 * nsu) : sc,
                nsu ? b8(d, b + 4) : su,
                noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
                1
              ];
            }
          }
          if (z < 2)
            err(13);
        }
        return [sc, su, off, 0];
      };
      var exfl = function(ex) {
        var le = 0;
        if (ex) {
          for (var k in ex) {
            var l = ex[k].length;
            if (l > 65535)
              err(9);
            le += l + 4;
          }
        }
        return le;
      };
      var wzh = function(d, b, f, fn, u, c, ce, co) {
        var fl2 = fn.length, ex = f.extra, col = co && co.length;
        var exl = exfl(ex);
        wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
        if (ce != null)
          d[b++] = 20, d[b++] = f.os;
        d[b] = 20, b += 2;
        d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
        d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
        var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
        if (y < 0 || y > 119)
          err(10);
        wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
        if (c != -1) {
          wbytes(d, b, f.crc);
          wbytes(d, b + 4, c < 0 ? -c - 2 : c);
          wbytes(d, b + 8, f.size);
        }
        wbytes(d, b + 12, fl2);
        wbytes(d, b + 14, exl), b += 16;
        if (ce != null) {
          wbytes(d, b, col);
          wbytes(d, b + 6, f.attrs);
          wbytes(d, b + 10, ce), b += 14;
        }
        d.set(fn, b);
        b += fl2;
        if (exl) {
          for (var k in ex) {
            var exf = ex[k], l = exf.length;
            wbytes(d, b, +k);
            wbytes(d, b + 2, l);
            d.set(exf, b + 4), b += 4 + l;
          }
        }
        if (col)
          d.set(co, b), b += col;
        return b;
      };
      var wzf = function(o, b, c, d, e) {
        wbytes(o, b, 101010256);
        wbytes(o, b + 8, c);
        wbytes(o, b + 10, c);
        wbytes(o, b + 12, d);
        wbytes(o, b + 16, e);
      };
      var ZipPassThrough = /* @__PURE__ */ (function() {
        function ZipPassThrough2(filename) {
          this.filename = filename;
          this.c = crc();
          this.size = 0;
          this.compression = 0;
        }
        ZipPassThrough2.prototype.process = function(chunk, final) {
          this.ondata(null, chunk, final);
        };
        ZipPassThrough2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          this.c.p(chunk);
          this.size += chunk.length;
          if (final)
            this.crc = this.c.d();
          this.process(chunk, final || false);
        };
        return ZipPassThrough2;
      })();
      exports.ZipPassThrough = ZipPassThrough;
      var ZipDeflate = /* @__PURE__ */ (function() {
        function ZipDeflate2(filename, opts) {
          var _this = this;
          if (!opts)
            opts = {};
          ZipPassThrough.call(this, filename);
          this.d = new Deflate(opts, function(dat, final) {
            _this.ondata(null, dat, final);
          });
          this.compression = 8;
          this.flag = dbf(opts.level);
        }
        ZipDeflate2.prototype.process = function(chunk, final) {
          try {
            this.d.push(chunk, final);
          } catch (e) {
            this.ondata(e, null, final);
          }
        };
        ZipDeflate2.prototype.push = function(chunk, final) {
          ZipPassThrough.prototype.push.call(this, chunk, final);
        };
        return ZipDeflate2;
      })();
      exports.ZipDeflate = ZipDeflate;
      var AsyncZipDeflate = /* @__PURE__ */ (function() {
        function AsyncZipDeflate2(filename, opts) {
          var _this = this;
          if (!opts)
            opts = {};
          ZipPassThrough.call(this, filename);
          this.d = new AsyncDeflate(opts, function(err2, dat, final) {
            _this.ondata(err2, dat, final);
          });
          this.compression = 8;
          this.flag = dbf(opts.level);
          this.terminate = this.d.terminate;
        }
        AsyncZipDeflate2.prototype.process = function(chunk, final) {
          this.d.push(chunk, final);
        };
        AsyncZipDeflate2.prototype.push = function(chunk, final) {
          ZipPassThrough.prototype.push.call(this, chunk, final);
        };
        return AsyncZipDeflate2;
      })();
      exports.AsyncZipDeflate = AsyncZipDeflate;
      var Zip = /* @__PURE__ */ (function() {
        function Zip2(cb) {
          this.ondata = cb;
          this.u = [];
          this.d = 1;
        }
        Zip2.prototype.add = function(file) {
          var _this = this;
          if (!this.ondata)
            err(5);
          if (this.d & 2)
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, false);
          else {
            var f = strToU8(file.filename), fl_1 = f.length;
            var com = file.comment, o = com && strToU8(com);
            var u = fl_1 != file.filename.length || o && com.length != o.length;
            var hl_1 = fl_1 + exfl(file.extra) + 30;
            if (fl_1 > 65535)
              this.ondata(err(11, 0, 1), null, false);
            var header = new u8(hl_1);
            wzh(header, 0, file, f, u, -1);
            var chks_1 = [header];
            var pAll_1 = function() {
              for (var _i = 0, chks_2 = chks_1; _i < chks_2.length; _i++) {
                var chk = chks_2[_i];
                _this.ondata(null, chk, false);
              }
              chks_1 = [];
            };
            var tr_1 = this.d;
            this.d = 0;
            var ind_1 = this.u.length;
            var uf_1 = mrg(file, {
              f,
              u,
              o,
              t: function() {
                if (file.terminate)
                  file.terminate();
              },
              r: function() {
                pAll_1();
                if (tr_1) {
                  var nxt = _this.u[ind_1 + 1];
                  if (nxt)
                    nxt.r();
                  else
                    _this.d = 1;
                }
                tr_1 = 1;
              }
            });
            var cl_1 = 0;
            file.ondata = function(err2, dat, final) {
              if (err2) {
                _this.ondata(err2, dat, final);
                _this.terminate();
              } else {
                cl_1 += dat.length;
                chks_1.push(dat);
                if (final) {
                  var dd = new u8(16);
                  wbytes(dd, 0, 134695760);
                  wbytes(dd, 4, file.crc);
                  wbytes(dd, 8, cl_1);
                  wbytes(dd, 12, file.size);
                  chks_1.push(dd);
                  uf_1.c = cl_1, uf_1.b = hl_1 + cl_1 + 16, uf_1.crc = file.crc, uf_1.size = file.size;
                  if (tr_1)
                    uf_1.r();
                  tr_1 = 1;
                } else if (tr_1)
                  pAll_1();
              }
            };
            this.u.push(uf_1);
          }
        };
        Zip2.prototype.end = function() {
          var _this = this;
          if (this.d & 2) {
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, true);
            return;
          }
          if (this.d)
            this.e();
          else
            this.u.push({
              r: function() {
                if (!(_this.d & 1))
                  return;
                _this.u.splice(-1, 1);
                _this.e();
              },
              t: function() {
              }
            });
          this.d = 3;
        };
        Zip2.prototype.e = function() {
          var bt = 0, l = 0, tl = 0;
          for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
            var f = _a2[_i];
            tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
          }
          var out = new u8(tl + 22);
          for (var _b2 = 0, _c = this.u; _b2 < _c.length; _b2++) {
            var f = _c[_b2];
            wzh(out, bt, f, f.f, f.u, -f.c - 2, l, f.o);
            bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
          }
          wzf(out, bt, this.u.length, tl, l);
          this.ondata(null, out, true);
          this.d = 2;
        };
        Zip2.prototype.terminate = function() {
          for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
            var f = _a2[_i];
            f.t();
          }
          this.d = 2;
        };
        return Zip2;
      })();
      exports.Zip = Zip;
      function zip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        var r = {};
        fltn(data, "", r, opts);
        var k = Object.keys(r);
        var lft = k.length, o = 0, tot = 0;
        var slft = lft, files = new Array(lft);
        var term = [];
        var tAll = function() {
          for (var i3 = 0; i3 < term.length; ++i3)
            term[i3]();
        };
        var cbd = function(a, b) {
          mt(function() {
            cb(a, b);
          });
        };
        mt(function() {
          cbd = cb;
        });
        var cbf = function() {
          var out = new u8(tot + 22), oe = o, cdl = tot - o;
          tot = 0;
          for (var i3 = 0; i3 < slft; ++i3) {
            var f = files[i3];
            try {
              var l = f.c.length;
              wzh(out, tot, f, f.f, f.u, l);
              var badd = 30 + f.f.length + exfl(f.extra);
              var loc = tot + badd;
              out.set(f.c, loc);
              wzh(out, o, f, f.f, f.u, l, tot, f.m), o += 16 + badd + (f.m ? f.m.length : 0), tot = loc + l;
            } catch (e) {
              return cbd(e, null);
            }
          }
          wzf(out, o, files.length, cdl, oe);
          cbd(null, out);
        };
        if (!lft)
          cbf();
        var _loop_1 = function(i3) {
          var fn = k[i3];
          var _a2 = r[fn], file = _a2[0], p = _a2[1];
          var c = crc(), size = file.length;
          c.p(file);
          var f = strToU8(fn), s = f.length;
          var com = p.comment, m = com && strToU8(com), ms = m && m.length;
          var exl = exfl(p.extra);
          var compression = p.level == 0 ? 0 : 8;
          var cbl = function(e, d) {
            if (e) {
              tAll();
              cbd(e, null);
            } else {
              var l = d.length;
              files[i3] = mrg(p, {
                size,
                crc: c.d(),
                c: d,
                f,
                m,
                u: s != fn.length || m && com.length != ms,
                compression
              });
              o += 30 + s + exl + l;
              tot += 76 + 2 * (s + exl) + (ms || 0) + l;
              if (!--lft)
                cbf();
            }
          };
          if (s > 65535)
            cbl(err(11, 0, 1), null);
          if (!compression)
            cbl(null, file);
          else if (size < 16e4) {
            try {
              cbl(null, deflateSync(file, p));
            } catch (e) {
              cbl(e, null);
            }
          } else
            term.push(deflate(file, p, cbl));
        };
        for (var i2 = 0; i2 < slft; ++i2) {
          _loop_1(i2);
        }
        return tAll;
      }
      function zipSync(data, opts) {
        if (!opts)
          opts = {};
        var r = {};
        var files = [];
        fltn(data, "", r, opts);
        var o = 0;
        var tot = 0;
        for (var fn in r) {
          var _a2 = r[fn], file = _a2[0], p = _a2[1];
          var compression = p.level == 0 ? 0 : 8;
          var f = strToU8(fn), s = f.length;
          var com = p.comment, m = com && strToU8(com), ms = m && m.length;
          var exl = exfl(p.extra);
          if (s > 65535)
            err(11);
          var d = compression ? deflateSync(file, p) : file, l = d.length;
          var c = crc();
          c.p(file);
          files.push(mrg(p, {
            size: file.length,
            crc: c.d(),
            c: d,
            f,
            m,
            u: s != fn.length || m && com.length != ms,
            o,
            compression
          }));
          o += 30 + s + exl + l;
          tot += 76 + 2 * (s + exl) + (ms || 0) + l;
        }
        var out = new u8(tot + 22), oe = o, cdl = tot - o;
        for (var i2 = 0; i2 < files.length; ++i2) {
          var f = files[i2];
          wzh(out, f.o, f, f.f, f.u, f.c.length);
          var badd = 30 + f.f.length + exfl(f.extra);
          out.set(f.c, f.o + badd);
          wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
        }
        wzf(out, o, files.length, cdl, oe);
        return out;
      }
      var UnzipPassThrough = /* @__PURE__ */ (function() {
        function UnzipPassThrough2() {
        }
        UnzipPassThrough2.prototype.push = function(chunk, final) {
          this.ondata(null, chunk, final);
        };
        UnzipPassThrough2.compression = 0;
        return UnzipPassThrough2;
      })();
      exports.UnzipPassThrough = UnzipPassThrough;
      var UnzipInflate = /* @__PURE__ */ (function() {
        function UnzipInflate2() {
          var _this = this;
          this.i = new Inflate(function(dat, final) {
            _this.ondata(null, dat, final);
          });
        }
        UnzipInflate2.prototype.push = function(chunk, final) {
          try {
            this.i.push(chunk, final);
          } catch (e) {
            this.ondata(e, null, final);
          }
        };
        UnzipInflate2.compression = 8;
        return UnzipInflate2;
      })();
      exports.UnzipInflate = UnzipInflate;
      var AsyncUnzipInflate = /* @__PURE__ */ (function() {
        function AsyncUnzipInflate2(_, sz) {
          var _this = this;
          if (sz < 32e4) {
            this.i = new Inflate(function(dat, final) {
              _this.ondata(null, dat, final);
            });
          } else {
            this.i = new AsyncInflate(function(err2, dat, final) {
              _this.ondata(err2, dat, final);
            });
            this.terminate = this.i.terminate;
          }
        }
        AsyncUnzipInflate2.prototype.push = function(chunk, final) {
          if (this.i.terminate)
            chunk = slc(chunk, 0);
          this.i.push(chunk, final);
        };
        AsyncUnzipInflate2.compression = 8;
        return AsyncUnzipInflate2;
      })();
      exports.AsyncUnzipInflate = AsyncUnzipInflate;
      var Unzip = /* @__PURE__ */ (function() {
        function Unzip2(cb) {
          this.onfile = cb;
          this.k = [];
          this.o = {
            0: UnzipPassThrough
          };
          this.p = et;
        }
        Unzip2.prototype.push = function(chunk, final) {
          var _this = this;
          if (!this.onfile)
            err(5);
          if (!this.p)
            err(4);
          if (this.c > 0) {
            var len = Math.min(this.c, chunk.length);
            var toAdd = chunk.subarray(0, len);
            this.c -= len;
            if (this.d)
              this.d.push(toAdd, !this.c);
            else
              this.k[0].push(toAdd);
            chunk = chunk.subarray(len);
            if (chunk.length)
              return this.push(chunk, final);
          } else {
            var f = 0, i2 = 0, is = void 0, buf = void 0;
            if (!this.p.length)
              buf = chunk;
            else if (!chunk.length)
              buf = this.p;
            else {
              buf = new u8(this.p.length + chunk.length);
              buf.set(this.p), buf.set(chunk, this.p.length);
            }
            var l = buf.length, oc = this.c, add = oc && this.d;
            var _loop_2 = function() {
              var sig = b4(buf, i2);
              if (sig == 67324752) {
                f = 1, is = i2;
                this_1.d = null;
                this_1.c = 0;
                var bf = b2(buf, i2 + 6), cmp_1 = b2(buf, i2 + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i2 + 26), es = b2(buf, i2 + 28);
                if (l > i2 + 30 + fnl + es) {
                  var chks_3 = [];
                  this_1.k.unshift(chks_3);
                  f = 2;
                  var lsc = b4(buf, i2 + 18), lsu = b4(buf, i2 + 22);
                  var fn_1 = strFromU8(buf.subarray(i2 + 30, i2 += 30 + fnl), !u);
                  var _a2 = z64hs(buf, i2, es, 2, lsc, lsu, 0), sc_1 = _a2[0], su_1 = _a2[1], z64 = _a2[3];
                  if (dd)
                    sc_1 = -1 - z64;
                  i2 += es;
                  this_1.c = sc_1;
                  var d_1;
                  var file_1 = {
                    name: fn_1,
                    compression: cmp_1,
                    start: function() {
                      if (!file_1.ondata)
                        err(5);
                      if (!sc_1)
                        file_1.ondata(null, et, true);
                      else {
                        var ctr = _this.o[cmp_1];
                        if (!ctr)
                          file_1.ondata(err(14, "unknown compression type " + cmp_1, 1), null, false);
                        d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                        d_1.ondata = function(err2, dat3, final2) {
                          file_1.ondata(err2, dat3, final2);
                        };
                        for (var _i = 0, chks_4 = chks_3; _i < chks_4.length; _i++) {
                          var dat2 = chks_4[_i];
                          d_1.push(dat2, false);
                        }
                        if (_this.k[0] == chks_3 && _this.c)
                          _this.d = d_1;
                        else
                          d_1.push(et, true);
                      }
                    },
                    terminate: function() {
                      if (d_1 && d_1.terminate)
                        d_1.terminate();
                    }
                  };
                  if (sc_1 >= 0)
                    file_1.size = sc_1, file_1.originalSize = su_1;
                  this_1.onfile(file_1);
                }
                return "break";
              } else if (oc) {
                if (sig == 134695760) {
                  is = i2 += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
                  return "break";
                } else if (sig == 33639248) {
                  is = i2 -= 4, f = 3, this_1.c = 0;
                  return "break";
                }
              }
            };
            var this_1 = this;
            for (; i2 < l - 4; ++i2) {
              var state_1 = _loop_2();
              if (state_1 === "break")
                break;
            }
            this.p = et;
            if (oc < 0) {
              var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 134695760 && 4)) : buf.subarray(0, i2);
              if (add)
                add.push(dat, !!f);
              else
                this.k[+(f == 2)].push(dat);
            }
            if (f & 2)
              return this.push(buf.subarray(i2), final);
            this.p = buf.subarray(i2);
          }
          if (final) {
            if (this.c)
              err(13);
            this.p = null;
          }
        };
        Unzip2.prototype.register = function(decoder) {
          this.o[decoder.compression] = decoder;
        };
        return Unzip2;
      })();
      exports.Unzip = Unzip;
      var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
        fn();
      };
      function unzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        var term = [];
        var tAll = function() {
          for (var i3 = 0; i3 < term.length; ++i3)
            term[i3]();
        };
        var files = {};
        var cbd = function(a, b) {
          mt(function() {
            cb(a, b);
          });
        };
        mt(function() {
          cbd = cb;
        });
        var e = data.length - 22;
        for (; b4(data, e) != 101010256; --e) {
          if (!e || data.length - e > 65558) {
            cbd(err(13, 0, 1), null);
            return tAll;
          }
        }
        ;
        var lft = b2(data, e + 8);
        if (lft) {
          var c = lft;
          var o = b4(data, e + 16);
          var z = b4(data, e - 20) == 117853008;
          if (z) {
            var ze = b4(data, e - 12);
            z = b4(data, ze) == 101075792;
            if (z) {
              c = lft = b4(data, ze + 32);
              o = b4(data, ze + 48);
            }
          }
          var fltr = opts && opts.filter;
          var _loop_3 = function(i3) {
            var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
            o = no;
            var cbl = function(e2, d) {
              if (e2) {
                tAll();
                cbd(e2, null);
              } else {
                if (d)
                  files[fn] = d;
                if (!--lft)
                  cbd(null, files);
              }
            };
            if (!fltr || fltr({
              name: fn,
              size: sc,
              originalSize: su,
              compression: c_1
            })) {
              if (!c_1)
                cbl(null, slc(data, b, b + sc));
              else if (c_1 == 8) {
                var infl = data.subarray(b, b + sc);
                if (su < 524288 || sc > 0.8 * su) {
                  try {
                    cbl(null, inflateSync(infl, { out: new u8(su) }));
                  } catch (e2) {
                    cbl(e2, null);
                  }
                } else
                  term.push(inflate(infl, { size: su }, cbl));
              } else
                cbl(err(14, "unknown compression type " + c_1, 1), null);
            } else
              cbl(null, null);
          };
          for (var i2 = 0; i2 < c; ++i2) {
            _loop_3(i2);
          }
        } else
          cbd(null, {});
        return tAll;
      }
      function unzipSync(data, opts) {
        var files = {};
        var e = data.length - 22;
        for (; b4(data, e) != 101010256; --e) {
          if (!e || data.length - e > 65558)
            err(13);
        }
        ;
        var c = b2(data, e + 8);
        if (!c)
          return {};
        var o = b4(data, e + 16);
        var z = b4(data, e - 20) == 117853008;
        if (z) {
          var ze = b4(data, e - 12);
          z = b4(data, ze) == 101075792;
          if (z) {
            c = b4(data, ze + 32);
            o = b4(data, ze + 48);
          }
        }
        var fltr = opts && opts.filter;
        for (var i2 = 0; i2 < c; ++i2) {
          var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
          o = no;
          if (!fltr || fltr({
            name: fn,
            size: sc,
            originalSize: su,
            compression: c_2
          })) {
            if (!c_2)
              files[fn] = slc(data, b, b + sc);
            else if (c_2 == 8)
              files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
            else
              err(14, "unknown compression type " + c_2);
          }
        }
        return files;
      }
    }
  });

  // lib/flate.js
  var require_flate = __commonJS({
    "lib/flate.js"(exports) {
      "use strict";
      var fflate = require_browser();
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      exports.magic = "\b\0";
      function FlateWorker(action, options) {
        GenericWorker.call(this, "FlateWorker/" + action);
        this._flate = null;
        this._action = action;
        this._options = options || {};
        this.meta = {};
      }
      utils.inherits(FlateWorker, GenericWorker);
      FlateWorker.prototype.processChunk = function(chunk) {
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
      FlateWorker.prototype.flush = function() {
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
      FlateWorker.prototype.cleanUp = function() {
        GenericWorker.prototype.cleanUp.call(this);
        this._flate = null;
      };
      FlateWorker.prototype._createFlate = function() {
        var self2 = this;
        var opts = {};
        var level = this._options.level;
        if (level !== void 0 && level !== null && level !== -1) {
          opts.level = level;
        }
        this._flate = new fflate[this._action](opts);
        this._flate.ondata = function(data) {
          if (!data || !data.length) {
            return;
          }
          self2.push({
            data,
            meta: self2.meta
          });
        };
      };
      exports.compressWorker = function(compressionOptions) {
        return new FlateWorker("Deflate", compressionOptions);
      };
      exports.uncompressWorker = function() {
        return new FlateWorker("Inflate", {});
      };
    }
  });

  // lib/compressions.js
  var require_compressions = __commonJS({
    "lib/compressions.js"(exports) {
      "use strict";
      var GenericWorker = require_GenericWorker();
      exports.STORE = {
        magic: "\0\0",
        compressWorker: function() {
          return new GenericWorker("STORE compression");
        },
        uncompressWorker: function() {
          return new GenericWorker("STORE decompression");
        }
      };
      exports.DEFLATE = require_flate();
    }
  });

  // lib/zipEntry.js
  var require_zipEntry = __commonJS({
    "lib/zipEntry.js"(exports, module) {
      "use strict";
      var readerFor = require_readerFor();
      var utils = require_utils();
      var CompressedObject = require_compressedObject();
      var crc32fn = require_crc32();
      var utf8 = require_utf8();
      var compressions = require_compressions();
      var support = require_support();
      var MADE_BY_DOS = 0;
      var MADE_BY_UNIX = 3;
      var findCompression = function(compressionMethod) {
        for (var method in compressions) {
          if (!Object.prototype.hasOwnProperty.call(compressions, method)) {
            continue;
          }
          if (compressions[method].magic === compressionMethod) {
            return compressions[method];
          }
        }
        return null;
      };
      function ZipEntry(options, loadOptions) {
        this.options = options;
        this.loadOptions = loadOptions;
      }
      ZipEntry.prototype = {
        /**
         * say if the file is encrypted.
         * @return {boolean} true if the file is encrypted, false otherwise.
         */
        isEncrypted: function() {
          return (this.bitFlag & 1) === 1;
        },
        /**
         * say if the file has utf-8 filename/comment.
         * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
         */
        useUTF8: function() {
          return (this.bitFlag & 2048) === 2048;
        },
        /**
         * Read the local part of a zip file and add the info in this object.
         * @param {DataReader} reader the reader to use.
         */
        readLocalPart: function(reader) {
          var compression, localExtraFieldsLength;
          reader.skip(22);
          this.fileNameLength = reader.readInt(2);
          localExtraFieldsLength = reader.readInt(2);
          this.fileName = reader.readData(this.fileNameLength);
          reader.skip(localExtraFieldsLength);
          if (this.compressedSize === -1 || this.uncompressedSize === -1) {
            throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          }
          compression = findCompression(this.compressionMethod);
          if (compression === null) {
            throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
          }
          this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
        },
        /**
         * Read the central part of a zip file and add the info in this object.
         * @param {DataReader} reader the reader to use.
         */
        readCentralPart: function(reader) {
          this.versionMadeBy = reader.readInt(2);
          reader.skip(2);
          this.bitFlag = reader.readInt(2);
          this.compressionMethod = reader.readString(2);
          this.date = reader.readDate();
          this.crc32 = reader.readInt(4);
          this.compressedSize = reader.readInt(4);
          this.uncompressedSize = reader.readInt(4);
          var fileNameLength = reader.readInt(2);
          this.extraFieldsLength = reader.readInt(2);
          this.fileCommentLength = reader.readInt(2);
          this.diskNumberStart = reader.readInt(2);
          this.internalFileAttributes = reader.readInt(2);
          this.externalFileAttributes = reader.readInt(4);
          this.localHeaderOffset = reader.readInt(4);
          if (this.isEncrypted()) {
            throw new Error("Encrypted zip are not supported");
          }
          reader.skip(fileNameLength);
          this.readExtraFields(reader);
          this.parseZIP64ExtraField(reader);
          this.fileComment = reader.readData(this.fileCommentLength);
        },
        /**
         * Parse the external file attributes and get the unix/dos permissions.
         */
        processAttributes: function() {
          this.unixPermissions = null;
          this.dosPermissions = null;
          var madeBy = this.versionMadeBy >> 8;
          this.dir = this.externalFileAttributes & 16 ? true : false;
          if (madeBy === MADE_BY_DOS) {
            this.dosPermissions = this.externalFileAttributes & 63;
          }
          if (madeBy === MADE_BY_UNIX) {
            this.unixPermissions = this.externalFileAttributes >> 16 & 65535;
          }
          if (!this.dir && this.fileNameStr.slice(-1) === "/") {
            this.dir = true;
          }
        },
        /**
         * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
         * @param {DataReader} reader the reader to use.
         */
        parseZIP64ExtraField: function() {
          if (!this.extraFields[1]) {
            return;
          }
          var extraReader = readerFor(this.extraFields[1].value);
          if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
            this.uncompressedSize = extraReader.readInt(8);
          }
          if (this.compressedSize === utils.MAX_VALUE_32BITS) {
            this.compressedSize = extraReader.readInt(8);
          }
          if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
            this.localHeaderOffset = extraReader.readInt(8);
          }
          if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
            this.diskNumberStart = extraReader.readInt(4);
          }
        },
        /**
         * Read the central part of a zip file and add the info in this object.
         * @param {DataReader} reader the reader to use.
         */
        readExtraFields: function(reader) {
          var end = reader.index + this.extraFieldsLength, extraFieldId, extraFieldLength, extraFieldValue;
          if (!this.extraFields) {
            this.extraFields = {};
          }
          while (reader.index + 4 < end) {
            extraFieldId = reader.readInt(2);
            extraFieldLength = reader.readInt(2);
            extraFieldValue = reader.readData(extraFieldLength);
            this.extraFields[extraFieldId] = {
              id: extraFieldId,
              length: extraFieldLength,
              value: extraFieldValue
            };
          }
          reader.setIndex(end);
        },
        /**
         * Apply an UTF8 transformation if needed.
         */
        handleUTF8: function() {
          var decodeParamType = support.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) {
            this.fileNameStr = utf8.utf8decode(this.fileName);
            this.fileCommentStr = utf8.utf8decode(this.fileComment);
          } else {
            var upath = this.findExtraFieldUnicodePath();
            if (upath !== null) {
              this.fileNameStr = upath;
            } else {
              var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
            }
            var ucomment = this.findExtraFieldUnicodeComment();
            if (ucomment !== null) {
              this.fileCommentStr = ucomment;
            } else {
              var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
            }
          }
        },
        /**
         * Find the unicode path declared in the extra field, if any.
         * @return {String} the unicode path, null otherwise.
         */
        findExtraFieldUnicodePath: function() {
          var upathField = this.extraFields[28789];
          if (upathField) {
            var extraReader = readerFor(upathField.value);
            if (extraReader.readInt(1) !== 1) {
              return null;
            }
            if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
              return null;
            }
            return utf8.utf8decode(extraReader.readData(upathField.length - 5));
          }
          return null;
        },
        /**
         * Find the unicode comment declared in the extra field, if any.
         * @return {String} the unicode comment, null otherwise.
         */
        findExtraFieldUnicodeComment: function() {
          var ucommentField = this.extraFields[25461];
          if (ucommentField) {
            var extraReader = readerFor(ucommentField.value);
            if (extraReader.readInt(1) !== 1) {
              return null;
            }
            if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
              return null;
            }
            return utf8.utf8decode(extraReader.readData(ucommentField.length - 5));
          }
          return null;
        }
      };
      module.exports = ZipEntry;
    }
  });

  // lib/zipEntries.js
  var require_zipEntries = __commonJS({
    "lib/zipEntries.js"(exports, module) {
      "use strict";
      var readerFor = require_readerFor();
      var utils = require_utils();
      var sig = require_signature();
      var ZipEntry = require_zipEntry();
      var support = require_support();
      function ZipEntries(loadOptions) {
        this.files = [];
        this.loadOptions = loadOptions;
      }
      ZipEntries.prototype = {
        /**
         * Check that the reader is on the specified signature.
         * @param {string} expectedSignature the expected signature.
         * @throws {Error} if it is an other signature.
         */
        checkSignature: function(expectedSignature) {
          if (!this.reader.readAndCheckSignature(expectedSignature)) {
            this.reader.index -= 4;
            var signature = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
          }
        },
        /**
         * Check if the given signature is at the given index.
         * @param {number} askedIndex the index to check.
         * @param {string} expectedSignature the signature to expect.
         * @return {boolean} true if the signature is here, false otherwise.
         */
        isSignature: function(askedIndex, expectedSignature) {
          var currentIndex = this.reader.index;
          this.reader.setIndex(askedIndex);
          var signature = this.reader.readString(4);
          var result = signature === expectedSignature;
          this.reader.setIndex(currentIndex);
          return result;
        },
        /**
         * Read the end of the central directory.
         */
        readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2);
          this.diskWithCentralDirStart = this.reader.readInt(2);
          this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
          this.centralDirRecords = this.reader.readInt(2);
          this.centralDirSize = this.reader.readInt(4);
          this.centralDirOffset = this.reader.readInt(4);
          this.zipCommentLength = this.reader.readInt(2);
          var zipComment = this.reader.readData(this.zipCommentLength);
          var decodeParamType = support.uint8array ? "uint8array" : "array";
          var decodeContent = utils.transformTo(decodeParamType, zipComment);
          this.zipComment = this.loadOptions.decodeFileName(decodeContent);
        },
        /**
         * Read the end of the Zip 64 central directory.
         * Not merged with the method readEndOfCentral :
         * The end of central can coexist with its Zip64 brother,
         * I don't want to read the wrong number of bytes !
         */
        readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8);
          this.reader.skip(4);
          this.diskNumber = this.reader.readInt(4);
          this.diskWithCentralDirStart = this.reader.readInt(4);
          this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
          this.centralDirRecords = this.reader.readInt(8);
          this.centralDirSize = this.reader.readInt(8);
          this.centralDirOffset = this.reader.readInt(8);
          this.zip64ExtensibleData = {};
          var extraDataSize = this.zip64EndOfCentralSize - 44, index = 0, extraFieldId, extraFieldLength, extraFieldValue;
          while (index < extraDataSize) {
            extraFieldId = this.reader.readInt(2);
            extraFieldLength = this.reader.readInt(4);
            extraFieldValue = this.reader.readData(extraFieldLength);
            this.zip64ExtensibleData[extraFieldId] = {
              id: extraFieldId,
              length: extraFieldLength,
              value: extraFieldValue
            };
          }
        },
        /**
         * Read the end of the Zip 64 central directory locator.
         */
        readBlockZip64EndOfCentralLocator: function() {
          this.diskWithZip64CentralDirStart = this.reader.readInt(4);
          this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
          this.disksCount = this.reader.readInt(4);
          if (this.disksCount > 1) {
            throw new Error("Multi-volumes zip are not supported");
          }
        },
        /**
         * Read the local files, based on the offset read in the central part.
         */
        readLocalFiles: function() {
          var i, file;
          for (i = 0; i < this.files.length; i++) {
            file = this.files[i];
            this.reader.setIndex(file.localHeaderOffset);
            this.checkSignature(sig.LOCAL_FILE_HEADER);
            file.readLocalPart(this.reader);
            file.handleUTF8();
            file.processAttributes();
          }
        },
        /**
         * Read the central directory.
         */
        readCentralDir: function() {
          var file;
          this.reader.setIndex(this.centralDirOffset);
          while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
            file = new ZipEntry({
              zip64: this.zip64
            }, this.loadOptions);
            file.readCentralPart(this.reader);
            this.files.push(file);
          }
          if (this.centralDirRecords !== this.files.length) {
            if (this.centralDirRecords !== 0 && this.files.length === 0) {
              throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
            } else {
            }
          }
        },
        /**
         * Read the end of central directory.
         */
        readEndOfCentral: function() {
          var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
          if (offset < 0) {
            var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
            if (isGarbage) {
              throw new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
            } else {
              throw new Error("Corrupted zip: can't find end of central directory");
            }
          }
          this.reader.setIndex(offset);
          var endOfCentralDirOffset = offset;
          this.checkSignature(sig.CENTRAL_DIRECTORY_END);
          this.readBlockEndOfCentral();
          if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
            this.zip64 = true;
            offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            if (offset < 0) {
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            }
            this.reader.setIndex(offset);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            this.readBlockZip64EndOfCentralLocator();
            if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
              this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
              if (this.relativeOffsetEndOfZip64CentralDir < 0) {
                throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
              }
            }
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            this.readBlockZip64EndOfCentral();
          }
          var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
          if (this.zip64) {
            expectedEndOfCentralDirOffset += 20;
            expectedEndOfCentralDirOffset += 12 + this.zip64EndOfCentralSize;
          }
          var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
          if (extraBytes > 0) {
            if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
            } else {
              this.reader.zero = extraBytes;
            }
          } else if (extraBytes < 0) {
            throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
          }
        },
        prepareReader: function(data) {
          this.reader = readerFor(data);
        },
        /**
         * Read a zip file and create ZipEntries.
         * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
         */
        load: function(data) {
          this.prepareReader(data);
          this.readEndOfCentral();
          this.readCentralDir();
          this.readLocalFiles();
        }
      };
      module.exports = ZipEntries;
    }
  });

  // lib/load.js
  var require_load = __commonJS({
    "lib/load.js"(exports) {
      "use strict";
      var utils = require_utils();
      var external = require_external();
      var utf8 = require_utf8();
      var ZipEntries = require_zipEntries();
      var Crc32Probe = require_Crc32Probe();
      var nodejsUtils = require_nodejsUtils();
      function extendLoadOptions(options) {
        return utils.extend(options || {}, {
          base64: false,
          checkCRC32: false,
          optimizedBinaryString: false,
          createFolders: false,
          decodeFileName: utf8.utf8decode
        });
      }
      function checkEntryCRC32(zipEntry) {
        return new external.Promise(function(resolve, reject) {
          var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
          worker.on("error", function(e) {
            reject(e);
          }).on("end", function() {
            if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
              reject(new Error("Corrupted zip : CRC32 mismatch"));
            } else {
              resolve();
            }
          }).resume();
        });
      }
      function checkEntryCRC32Sync(zipEntry) {
        var error = null;
        var worker = zipEntry.decompressed.getContentWorker(true).pipe(new Crc32Probe());
        worker.on("error", function(e) {
          error = e;
        }).on("end", function() {
          if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
            error = new Error("Corrupted zip : CRC32 mismatch");
          }
        }).resume();
        if (error) {
          throw error;
        }
      }
      function parseEntries(data, options) {
        var zipEntries = new ZipEntries(options);
        zipEntries.load(data);
        return zipEntries;
      }
      function addFiles(zip, zipEntries, options) {
        var files = zipEntries.files;
        for (var i = 0; i < files.length; i++) {
          var input = files[i];
          var unsafeName = input.fileNameStr;
          var safeName = utils.resolve(input.fileNameStr);
          zip.file(safeName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment: input.fileCommentStr.length ? input.fileCommentStr : null,
            unixPermissions: input.unixPermissions,
            dosPermissions: input.dosPermissions,
            createFolders: options.createFolders
          });
          if (!input.dir) {
            zip.file(safeName).unsafeOriginalName = unsafeName;
          }
        }
        if (zipEntries.zipComment.length) {
          zip.comment = zipEntries.zipComment;
        }
        return zip;
      }
      exports.loadAsync = function(data, options) {
        var zip = this;
        options = extendLoadOptions(options);
        if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
          return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
        }
        return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64).then(function(data2) {
          return parseEntries(data2, options);
        }).then(function checkCRC32(zipEntries) {
          var promises = [external.Promise.resolve(zipEntries)];
          var files = zipEntries.files;
          if (options.checkCRC32) {
            for (var i = 0; i < files.length; i++) {
              promises.push(checkEntryCRC32(files[i]));
            }
          }
          return external.Promise.all(promises);
        }).then(function(results) {
          var zipEntries = results.shift();
          return addFiles(zip, zipEntries, options);
        });
      };
      exports.loadSync = function(data, options) {
        var zip = this;
        options = extendLoadOptions(options);
        if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
          throw new Error("JSZip can't accept a stream when loading a zip file.");
        }
        var content = utils.prepareContentSync("the loaded zip file", data, true, options.optimizedBinaryString, options.base64);
        var zipEntries = parseEntries(content, options);
        if (options.checkCRC32) {
          for (var i = 0; i < zipEntries.files.length; i++) {
            checkEntryCRC32Sync(zipEntries.files[i]);
          }
        }
        return addFiles(zip, zipEntries, options);
      };
    }
  });

  // lib/stream/ConvertWorker.js
  var require_ConvertWorker = __commonJS({
    "lib/stream/ConvertWorker.js"(exports, module) {
      "use strict";
      var GenericWorker = require_GenericWorker();
      var utils = require_utils();
      function ConvertWorker(destType) {
        GenericWorker.call(this, "ConvertWorker to " + destType);
        this.destType = destType;
      }
      utils.inherits(ConvertWorker, GenericWorker);
      ConvertWorker.prototype.processChunk = function(chunk) {
        this.push({
          data: utils.transformTo(this.destType, chunk.data),
          meta: chunk.meta
        });
      };
      module.exports = ConvertWorker;
    }
  });

  // lib/nodejs/NodejsStreamOutputAdapter.js
  var require_NodejsStreamOutputAdapter = __commonJS({
    "lib/nodejs/NodejsStreamOutputAdapter.js"(exports, module) {
      "use strict";
      var Readable = require_stream_browser_stub().Readable;
      var utils = require_utils();
      utils.inherits(NodejsStreamOutputAdapter, Readable);
      function NodejsStreamOutputAdapter(helper, options, updateCb) {
        Readable.call(this, options);
        this._helper = helper;
        var self2 = this;
        helper.on("data", function(data, meta) {
          if (!self2.push(data)) {
            self2._helper.pause();
          }
          if (updateCb) {
            updateCb(meta);
          }
        }).on("error", function(e) {
          self2.emit("error", e);
        }).on("end", function() {
          self2.push(null);
        });
      }
      NodejsStreamOutputAdapter.prototype._read = function() {
        this._helper.resume();
      };
      module.exports = NodejsStreamOutputAdapter;
    }
  });

  // lib/stream/WebStreamOutputAdapter.js
  var require_WebStreamOutputAdapter = __commonJS({
    "lib/stream/WebStreamOutputAdapter.js"(exports, module) {
      "use strict";
      module.exports = function(helper, updateCb) {
        var cancelled = false;
        return new ReadableStream({
          start: function(controller) {
            helper.on("data", function(data, meta) {
              if (cancelled) {
                return;
              }
              controller.enqueue(data);
              if (controller.desiredSize !== null && controller.desiredSize <= 0) {
                helper.pause();
              }
              if (updateCb) {
                updateCb(meta);
              }
            }).on("error", function(e) {
              if (cancelled) {
                return;
              }
              controller.error(e);
            }).on("end", function() {
              if (cancelled) {
                return;
              }
              controller.close();
            });
          },
          pull: function() {
            helper.resume();
          },
          cancel: function() {
            cancelled = true;
            helper.pause();
          }
        });
      };
    }
  });

  // lib/stream/StreamHelper.js
  var require_StreamHelper = __commonJS({
    "lib/stream/StreamHelper.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var ConvertWorker = require_ConvertWorker();
      var GenericWorker = require_GenericWorker();
      var base64 = require_base64();
      var support = require_support();
      var external = require_external();
      var NodejsStreamOutputAdapter = null;
      if (support.nodestream) {
        try {
          NodejsStreamOutputAdapter = require_NodejsStreamOutputAdapter();
        } catch (e) {
        }
      }
      var createWebStreamOutputAdapter = require_WebStreamOutputAdapter();
      function transformZipOutput(type, content, mimeType) {
        switch (type) {
          case "blob":
            return utils.newBlob(utils.transformTo("arraybuffer", content), mimeType);
          case "base64":
            return base64.encode(content);
          default:
            return utils.transformTo(type, content);
        }
      }
      function concat(type, dataArray) {
        var i, index = 0, res = null, totalLength = 0;
        for (i = 0; i < dataArray.length; i++) {
          totalLength += dataArray[i].length;
        }
        switch (type) {
          case "string":
            return dataArray.join("");
          case "array":
            return Array.prototype.concat.apply([], dataArray);
          case "uint8array":
            res = new Uint8Array(totalLength);
            for (i = 0; i < dataArray.length; i++) {
              res.set(dataArray[i], index);
              index += dataArray[i].length;
            }
            return res;
          case "nodebuffer":
            return Buffer.concat(dataArray);
          default:
            throw new Error("concat : unsupported type '" + type + "'");
        }
      }
      function accumulate(helper, updateCallback) {
        return new external.Promise(function(resolve, reject) {
          var dataArray = [];
          var chunkType = helper._internalType, resultType = helper._outputType, mimeType = helper._mimeType;
          helper.on("data", function(data, meta) {
            dataArray.push(data);
            if (updateCallback) {
              updateCallback(meta);
            }
          }).on("error", function(err) {
            dataArray = [];
            reject(err);
          }).on("end", function() {
            try {
              var result = transformZipOutput(resultType, concat(chunkType, dataArray), mimeType);
              resolve(result);
            } catch (e) {
              reject(e);
            }
            dataArray = [];
          }).resume();
        });
      }
      function StreamHelper(worker, outputType, mimeType) {
        var internalType = outputType;
        switch (outputType) {
          case "blob":
          case "arraybuffer":
            internalType = "uint8array";
            break;
          case "base64":
            internalType = "string";
            break;
        }
        try {
          this._internalType = internalType;
          this._outputType = outputType;
          this._mimeType = mimeType;
          utils.checkSupport(internalType);
          this._worker = worker.pipe(new ConvertWorker(internalType));
          worker.lock();
        } catch (e) {
          this._worker = new GenericWorker("error");
          this._worker.error(e);
        }
      }
      StreamHelper.prototype = {
        /**
         * Listen a StreamHelper, accumulate its content and concatenate it into a
         * complete block.
         * @param {Function} updateCb the update callback.
         * @return Promise the promise for the accumulation.
         */
        accumulate: function(updateCb) {
          return accumulate(this, updateCb);
        },
        /**
         * Synchronous version of accumulate: drive the workers chain in a
         * blocking loop and return the concatenated content. Only works when
         * every source of the chain is synchronous (see SyncDataWorker), throws
         * otherwise.
         * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content.
         */
        accumulateSync: function() {
          var dataArray = [];
          var error = null;
          var ended = false;
          this._worker.on("data", function(chunk) {
            dataArray.push(chunk.data);
          }).on("error", function(e) {
            error = e;
          }).on("end", function() {
            ended = true;
          });
          this._worker.resume();
          if (error) {
            throw error;
          }
          if (!ended) {
            throw new Error("The zip content can't be read synchronously: an asynchronous source didn't complete, please use the async API.");
          }
          return transformZipOutput(this._outputType, concat(this._internalType, dataArray), this._mimeType);
        },
        /**
         * Add a listener on an event triggered on a stream.
         * @param {String} evt the name of the event
         * @param {Function} fn the listener
         * @return {StreamHelper} the current helper.
         */
        on: function(evt, fn) {
          var self2 = this;
          if (evt === "data") {
            this._worker.on(evt, function(chunk) {
              fn.call(self2, chunk.data, chunk.meta);
            });
          } else {
            this._worker.on(evt, function() {
              utils.delay(fn, arguments, self2);
            });
          }
          return this;
        },
        /**
         * Resume the flow of chunks.
         * @return {StreamHelper} the current helper.
         */
        resume: function() {
          utils.delay(this._worker.resume, [], this._worker);
          return this;
        },
        /**
         * Pause the flow of chunks.
         * @return {StreamHelper} the current helper.
         */
        pause: function() {
          this._worker.pause();
          return this;
        },
        /**
         * Return a nodejs stream for this helper.
         * @param {Function} updateCb the update callback.
         * @return {NodejsStreamOutputAdapter} the nodejs stream.
         */
        toNodejsStream: function(updateCb) {
          utils.checkSupport("nodestream");
          if (this._outputType !== "nodebuffer") {
            throw new Error(this._outputType + " is not supported by this method");
          }
          return new NodejsStreamOutputAdapter(this, {
            objectMode: this._outputType !== "nodebuffer"
          }, updateCb);
        },
        /**
         * Return a web ReadableStream (WHATWG Streams) for this helper.
         * @param {Function} updateCb the update callback.
         * @return {ReadableStream} the web stream.
         */
        toWebStream: function(updateCb) {
          utils.checkSupport("webstream");
          if (this._outputType !== "uint8array" && this._outputType !== "nodebuffer") {
            throw new Error(this._outputType + " is not supported by this method");
          }
          return createWebStreamOutputAdapter(this, updateCb);
        }
      };
      module.exports = StreamHelper;
    }
  });

  // lib/defaults.js
  var require_defaults = __commonJS({
    "lib/defaults.js"(exports) {
      "use strict";
      exports.base64 = false;
      exports.binary = false;
      exports.dir = false;
      exports.createFolders = true;
      exports.date = null;
      exports.compression = null;
      exports.compressionOptions = null;
      exports.comment = null;
      exports.unixPermissions = null;
      exports.dosPermissions = null;
    }
  });

  // lib/zipObject.js
  var require_zipObject = __commonJS({
    "lib/zipObject.js"(exports, module) {
      "use strict";
      var StreamHelper = require_StreamHelper();
      var DataWorker = require_DataWorker();
      var SyncDataWorker = require_SyncDataWorker();
      var utf8 = require_utf8();
      var CompressedObject = require_compressedObject();
      var GenericWorker = require_GenericWorker();
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
        this.options = {
          compression: options.compression,
          compressionOptions: options.compressionOptions
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
        _internalStream: function(type, sync) {
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
        internalStream: function(type) {
          return this._internalStream(type, false);
        },
        /**
         * Prepare the content in the asked type.
         * @param {String} type the type of the result.
         * @param {Function} onUpdate a function to call on each internal update.
         * @return Promise the promise of the result.
         */
        async: function(type, onUpdate) {
          return this.internalStream(type).accumulate(onUpdate);
        },
        /**
         * Prepare the content in the asked type, synchronously. Only works when
         * the file comes from a synchronous source (a string, a TypedArray, a
         * zip file loaded from one...), throws otherwise.
         * @param {String} type the type of the result.
         * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content.
         */
        sync: function(type) {
          return this._internalStream(type, true).accumulateSync();
        },
        /**
         * Prepare the content as a nodejs stream.
         * @param {String} type the type of each chunk.
         * @param {Function} onUpdate a function to call on each internal update.
         * @return Stream the stream.
         */
        nodeStream: function(type, onUpdate) {
          return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
        },
        /**
         * Prepare the content as a web ReadableStream (WHATWG Streams).
         * @param {String} type the type of each chunk.
         * @param {Function} onUpdate a function to call on each internal update.
         * @return {ReadableStream} the stream.
         */
        webStream: function(type, onUpdate) {
          return this.internalStream(type || "uint8array").toWebStream(onUpdate);
        },
        /**
         * Return a worker for the compressed content.
         * @private
         * @param {Object} compression the compression object to use.
         * @param {Object} compressionOptions the options to use when compressing.
         * @return Worker the worker.
         */
        _compressWorker: function(compression, compressionOptions, sync) {
          if (this._data instanceof CompressedObject && this._data.compression.magic === compression.magic) {
            return this._data.getCompressedWorker(sync);
          } else {
            var result = this._decompressWorker(sync);
            if (!this._dataBinary) {
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
        _decompressWorker: function(sync) {
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
        _syncData: function() {
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
      var removedFn = function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      };
      for (i = 0; i < removedMethods.length; i++) {
        ZipObject.prototype[removedMethods[i]] = removedFn;
      }
      var i;
      module.exports = ZipObject;
    }
  });

  // lib/generate/ZipFileWorker.js
  var require_ZipFileWorker = __commonJS({
    "lib/generate/ZipFileWorker.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      var utf8 = require_utf8();
      var crc32 = require_crc32();
      var signature = require_signature();
      var decToHex = function(dec, bytes) {
        var hex = "", i;
        for (i = 0; i < bytes; i++) {
          hex += String.fromCharCode(dec & 255);
          dec = dec >>> 8;
        }
        return hex;
      };
      var decToHex64 = function(dec, bytes) {
        var hex = "", i;
        for (i = 0; i < bytes; i++) {
          hex += String.fromCharCode(dec % 256);
          dec = Math.floor(dec / 256);
        }
        return hex;
      };
      var MAX_32_BITS = 4294967295;
      var MAX_16_BITS = 65535;
      var generateUnixExternalFileAttr = function(unixPermissions, isDir) {
        var result = unixPermissions;
        if (!unixPermissions) {
          result = isDir ? 16893 : 33204;
        }
        return (result & 65535) << 16;
      };
      var generateDosExternalFileAttr = function(dosPermissions) {
        return (dosPermissions || 0) & 63;
      };
      var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName, forceZip64) {
        var file = streamInfo["file"], compression = streamInfo["compression"], useCustomEncoding = encodeFileName !== utf8.utf8encode, encodedFileName = utils.transformTo("string", encodeFileName(file.name)), utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)), comment = file.comment, encodedComment = utils.transformTo("string", encodeFileName(comment)), utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)), useUTF8ForFileName = utfEncodedFileName.length !== file.name.length, useUTF8ForComment = utfEncodedComment.length !== comment.length, dosTime, dosDate, extraFields = "", unicodePathExtraField = "", unicodeCommentExtraField = "", dir = file.dir, date = file.date;
        var dataInfo = {
          crc32: 0,
          compressedSize: 0,
          uncompressedSize: 0
        };
        if (!streamedContent || streamingEnded) {
          dataInfo.crc32 = streamInfo["crc32"];
          dataInfo.compressedSize = streamInfo["compressedSize"];
          dataInfo.uncompressedSize = streamInfo["uncompressedSize"];
        }
        var zip64Sizes = forceZip64 || dataInfo.compressedSize > MAX_32_BITS || dataInfo.uncompressedSize > MAX_32_BITS;
        var zip64Offset = forceZip64 || offset > MAX_32_BITS;
        var zip64 = zip64Sizes || zip64Offset;
        var bitflag = 0;
        if (streamedContent) {
          bitflag |= 8;
        }
        if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
          bitflag |= 2048;
        }
        var extFileAttr = 0;
        var versionMadeBy = 0;
        if (dir) {
          extFileAttr |= 16;
        }
        if (platform === "UNIX") {
          versionMadeBy = zip64 ? 813 : 798;
          extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
        } else {
          versionMadeBy = zip64 ? 45 : 20;
          extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
        }
        dosTime = date.getUTCHours();
        dosTime = dosTime << 6;
        dosTime = dosTime | date.getUTCMinutes();
        dosTime = dosTime << 5;
        dosTime = dosTime | date.getUTCSeconds() / 2;
        dosDate = date.getUTCFullYear() - 1980;
        dosDate = dosDate << 4;
        dosDate = dosDate | date.getUTCMonth() + 1;
        dosDate = dosDate << 5;
        dosDate = dosDate | date.getUTCDate();
        if (useUTF8ForFileName) {
          unicodePathExtraField = // Version
          decToHex(1, 1) + // NameCRC32
          decToHex(crc32(encodedFileName), 4) + // UnicodeName
          utfEncodedFileName;
          extraFields += // Info-ZIP Unicode Path Extra Field
          "up" + // size
          decToHex(unicodePathExtraField.length, 2) + // content
          unicodePathExtraField;
        }
        if (useUTF8ForComment) {
          unicodeCommentExtraField = // Version
          decToHex(1, 1) + // CommentCRC32
          decToHex(crc32(encodedComment), 4) + // UnicodeName
          utfEncodedComment;
          extraFields += // Info-ZIP Unicode Path Extra Field
          "uc" + // size
          decToHex(unicodeCommentExtraField.length, 2) + // content
          unicodeCommentExtraField;
        }
        var zip64DataLocal = "", zip64DataCentral = "";
        if (zip64Sizes) {
          zip64DataLocal = decToHex64(dataInfo.uncompressedSize, 8) + decToHex64(dataInfo.compressedSize, 8);
          zip64DataCentral = zip64DataLocal;
        }
        if (zip64Offset) {
          zip64DataCentral += decToHex64(offset, 8);
        }
        var localExtraFields = (zip64DataLocal ? "\0" + decToHex(zip64DataLocal.length, 2) + zip64DataLocal : "") + extraFields;
        var centralExtraFields = (zip64DataCentral ? "\0" + decToHex(zip64DataCentral.length, 2) + zip64DataCentral : "") + extraFields;
        var header = "";
        header += zip64 ? "-\0" : "\n\0";
        header += decToHex(bitflag, 2);
        header += compression.magic;
        header += decToHex(dosTime, 2);
        header += decToHex(dosDate, 2);
        header += decToHex(dataInfo.crc32, 4);
        header += decToHex(zip64Sizes ? MAX_32_BITS : dataInfo.compressedSize, 4);
        header += decToHex(zip64Sizes ? MAX_32_BITS : dataInfo.uncompressedSize, 4);
        header += decToHex(encodedFileName.length, 2);
        var fileRecord = signature.LOCAL_FILE_HEADER + header + // extra field length
        decToHex(localExtraFields.length, 2) + encodedFileName + localExtraFields;
        var dirRecord = signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)
        decToHex(versionMadeBy, 2) + // file header (common to file and central directory)
        header + // extra field length
        decToHex(centralExtraFields.length, 2) + // file comment length
        decToHex(encodedComment.length, 2) + // disk number start
        "\0\0\0\0" + // external file attributes
        decToHex(extFileAttr, 4) + // relative offset of local header
        decToHex(zip64Offset ? MAX_32_BITS : offset, 4) + // file name
        encodedFileName + // extra field
        centralExtraFields + // file comment
        encodedComment;
        return {
          fileRecord,
          dirRecord
        };
      };
      var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName, forceZip64) {
        var dirEnd = "";
        var encodedComment = utils.transformTo("string", encodeFileName(comment));
        var zip64 = forceZip64 || entriesCount > MAX_16_BITS || centralDirLength > MAX_32_BITS || localDirLength > MAX_32_BITS;
        if (zip64) {
          dirEnd += signature.ZIP64_CENTRAL_DIRECTORY_END + // size of this record, minus the leading 12 bytes
          decToHex64(44, 8) + // version made by (4.5)
          decToHex(45, 2) + // version needed to extract (4.5)
          decToHex(45, 2) + // number of this disk
          decToHex(0, 4) + // number of the disk with the start of the central directory
          decToHex(0, 4) + // total number of entries in the central directory on this disk
          decToHex64(entriesCount, 8) + // total number of entries in the central directory
          decToHex64(entriesCount, 8) + // size of the central directory
          decToHex64(centralDirLength, 8) + // offset of start of central directory
          decToHex64(localDirLength, 8);
          dirEnd += signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR + // number of the disk with the start of the zip64 EOCD
          decToHex(0, 4) + // relative offset of the zip64 EOCD record
          decToHex64(localDirLength + centralDirLength, 8) + // total number of disks
          decToHex(1, 4);
        }
        dirEnd += signature.CENTRAL_DIRECTORY_END + // number of this disk
        "\0\0\0\0" + // total number of entries in the central directory on this disk
        decToHex(zip64 ? MAX_16_BITS : entriesCount, 2) + // total number of entries in the central directory
        decToHex(zip64 ? MAX_16_BITS : entriesCount, 2) + // size of the central directory   4 bytes
        decToHex(zip64 ? MAX_32_BITS : centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
        decToHex(zip64 ? MAX_32_BITS : localDirLength, 4) + // .ZIP file comment length
        decToHex(encodedComment.length, 2) + // .ZIP file comment
        encodedComment;
        return dirEnd;
      };
      var generateDataDescriptors = function(streamInfo, zip64) {
        var descriptor = "";
        descriptor = signature.DATA_DESCRIPTOR + // crc-32                          4 bytes
        decToHex(streamInfo["crc32"], 4) + // compressed size                 4 or 8 bytes
        (zip64 ? decToHex64(streamInfo["compressedSize"], 8) : decToHex(streamInfo["compressedSize"], 4)) + // uncompressed size               4 or 8 bytes
        (zip64 ? decToHex64(streamInfo["uncompressedSize"], 8) : decToHex(streamInfo["uncompressedSize"], 4));
        return descriptor;
      };
      function ZipFileWorker(streamFiles, comment, platform, encodeFileName, zip64) {
        GenericWorker.call(this, "ZipFileWorker");
        this.bytesWritten = 0;
        this.zipComment = comment;
        this.zipPlatform = platform;
        this.encodeFileName = encodeFileName;
        this.streamFiles = streamFiles;
        this.accumulate = false;
        this.contentBuffer = [];
        this.dirRecords = [];
        this.currentSourceOffset = 0;
        this.entriesCount = 0;
        this.currentFile = null;
        this.zip64 = !!zip64;
        this._sources = [];
      }
      utils.inherits(ZipFileWorker, GenericWorker);
      ZipFileWorker.prototype.push = function(chunk) {
        var currentFilePercent = chunk.meta.percent || 0;
        var entriesCount = this.entriesCount;
        var remainingFiles = this._sources.length;
        if (this.accumulate) {
          this.contentBuffer.push(chunk);
        } else {
          this.bytesWritten += chunk.data.length;
          GenericWorker.prototype.push.call(this, {
            data: chunk.data,
            meta: {
              currentFile: this.currentFile,
              percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
            }
          });
        }
      };
      ZipFileWorker.prototype.openedSource = function(streamInfo) {
        this.currentSourceOffset = this.bytesWritten;
        this.currentFile = streamInfo["file"].name;
        var streamedContent = this.streamFiles && !streamInfo["file"].dir;
        if (streamedContent) {
          var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName, this.zip64);
          this.push({
            data: record.fileRecord,
            meta: { percent: 0 }
          });
        } else {
          this.accumulate = true;
        }
      };
      ZipFileWorker.prototype.closedSource = function(streamInfo) {
        this.accumulate = false;
        var streamedContent = this.streamFiles && !streamInfo["file"].dir;
        if (streamedContent && !this.zip64 && (streamInfo["compressedSize"] > MAX_32_BITS || streamInfo["uncompressedSize"] > MAX_32_BITS)) {
          throw new Error("The file '" + streamInfo["file"].name + "' is larger than 4 GiB and streamFiles is enabled: pass zip64: true to the generate options.");
        }
        var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName, this.zip64);
        this.dirRecords.push(record.dirRecord);
        if (streamedContent) {
          this.push({
            data: generateDataDescriptors(streamInfo, this.zip64),
            meta: { percent: 100 }
          });
        } else {
          this.push({
            data: record.fileRecord,
            meta: { percent: 0 }
          });
          while (this.contentBuffer.length) {
            this.push(this.contentBuffer.shift());
          }
        }
        this.currentFile = null;
      };
      ZipFileWorker.prototype.flush = function() {
        var localDirLength = this.bytesWritten;
        for (var i = 0; i < this.dirRecords.length; i++) {
          this.push({
            data: this.dirRecords[i],
            meta: { percent: 100 }
          });
        }
        var centralDirLength = this.bytesWritten - localDirLength;
        var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName, this.zip64);
        this.push({
          data: dirEnd,
          meta: { percent: 100 }
        });
      };
      ZipFileWorker.prototype.prepareNextSource = function() {
        this.previous = this._sources.shift();
        this.openedSource(this.previous.streamInfo);
        if (this.isPaused) {
          this.previous.pause();
        } else {
          this.previous.resume();
        }
      };
      ZipFileWorker.prototype.registerPrevious = function(previous) {
        this._sources.push(previous);
        var self2 = this;
        previous.on("data", function(chunk) {
          self2.processChunk(chunk);
        });
        previous.on("end", function() {
          self2.closedSource(self2.previous.streamInfo);
          if (self2._sources.length) {
            self2.prepareNextSource();
          } else {
            self2.end();
          }
        });
        previous.on("error", function(e) {
          self2.error(e);
        });
        return this;
      };
      ZipFileWorker.prototype.resume = function() {
        if (!GenericWorker.prototype.resume.call(this)) {
          return false;
        }
        if (!this.previous && this._sources.length) {
          this.prepareNextSource();
          return true;
        }
        if (!this.previous && !this._sources.length && !this.generatedError) {
          this.end();
          return true;
        }
      };
      ZipFileWorker.prototype.error = function(e) {
        var sources = this._sources;
        if (!GenericWorker.prototype.error.call(this, e)) {
          return false;
        }
        for (var i = 0; i < sources.length; i++) {
          try {
            sources[i].error(e);
          } catch (e2) {
          }
        }
        return true;
      };
      ZipFileWorker.prototype.lock = function() {
        GenericWorker.prototype.lock.call(this);
        var sources = this._sources;
        for (var i = 0; i < sources.length; i++) {
          sources[i].lock();
        }
      };
      module.exports = ZipFileWorker;
    }
  });

  // lib/generate/index.js
  var require_generate = __commonJS({
    "lib/generate/index.js"(exports) {
      "use strict";
      var compressions = require_compressions();
      var ZipFileWorker = require_ZipFileWorker();
      var getCompression = function(fileCompression, zipCompression) {
        var compressionName = fileCompression || zipCompression;
        var compression = compressions[compressionName];
        if (!compression) {
          throw new Error(compressionName + " is not a valid compression method !");
        }
        return compression;
      };
      exports.generateWorker = function(zip, options, comment) {
        var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName, options.zip64);
        var entriesCount = 0;
        try {
          zip.forEach(function(relativePath, file) {
            entriesCount++;
            var compression = getCompression(file.options.compression, options.compression);
            var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
            var dir = file.dir, date = file.date;
            file._compressWorker(compression, compressionOptions, options.sync).withStreamInfo("file", {
              name: relativePath,
              dir,
              date,
              comment: file.comment || "",
              unixPermissions: file.unixPermissions,
              dosPermissions: file.dosPermissions
            }).pipe(zipFileWorker);
          });
          zipFileWorker.entriesCount = entriesCount;
        } catch (e) {
          zipFileWorker.error(e);
        }
        return zipFileWorker;
      };
    }
  });

  // lib/nodejs/NodejsStreamInputAdapter.js
  var require_NodejsStreamInputAdapter = __commonJS({
    "lib/nodejs/NodejsStreamInputAdapter.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      function NodejsStreamInputAdapter(filename, stream) {
        GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
        this._upstreamEnded = false;
        this._bindStream(stream);
      }
      utils.inherits(NodejsStreamInputAdapter, GenericWorker);
      NodejsStreamInputAdapter.prototype._bindStream = function(stream) {
        var self2 = this;
        this._stream = stream;
        stream.pause();
        stream.on("data", function(chunk) {
          self2.push({
            data: chunk,
            meta: {
              percent: 0
            }
          });
        }).on("error", function(e) {
          if (self2.isPaused) {
            this.generatedError = e;
          } else {
            self2.error(e);
          }
        }).on("end", function() {
          if (self2.isPaused) {
            self2._upstreamEnded = true;
          } else {
            self2.end();
          }
        });
      };
      NodejsStreamInputAdapter.prototype.pause = function() {
        if (!GenericWorker.prototype.pause.call(this)) {
          return false;
        }
        this._stream.pause();
        return true;
      };
      NodejsStreamInputAdapter.prototype.resume = function() {
        if (!GenericWorker.prototype.resume.call(this)) {
          return false;
        }
        if (this._upstreamEnded) {
          this.end();
        } else {
          this._stream.resume();
        }
        return true;
      };
      module.exports = NodejsStreamInputAdapter;
    }
  });

  // lib/stream/WebStreamInputAdapter.js
  var require_WebStreamInputAdapter = __commonJS({
    "lib/stream/WebStreamInputAdapter.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var GenericWorker = require_GenericWorker();
      function WebStreamInputAdapter(filename, stream) {
        GenericWorker.call(this, "Web stream input adapter for " + filename);
        this._filename = filename;
        this._reader = stream.getReader();
        this._reading = false;
        this._pendingChunk = null;
        this._upstreamEnded = false;
      }
      utils.inherits(WebStreamInputAdapter, GenericWorker);
      WebStreamInputAdapter.prototype.resume = function() {
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
      WebStreamInputAdapter.prototype._readChunk = function() {
        if (this._reading || this.isPaused || this.isFinished) {
          return;
        }
        this._reading = true;
        var self2 = this;
        this._reader.read().then(function(result) {
          self2._reading = false;
          if (self2.isFinished) {
            return;
          }
          if (result.done) {
            if (self2.isPaused) {
              self2._upstreamEnded = true;
            } else {
              self2.end();
            }
            return;
          }
          if (self2.isPaused) {
            self2._pendingChunk = result.value;
            return;
          }
          self2._pushChunk(result.value);
          self2._readChunk();
        }, function(e) {
          self2._reading = false;
          if (self2.isPaused) {
            self2.generatedError = e;
          } else {
            self2.error(e);
          }
        });
      };
      WebStreamInputAdapter.prototype._pushChunk = function(chunk) {
        var type = utils.getTypeOf(chunk);
        if (!type) {
          this.error(new Error(
            "The web stream of '" + this._filename + "' produced a chunk in an unsupported type, only strings, TypedArrays and ArrayBuffers are supported."
          ));
          return;
        }
        if (type === "arraybuffer") {
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
    }
  });

  // lib/object.js
  var require_object = __commonJS({
    "lib/object.js"(exports, module) {
      "use strict";
      var utf8 = require_utf8();
      var utils = require_utils();
      var external = require_external();
      var GenericWorker = require_GenericWorker();
      var StreamHelper = require_StreamHelper();
      var defaults = require_defaults();
      var CompressedObject = require_compressedObject();
      var ZipObject = require_zipObject();
      var generate = require_generate();
      var nodejsUtils = require_nodejsUtils();
      var NodejsStreamInputAdapter = require_NodejsStreamInputAdapter();
      var WebStreamInputAdapter = require_WebStreamInputAdapter();
      var fileAdd = function(name, data, originalOptions) {
        var dataType = utils.getTypeOf(data), parent;
        var o = utils.extend(originalOptions || {}, defaults);
        o.date = o.date || /* @__PURE__ */ new Date();
        if (o.compression !== null) {
          o.compression = o.compression.toUpperCase();
        }
        if (typeof o.unixPermissions === "string") {
          o.unixPermissions = parseInt(o.unixPermissions, 8);
        }
        if (o.unixPermissions && o.unixPermissions & 16384) {
          o.dir = true;
        }
        if (o.dosPermissions && o.dosPermissions & 16) {
          o.dir = true;
        }
        if (o.dir) {
          name = forceTrailingSlash(name);
        }
        if (o.createFolders && (parent = parentFolder(name))) {
          folderAdd.call(this, parent, true);
        }
        var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
        if (!originalOptions || typeof originalOptions.binary === "undefined") {
          o.binary = !isUnicodeString;
        }
        var isCompressedEmpty = data instanceof CompressedObject && data.uncompressedSize === 0;
        if (isCompressedEmpty || o.dir || !data || data.length === 0) {
          o.base64 = false;
          o.binary = true;
          data = "";
          o.compression = "STORE";
          dataType = "string";
        }
        var zipObjectContent = null, zipObjectContentSync = null;
        if (data instanceof CompressedObject || data instanceof GenericWorker) {
          zipObjectContent = data;
        } else if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
          zipObjectContent = new NodejsStreamInputAdapter(name, data);
        } else if (utils.isWebReadableStream(data)) {
          zipObjectContent = new WebStreamInputAdapter(name, data);
        } else if (dataType) {
          try {
            zipObjectContentSync = { data: utils.prepareContentSync(name, data, o.binary, o.optimizedBinaryString, o.base64) };
            zipObjectContent = external.Promise.resolve(zipObjectContentSync.data);
          } catch (e) {
            zipObjectContentSync = { error: e };
            zipObjectContent = external.Promise.reject(e);
          }
        } else {
          zipObjectContent = utils.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
        }
        var object = new ZipObject(name, zipObjectContent, o, zipObjectContentSync);
        this.files[name] = object;
      };
      var parentFolder = function(path) {
        if (path.slice(-1) === "/") {
          path = path.substring(0, path.length - 1);
        }
        var lastSlash = path.lastIndexOf("/");
        return lastSlash > 0 ? path.substring(0, lastSlash) : "";
      };
      var forceTrailingSlash = function(path) {
        if (path.slice(-1) !== "/") {
          path += "/";
        }
        return path;
      };
      var folderAdd = function(name, createFolders) {
        createFolders = typeof createFolders !== "undefined" ? createFolders : defaults.createFolders;
        name = forceTrailingSlash(name);
        if (!this.files[name]) {
          fileAdd.call(this, name, null, {
            dir: true,
            createFolders
          });
        }
        return this.files[name];
      };
      function isRegExp(object) {
        return Object.prototype.toString.call(object) === "[object RegExp]";
      }
      var out = {
        /**
         * @see loadAsync
         */
        load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        },
        /**
         * Call a callback function for each entry at this folder level.
         * @param {Function} cb the callback function:
         * function (relativePath, file) {...}
         * It takes 2 arguments : the relative path and the file.
         */
        forEach: function(cb) {
          var filename, relativePath, file;
          for (filename in this.files) {
            file = this.files[filename];
            relativePath = filename.slice(this.root.length, filename.length);
            if (relativePath && filename.slice(0, this.root.length) === this.root) {
              cb(relativePath, file);
            }
          }
        },
        /**
         * Filter nested files/folders with the specified function.
         * @param {Function} search the predicate to use :
         * function (relativePath, file) {...}
         * It takes 2 arguments : the relative path and the file.
         * @return {Array} An array of matching elements.
         */
        filter: function(search) {
          var result = [];
          this.forEach(function(relativePath, entry) {
            if (search(relativePath, entry)) {
              result.push(entry);
            }
          });
          return result;
        },
        /**
         * Add a file to the zip file, or search a file.
         * @param   {string|RegExp} name The name of the file to add (if data is defined),
         * the name of the file to find (if no data) or a regex to match files.
         * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
         * @param   {Object} o     File options
         * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
         * a file (when searching by string) or an array of files (when searching by regex).
         */
        file: function(name, data, o) {
          if (arguments.length === 1) {
            if (isRegExp(name)) {
              var regexp = name;
              return this.filter(function(relativePath, file) {
                return !file.dir && regexp.test(relativePath);
              });
            } else {
              var obj = this.files[this.root + name];
              if (obj && !obj.dir) {
                return obj;
              } else {
                return null;
              }
            }
          } else {
            name = this.root + name;
            fileAdd.call(this, name, data, o);
          }
          return this;
        },
        /**
         * Add a directory to the zip file, or search.
         * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
         * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
         */
        folder: function(arg) {
          if (!arg) {
            return this;
          }
          if (isRegExp(arg)) {
            return this.filter(function(relativePath, file) {
              return file.dir && arg.test(relativePath);
            });
          }
          var name = this.root + arg;
          var newFolder = folderAdd.call(this, name);
          var ret = this.clone();
          ret.root = newFolder.name;
          return ret;
        },
        /**
         * Delete a file, or a directory and all sub-files, from the zip
         * @param {string} name the name of the file to delete
         * @return {JSZip} this JSZip object
         */
        remove: function(name) {
          name = this.root + name;
          var file = this.files[name];
          if (!file) {
            if (name.slice(-1) !== "/") {
              name += "/";
            }
            file = this.files[name];
          }
          if (file && !file.dir) {
            delete this.files[name];
          } else {
            var kids = this.filter(function(relativePath, file2) {
              return file2.name.slice(0, name.length) === name;
            });
            for (var i = 0; i < kids.length; i++) {
              delete this.files[kids[i].name];
            }
          }
          return this;
        },
        /**
         * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
         */
        generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        },
        /**
         * Generate the complete zip file as an internal stream.
         * @private
         * @param {Object} options the options to generate the zip file, see
         * generateInternalStream.
         * @param {Boolean} sync true to build a chain usable with accumulateSync.
         * @return {StreamHelper} the streamed zip file.
         */
        _generateInternalStream: function(options, sync) {
          var worker, opts = {};
          try {
            opts = utils.extend(options || {}, {
              streamFiles: false,
              compression: "STORE",
              compressionOptions: null,
              type: "",
              platform: "DOS",
              comment: null,
              mimeType: "application/zip",
              encodeFileName: utf8.utf8encode,
              zip64: false
            });
            opts.sync = !!sync;
            opts.type = opts.type.toLowerCase();
            opts.compression = opts.compression.toUpperCase();
            if (opts.type === "binarystring") {
              opts.type = "string";
            }
            if (!opts.type) {
              throw new Error("No output type specified.");
            }
            utils.checkSupport(opts.type);
            if (opts.platform === "darwin" || opts.platform === "freebsd" || opts.platform === "linux" || opts.platform === "sunos") {
              opts.platform = "UNIX";
            }
            if (opts.platform === "win32") {
              opts.platform = "DOS";
            }
            var comment = opts.comment || this.comment || "";
            worker = generate.generateWorker(this, opts, comment);
          } catch (e) {
            worker = new GenericWorker("error");
            worker.error(e);
          }
          return new StreamHelper(worker, opts.type || "string", opts.mimeType);
        },
        /**
         * Generate the complete zip file as an internal stream.
         * @param {Object} options the options to generate the zip file :
         * - compression, "STORE" by default.
         * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
         * @return {StreamHelper} the streamed zip file.
         */
        generateInternalStream: function(options) {
          return this._generateInternalStream(options, false);
        },
        /**
         * Generate the complete zip file asynchronously.
         * @see generateInternalStream
         */
        generateAsync: function(options, onUpdate) {
          return this.generateInternalStream(options).accumulate(onUpdate);
        },
        /**
         * Generate the complete zip file synchronously. Only works when every
         * file comes from a synchronous source (a string, a TypedArray, a zip
         * file loaded from one...), throws otherwise.
         * @see generateInternalStream
         * @param {Object} options the options to generate the zip file.
         * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file content.
         */
        generateSync: function(options) {
          return this._generateInternalStream(options, true).accumulateSync();
        },
        /**
         * Generate the complete zip file asynchronously.
         * @see generateInternalStream
         */
        generateNodeStream: function(options, onUpdate) {
          options = options || {};
          if (!options.type) {
            options.type = "nodebuffer";
          }
          return this.generateInternalStream(options).toNodejsStream(onUpdate);
        },
        /**
         * Generate the complete zip file as a web ReadableStream (WHATWG Streams).
         * @see generateInternalStream
         */
        generateWebStream: function(options, onUpdate) {
          options = options || {};
          if (!options.type) {
            options.type = "uint8array";
          }
          return this.generateInternalStream(options).toWebStream(onUpdate);
        }
      };
      module.exports = out;
    }
  });

  // lib/index.js
  var require_index = __commonJS({
    "lib/index.js"(exports, module) {
      function JSZip() {
        if (!(this instanceof JSZip)) {
          return new JSZip();
        }
        if (arguments.length) {
          throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
        }
        this.files = /* @__PURE__ */ Object.create(null);
        this.comment = null;
        this.root = "";
        this.clone = function() {
          var newObj = new JSZip();
          for (var i in this) {
            if (typeof this[i] !== "function") {
              newObj[i] = this[i];
            }
          }
          return newObj;
        };
      }
      var load = require_load();
      JSZip.prototype = require_object();
      JSZip.prototype.loadAsync = load.loadAsync;
      JSZip.prototype.loadSync = load.loadSync;
      JSZip.support = require_support();
      JSZip.defaults = require_defaults();
      JSZip.version = "4.3.0";
      JSZip.loadAsync = function(content, options) {
        return new JSZip().loadAsync(content, options);
      };
      JSZip.loadSync = function(content, options) {
        return new JSZip().loadSync(content, options);
      };
      JSZip.external = require_external();
      module.exports = JSZip;
    }
  });
  return require_index();
})();
