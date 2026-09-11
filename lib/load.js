"use strict";
var utils = require("./utils");
var external = require("./external");
var utf8 = require("./utf8");
var ZipEntries = require("./zipEntries");
var Crc32Probe = require("./stream/Crc32Probe");
var nodejsUtils = require("./nodejsUtils");

/**
 * Fill in the default load options.
 * @param {Object} options the options given to loadAsync/loadSync.
 * @return {Object} the completed options.
 */
function extendLoadOptions(options) {
    return utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode
    });
}

/**
 * Check the CRC32 of an entry.
 * @param {ZipEntry} zipEntry the zip entry to check.
 * @return {Promise} the result.
 */
function checkEntryCRC32(zipEntry) {
    return new external.Promise(function (resolve, reject) {
        var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
        worker.on("error", function (e) {
            reject(e);
        })
            .on("end", function () {
                if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
                    reject(new Error("Corrupted zip : CRC32 mismatch"));
                } else {
                    resolve();
                }
            })
            .resume();
    });
}

/**
 * Check the CRC32 of an entry, synchronously.
 * @param {ZipEntry} zipEntry the zip entry to check.
 */
function checkEntryCRC32Sync(zipEntry) {
    var error = null;
    var worker = zipEntry.decompressed.getContentWorker(true).pipe(new Crc32Probe());
    worker.on("error", function (e) {
        error = e;
    })
        .on("end", function () {
            if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
                error = new Error("Corrupted zip : CRC32 mismatch");
            }
        })
        .resume();
    if (error) {
        throw error;
    }
}

/**
 * Parse the given (prepared) content.
 * @param {String|Uint8Array|Array|Buffer} data the prepared content to parse.
 * @param {Object} options the completed load options.
 * @return {ZipEntries} the parsed entries.
 */
function parseEntries(data, options) {
    var zipEntries = new ZipEntries(options);
    zipEntries.load(data);
    return zipEntries;
}

/**
 * Add the parsed entries to the given zip.
 * @param {JSZip} zip the zip to populate.
 * @param {ZipEntries} zipEntries the parsed entries.
 * @param {Object} options the completed load options.
 * @return {JSZip} the populated zip.
 */
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

exports.loadAsync = function (data, options) {
    var zip = this;
    options = extendLoadOptions(options);

    if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
    }

    return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64)
        .then(function (data) {
            return parseEntries(data, options);
        }).then(function checkCRC32(zipEntries) {
            var promises = [external.Promise.resolve(zipEntries)];
            var files = zipEntries.files;
            if (options.checkCRC32) {
                for (var i = 0; i < files.length; i++) {
                    promises.push(checkEntryCRC32(files[i]));
                }
            }
            return external.Promise.all(promises);
        }).then(function (results) {
            var zipEntries = results.shift();
            return addFiles(zip, zipEntries, options);
        });
};

exports.loadSync = function (data, options) {
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
