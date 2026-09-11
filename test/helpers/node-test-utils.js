"use strict";

var fs = require("fs");
var os = require("os");
var path = require("path");
var crypto = require("crypto");

global.JSZip = require("../../lib/index");

global.JSZipTestUtils.loadZipFile = function(name, callback) {
    fs.readFile(path.join("test", name), "binary", callback);
};
global.JSZipTestUtils.tmpFileName = function(postfix) {
    return path.join(os.tmpdir(), "jszip2-test-" + crypto.randomUUID() + postfix);
};
process.on("uncaughtException", function(err) {
    console.log("uncaughtException: " + err, err.stack);
    process.exit(1);
});

process.on("unhandledRejection", function(err) {
    console.log("unhandledRejection: " + err, err.stack);
    process.exit(1);
});
