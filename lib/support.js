"use strict";

exports.base64 = true;
exports.array = true;
exports.string = true;
exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
exports.nodebuffer = typeof Buffer !== "undefined";
// contains true if JSZip can read/generate Uint8Array, false otherwise.
exports.uint8array = typeof Uint8Array !== "undefined";

if (typeof Blob === "undefined" || typeof ArrayBuffer === "undefined") {
    exports.blob = false;
}
else {
    try {
        exports.blob = new Blob([new ArrayBuffer(0)], {
            type: "application/zip"
        }).size === 0;
    }
    catch (e) {
        exports.blob = false;
    }
}

try {
    // mapped to a stub returning no Readable in browser bundles, see the
    // "browser" field in package.json
    exports.nodestream = !!require("stream").Readable;
} catch(e) {
    exports.nodestream = false;
}

// WHATWG Streams: global in browsers, workers and nodejs >= 18.
exports.webstream = typeof ReadableStream !== "undefined";
