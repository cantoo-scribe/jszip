"use strict";

QUnit.module("webstream", function () {

    if (!JSZip.support.webstream) {
        QUnit.test("web streams are not supported by this platform", function (assert) {
            assert.ok(true, "skipped");
        });
        return;
    }

    function streamOf(chunks) {
        var i = 0;
        return new ReadableStream({
            pull: function (controller) {
                if (i < chunks.length) {
                    controller.enqueue(chunks[i++]);
                } else {
                    controller.close();
                }
            }
        });
    }

    function readAll(stream) {
        var reader = stream.getReader();
        var chunks = [];
        var totalLength = 0;
        return new JSZip.external.Promise(function (resolve, reject) {
            function next() {
                reader.read().then(function (result) {
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
                    chunks.push(result.value);
                    totalLength += result.value.length;
                    next();
                }, reject);
            }
            next();
        });
    }

    QUnit.test("file(name, webStream) round trip", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("stream.bin", streamOf([
            new Uint8Array([1, 2, 3]),
            new Uint8Array([4, 5]).buffer, // ArrayBuffer chunk
            "abc" // string chunk
        ]));
        zip.generateAsync({type: "uint8array", compression: "DEFLATE"})
            .then(function (result) {
                return JSZip.loadAsync(result);
            })
            .then(function (reloaded) {
                return reloaded.file("stream.bin").async("uint8array");
            })
            .then(function (content) {
                assert.deepEqual(
                    Array.prototype.slice.call(content),
                    [1, 2, 3, 4, 5, 97, 98, 99],
                    "all the chunk types were read in order"
                );
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("file(name, webStream) with streamFiles", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("stream.txt", streamOf([new Uint8Array([104, 101, 108, 108, 111])]));
        zip.generateAsync({type: "uint8array", streamFiles: true})
            .then(function (result) {
                return JSZip.loadAsync(result);
            })
            .then(function (reloaded) {
                return reloaded.file("stream.txt").async("string");
            })
            .then(function (content) {
                assert.equal(content, "hello", "the streamed entry (data descriptors) was read");
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("a web stream producing unsupported chunks fails with a clear error", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("bad.bin", streamOf([{not: "a chunk"}]));
        zip.generateAsync({type: "uint8array"})
            .then(function () {
                assert.ok(false, "generateAsync should have failed");
                done();
            }, function (e) {
                assert.ok(/The web stream of 'bad.bin' produced a chunk in an unsupported type/.test(e.message), "the error names the file: " + e.message);
                done();
            });
    });

    QUnit.test("an erroring web stream rejects generateAsync", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("err.bin", new ReadableStream({
            pull: function () {
                throw new Error("boom from the stream");
            }
        }));
        zip.generateAsync({type: "uint8array"})
            .then(function () {
                assert.ok(false, "generateAsync should have failed");
                done();
            }, function (e) {
                assert.equal(e.message, "boom from the stream", "the stream error is propagated");
                done();
            });
    });

    QUnit.test("loadAsync accepts a web stream", function (assert) {
        var done = assert.async();
        var source = new JSZip();
        source.file("Hello.txt", "Hello World\n");
        source.generateAsync({type: "uint8array", compression: "DEFLATE"})
            .then(function (data) {
                // split the zip in 2 chunks to exercise the accumulation
                var middle = Math.floor(data.length / 2);
                return JSZip.loadAsync(streamOf([data.subarray(0, middle), data.subarray(middle)]));
            })
            .then(function (zip) {
                return zip.file("Hello.txt").async("string");
            })
            .then(function (content) {
                assert.equal(content, "Hello World\n", "the zip was loaded from a web stream");
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("generateWebStream output can be reloaded", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        zip.file("bin.dat", new Uint8Array([0, 1, 254, 255]));
        readAll(zip.generateWebStream({compression: "DEFLATE"}))
            .then(function (data) {
                var reloaded = JSZip.loadSync(data, {checkCRC32: true});
                assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "text entry survived");
                assert.deepEqual(
                    Array.prototype.slice.call(reloaded.file("bin.dat").sync("uint8array")),
                    [0, 1, 254, 255],
                    "binary entry survived"
                );
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("generateWebStream output is byte-identical to generateAsync", function (assert) {
        var done = assert.async();
        var date = new Date("2020-02-20T12:00:00.000Z");
        function makeZip() {
            var zip = new JSZip();
            zip.file("Hello.txt", "Hello World\n", {date: date});
            return zip;
        }
        JSZip.external.Promise.all([
            readAll(makeZip().generateWebStream({compression: "DEFLATE"})),
            makeZip().generateAsync({type: "uint8array", compression: "DEFLATE"})
        ]).then(function (results) {
            assert.deepEqual(results[0], results[1], "same bytes");
            done();
        })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("generateWebStream calls the update callback", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        var updates = 0;
        readAll(zip.generateWebStream({}, function () {
            updates++;
        })).then(function () {
            assert.ok(updates > 0, "the callback was called (" + updates + " times)");
            done();
        })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("webStream(type) streams the content of one file", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        readAll(zip.file("Hello.txt").webStream())
            .then(function (content) {
                assert.equal(String.fromCharCode.apply(null, content), "Hello World\n", "the content matches");
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("cancelling a generateWebStream doesn't blow up", function (assert) {
        var done = assert.async();
        var zip = new JSZip();
        zip.file("big.bin", new Uint8Array(512 * 1024));
        var reader = zip.generateWebStream({compression: "DEFLATE"}).getReader();
        reader.read()
            .then(function () {
                return reader.cancel();
            })
            .then(function () {
                // let any stray scheduled chunk fire
                return new JSZip.external.Promise(function (resolve) {
                    setTimeout(resolve, 50);
                });
            })
            .then(function () {
                assert.ok(true, "no exception after cancel");
                done();
            })["catch"](JSZipTestUtils.assertNoError);
    });

    QUnit.test("toWebStream refuses non binary output types", function (assert) {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        assert.throws(function () {
            zip.generateInternalStream({type: "base64"}).toWebStream();
        }, /base64 is not supported by this method/, "the type restriction is enforced");
    });

    QUnit.test("the sync API refuses files coming from a web stream", function (assert) {
        var zip = new JSZip();
        zip.file("stream.bin", streamOf([new Uint8Array([1])]));
        assert.throws(function () {
            zip.generateSync({type: "uint8array"});
        }, /The file 'stream.bin' comes from a stream/, "generateSync throws with the file name");
    });

    QUnit.test("loadSync refuses a web stream", function (assert) {
        assert.throws(function () {
            JSZip.loadSync(streamOf([new Uint8Array([1])]));
        }, /asynchronous source/, "loadSync throws");
    });
});
