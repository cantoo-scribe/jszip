"use strict";

QUnit.module("sync", function () {

    var FIXED_DATE = new Date("2020-02-20T12:00:00.000Z");

    function createZip() {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n", {date: FIXED_DATE});
        zip.folder("images").file("smile.gif", "R0lGODdhBQAFAIACAFVVVf9mZiwAAAAABQAFAAACCIyPeWCsClxBADs=", {base64: true, date: FIXED_DATE});
        zip.file("bin.dat", new Uint8Array([0, 1, 2, 3, 254, 255]), {date: FIXED_DATE});
        return zip;
    }

    QUnit.test("generateSync + loadSync round trip", function (assert) {
        ["STORE", "DEFLATE"].forEach(function (compression) {
            var generated = createZip().generateSync({type: "uint8array", compression: compression});
            var reloaded = JSZip.loadSync(generated);

            assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", compression + ": text file reloaded");
            assert.deepEqual(
                Array.prototype.slice.call(reloaded.file("bin.dat").sync("uint8array")),
                [0, 1, 2, 3, 254, 255],
                compression + ": binary file reloaded"
            );
            assert.ok(reloaded.files["images/"].dir, compression + ": folder reloaded");
        });
    });

    QUnit.test("generateSync supports every output type", function (assert) {
        var zip = createZip();
        var types = ["binarystring", "base64", "array", "uint8array", "arraybuffer"];
        if (JSZip.support.nodebuffer) {
            types.push("nodebuffer");
        }
        if (JSZip.support.blob) {
            types.push("blob");
        }
        types.forEach(function (type) {
            var result = zip.generateSync({type: type});
            assert.ok(result !== null && typeof result !== "undefined", "generateSync(" + type + ") returned a result");
            if (type !== "blob") {
                var reloaded = JSZip.loadSync(result, {base64: type === "base64"});
                assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "generateSync(" + type + ") can be reloaded");
            }
        });
    });

    QUnit.test("generateSync output is byte-identical to generateAsync", function (assert) {
        var done = assert.async();
        var syncResult = createZip().generateSync({type: "uint8array", compression: "DEFLATE"});
        createZip().generateAsync({type: "uint8array", compression: "DEFLATE"})
            .then(function (asyncResult) {
                assert.deepEqual(syncResult, asyncResult, "same bytes with DEFLATE");
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("generateSync with streamFiles generates a loadable zip", function (assert) {
        var generated = createZip().generateSync({type: "uint8array", streamFiles: true, compression: "DEFLATE"});
        var reloaded = JSZip.loadSync(generated);
        assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "data descriptors variant reloaded");
    });

    QUnit.test("generateSync of an empty zip", function (assert) {
        var generated = new JSZip().generateSync({type: "uint8array"});
        assert.equal(generated.length, 22, "only the end of central directory record");
        assert.equal(Object.keys(JSZip.loadSync(generated).files).length, 0, "no entries");
    });

    QUnit.test("generateSync without type throws", function (assert) {
        assert.throws(function () {
            new JSZip().generateSync();
        }, /No output type specified/, "the error about the missing type is thrown");
    });

    QUnit.test("sync(type) supports every output type", function (assert) {
        var file = createZip().file("Hello.txt");
        assert.equal(file.sync("string"), "Hello World\n", "sync(string)");
        assert.equal(file.sync("text"), "Hello World\n", "sync(text)");
        assert.equal(file.sync("binarystring"), "Hello World\n", "sync(binarystring)");
        assert.equal(file.sync("base64"), "SGVsbG8gV29ybGQK", "sync(base64)");
        assert.deepEqual(
            Array.prototype.slice.call(file.sync("uint8array")),
            [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 10],
            "sync(uint8array)"
        );
        assert.equal(file.sync("arraybuffer").byteLength, 12, "sync(arraybuffer)");
        if (JSZip.support.nodebuffer) {
            assert.equal(file.sync("nodebuffer").toString("utf8"), "Hello World\n", "sync(nodebuffer)");
        }
    });

    QUnit.test("sync(type) handles unicode content", function (assert) {
        var zip = new JSZip();
        zip.file("utf8.txt", "€15\n", {date: FIXED_DATE});
        assert.equal(zip.file("utf8.txt").sync("string"), "€15\n", "unicode string preserved");
        assert.equal(zip.file("utf8.txt").sync("uint8array").length, 6, "utf-8 encoded on binary output");
    });

    QUnit.test("a file added from a Promise can't be read synchronously", function (assert) {
        var zip = new JSZip();
        zip.file("promise.txt", JSZip.external.Promise.resolve("hello"));
        assert.throws(function () {
            zip.generateSync({type: "uint8array"});
        }, /The file 'promise.txt' comes from an asynchronous source/, "generateSync throws with the file name");
        assert.throws(function () {
            zip.file("promise.txt").sync("string");
        }, /The file 'promise.txt' comes from an asynchronous source/, "sync(type) throws with the file name");
    });

    QUnit.test("the async API still works on a file rejected by the sync API", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("promise.txt", JSZip.external.Promise.resolve("hello"));
        assert.throws(function () {
            zip.generateSync({type: "uint8array"});
        }, /asynchronous source/, "generateSync throws");
        zip.file("promise.txt").async("string").then(function (content) {
            assert.equal(content, "hello", "async(type) works after the sync failure");
            done();
        })["catch"](JSZipTestUtils.assertNoError);
    });

    if (typeof Blob !== "undefined") {
        QUnit.test("a file added from a Blob can't be read synchronously", function (assert) {
            var zip = new JSZip();
            zip.file("blob.bin", new Blob([new Uint8Array([1, 2, 3])]));
            assert.throws(function () {
                zip.generateSync({type: "uint8array"});
            }, /The file 'blob.bin' comes from an asynchronous source/, "generateSync throws with the file name");
        });

        QUnit.test("loadSync refuses a Blob", function (assert) {
            assert.throws(function () {
                JSZip.loadSync(new Blob([new Uint8Array([1, 2, 3])]));
            }, /asynchronous source/, "loadSync throws");
        });
    }

    QUnit.test("loadSync refuses a Promise", function (assert) {
        assert.throws(function () {
            JSZip.loadSync(JSZip.external.Promise.resolve("content"));
        }, /asynchronous source/, "loadSync throws");
    });

    QUnit.test("an invalid base64 input fails on both APIs", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("bad.bin", "this is not base64 !", {base64: true});
        assert.throws(function () {
            zip.generateSync({type: "uint8array"});
        }, /Invalid base64 input/, "generateSync throws the preparation error");
        zip.generateAsync({type: "uint8array"}).then(function () {
            assert.ok(false, "generateAsync should have failed");
            done();
        }, function (e) {
            assert.ok(/Invalid base64 input/.test(e.message), "generateAsync rejects with the same error");
            done();
        });
    });

    QUnit.test("loadSync with checkCRC32 accepts a valid zip", function (assert) {
        var generated = createZip().generateSync({type: "uint8array", compression: "DEFLATE"});
        var reloaded = JSZip.loadSync(generated, {checkCRC32: true});
        assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "the zip was correctly read");
    });

    JSZipTestUtils.testZipFile("loadSync with checkCRC32 detects a corrupted zip", "ref/all.zip", function(assert, file) {
        // add 1 to the data of the file, then fix the local crc32
        var corrupted = file.replace("Hello World\n", "Hello Xorld\n");
        assert.throws(function () {
            JSZip.loadSync(corrupted, {checkCRC32: true});
        }, /Corrupted zip : CRC32 mismatch/, "the CRC32 error is thrown");
    });

    JSZipTestUtils.testZipFile("loadSync reads a reference zip", "ref/all.zip", function(assert, file) {
        var zip = JSZip.loadSync(file);
        assert.equal(zip.file("Hello.txt").sync("string"), "Hello World\n", "the zip was correctly read");
    });

    QUnit.test("sync and async APIs interoperate", function (assert) {
        var done = assert.async();
        var generated = createZip().generateSync({type: "uint8array", compression: "DEFLATE"});

        // loadAsync -> sync read
        JSZip.loadAsync(generated).then(function (zip) {
            assert.equal(zip.file("Hello.txt").sync("string"), "Hello World\n", "sync(type) works after loadAsync");
            var regenerated = zip.generateSync({type: "uint8array"});
            assert.equal(JSZip.loadSync(regenerated).file("Hello.txt").sync("string"), "Hello World\n", "generateSync works after loadAsync");

            // loadSync -> async read
            var syncZip = JSZip.loadSync(generated);
            return syncZip.file("Hello.txt").async("string");
        }).then(function (content) {
            assert.equal(content, "Hello World\n", "async(type) works after loadSync");
            done();
        })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("generateSync reuses the compressed data of a loaded zip", function (assert) {
        var deflated = createZip().generateSync({type: "uint8array", compression: "DEFLATE"});
        var reloaded = JSZip.loadSync(deflated);
        // same compression: the compressed content is reused as-is (getCompressedWorker path)
        var regenerated = reloaded.generateSync({type: "uint8array", compression: "DEFLATE"});
        assert.equal(JSZip.loadSync(regenerated).file("bin.dat").sync("base64"), "AAECA/7/", "the recompressed zip is correct");
    });

    QUnit.test("zip metadata survives a sync round trip", function (assert) {
        var zip = new JSZip();
        zip.file("perm.txt", "content", {date: FIXED_DATE, comment: "file comment", unixPermissions: "755"});
        var generated = zip.generateSync({type: "uint8array", platform: "UNIX", comment: "zip comment"});
        var reloaded = JSZip.loadSync(generated);
        var file = reloaded.file("perm.txt");
        assert.equal(reloaded.comment, "zip comment", "the zip comment is preserved");
        assert.equal(file.comment, "file comment", "the file comment is preserved");
        assert.equal(file.unixPermissions & parseInt("777", 8), parseInt("755", 8), "the unix permissions are preserved");
        assert.equal(file.date.getTime(), FIXED_DATE.getTime(), "the date is preserved");
    });

    if (JSZip.support.nodestream) {
        QUnit.test("a file added from a nodejs stream can't be read synchronously", function (assert) {
            var fs = require("fs");
            var zip = new JSZip();
            zip.file("stream.txt", fs.createReadStream(__filename));
            assert.throws(function () {
                zip.generateSync({type: "uint8array"});
            }, /The file 'stream.txt' comes from a stream/, "generateSync throws with the file name");
        });

        QUnit.test("loadSync refuses a nodejs stream", function (assert) {
            var fs = require("fs");
            assert.throws(function () {
                JSZip.loadSync(fs.createReadStream(__filename));
            }, /JSZip can't accept a stream/, "loadSync throws");
        });
    }
});
