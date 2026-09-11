"use strict";

QUnit.module("zip64", function () {

    var MAX_32 = 0xFFFFFFFF;

    // read a little-endian integer from a binary string
    function le(str, offset, bytes) {
        var value = 0;
        for (var i = bytes - 1; i >= 0; i--) {
            value = value * 256 + (str.charCodeAt(offset + i) & 0xFF);
        }
        return value;
    }

    function indexOfSig(str, sig) {
        return str.indexOf(sig);
    }

    QUnit.test("a classic zip is untouched: no ZIP64 structures", function (assert) {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        var result = zip.generateSync({type: "binarystring"});
        assert.equal(indexOfSig(result, "PK\x06\x06"), -1, "no ZIP64 EOCD");
        assert.equal(indexOfSig(result, "PK\x06\x07"), -1, "no ZIP64 EOCD locator");
        assert.equal(le(result, 4, 2), 10, "version needed to extract stays 1.0");
    });

    QUnit.test("zip64: true generates all the ZIP64 structures on a small zip", function (assert) {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        var result = zip.generateSync({type: "binarystring", zip64: true});

        // local file header
        assert.equal(le(result, 4, 2), 45, "version needed to extract is 4.5");
        assert.equal(le(result, 18, 4), MAX_32, "compressed size is the 0xFFFFFFFF marker");
        assert.equal(le(result, 22, 4), MAX_32, "uncompressed size is the 0xFFFFFFFF marker");
        var nameLength = le(result, 26, 2);
        var extraOffset = 30 + nameLength;
        assert.equal(le(result, extraOffset, 2), 0x0001, "the ZIP64 extra field is present");
        assert.equal(le(result, extraOffset + 2, 2), 16, "the local ZIP64 extra field holds both sizes");
        assert.equal(le(result, extraOffset + 4, 8), 12, "uncompressed size in the extra field");

        // central directory record
        var central = indexOfSig(result, "PK\x01\x02");
        assert.ok(central > 0, "central record found");
        assert.equal(le(result, central + 42, 4), MAX_32, "offset is the 0xFFFFFFFF marker");
        var centralExtra = central + 46 + le(result, central + 28, 2);
        assert.equal(le(result, centralExtra, 2), 0x0001, "the central ZIP64 extra field is present");
        assert.equal(le(result, centralExtra + 2, 2), 24, "the central ZIP64 extra field holds sizes + offset");
        assert.equal(le(result, centralExtra + 4, 8), 12, "uncompressed size");
        assert.equal(le(result, centralExtra + 20, 8), 0, "local header offset");

        // zip64 end of central directory + locator
        var eocd64 = indexOfSig(result, "PK\x06\x06");
        assert.ok(eocd64 > 0, "ZIP64 EOCD found");
        assert.equal(le(result, eocd64 + 4, 8), 44, "ZIP64 EOCD record size");
        assert.equal(le(result, eocd64 + 24, 8), 1, "entries count in the ZIP64 EOCD");
        var locator = indexOfSig(result, "PK\x06\x07");
        assert.equal(le(result, locator + 8, 8), eocd64, "the locator points to the ZIP64 EOCD");

        // classic EOCD gets the placeholders
        var eocd = indexOfSig(result, "PK\x05\x06");
        assert.equal(le(result, eocd + 8, 2), 0xFFFF, "entries count placeholder in the classic EOCD");
        assert.equal(le(result, eocd + 12, 4), MAX_32, "central dir size placeholder");
    });

    QUnit.test("a forced ZIP64 zip loads back (own reader + checkCRC32)", function (assert) {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        zip.folder("dir").file("a.bin", new Uint8Array([1, 2, 3, 254]));
        var generated = zip.generateSync({type: "uint8array", compression: "DEFLATE", zip64: true});
        var reloaded = JSZip.loadSync(generated, {checkCRC32: true});
        assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "text entry survived");
        assert.deepEqual(
            Array.prototype.slice.call(reloaded.file("dir/a.bin").sync("uint8array")),
            [1, 2, 3, 254],
            "binary entry survived"
        );
    });

    QUnit.test("streamFiles + zip64 writes 8 byte data descriptors and loads back", function (assert) {
        var zip = new JSZip();
        zip.file("Hello.txt", "Hello World\n");
        var result = zip.generateSync({type: "binarystring", streamFiles: true, zip64: true});

        var dd = indexOfSig(result, "PK\x07\x08");
        assert.ok(dd > 0, "data descriptor found");
        assert.equal(le(result, dd + 8, 8), 12, "8 byte compressed size in the data descriptor");
        assert.equal(le(result, dd + 16, 8), 12, "8 byte uncompressed size in the data descriptor");

        var reloaded = JSZip.loadSync(result, {optimizedBinaryString: true, checkCRC32: true});
        assert.equal(reloaded.file("Hello.txt").sync("string"), "Hello World\n", "the streamed ZIP64 zip loads back");
    });

    QUnit.test("more than 65535 entries: automatic ZIP64 EOCD", function (assert) {
        var zip = new JSZip();
        for (var i = 0; i < 65540; i++) {
            zip.file("f" + i, "");
        }
        var generated = zip.generateSync({type: "binarystring"});

        var eocd64 = indexOfSig(generated, "PK\x06\x06");
        assert.ok(eocd64 > 0, "ZIP64 EOCD found");
        assert.equal(le(generated, eocd64 + 24, 8), 65540, "real entries count in the ZIP64 EOCD");
        var eocd = indexOfSig(generated, "PK\x05\x06");
        assert.equal(le(generated, eocd + 8, 2), 0xFFFF, "classic EOCD entries count is the placeholder");

        var reloaded = JSZip.loadSync(generated, {optimizedBinaryString: true});
        assert.equal(Object.keys(reloaded.files).length, 65540, "all the entries load back");
    });

    // The white-box tests below feed fake sizes straight into ZipFileWorker:
    // actually producing a > 4 GiB file in every CI run would be too slow
    // (see the JSZIP2_BIG_TESTS test at the bottom for the real thing).
    if (typeof require === "function") {
        var ZipFileWorker = require("../../lib/generate/ZipFileWorker.js");
        var utf8 = require("../../lib/utf8.js");

        var drive = function (zip64Option, streamFiles, streamInfo) {
            var worker = new ZipFileWorker(streamFiles, "", "DOS", utf8.utf8encode, zip64Option);
            var out = [];
            worker.isPaused = false;
            worker.on("data", function (chunk) {
                out.push(chunk.data);
            });
            worker.entriesCount = 1;
            worker.openedSource(streamInfo);
            worker.closedSource(streamInfo);
            worker.flush();
            return out.join("");
        };

        var hugeInfo = function () {
            return {
                "file": {name: "big.bin", dir: false, date: new Date(1580000000000), comment: "", unixPermissions: null, dosPermissions: null},
                "compression": {magic: "\x00\x00"},
                "crc32": 0x12345678,
                "compressedSize": 5316911983139,   // ~4.8 TiB, needs 41 bits
                "uncompressedSize": 5316911983140
            };
        };

        QUnit.test("white-box: sizes over 4 GiB switch the entry to ZIP64 automatically", function (assert) {
            var result = drive(false, false, hugeInfo());

            assert.equal(le(result, 4, 2), 45, "version needed is 4.5");
            assert.equal(le(result, 18, 4), MAX_32, "compressed size marker");
            assert.equal(le(result, 22, 4), MAX_32, "uncompressed size marker");
            var extraOffset = 30 + le(result, 26, 2);
            assert.equal(le(result, extraOffset, 2), 0x0001, "ZIP64 extra field present");
            assert.equal(le(result, extraOffset + 4, 8), 5316911983140, "64 bit uncompressed size is exact");
            assert.equal(le(result, extraOffset + 12, 8), 5316911983139, "64 bit compressed size is exact");

            var central = indexOfSig(result, "PK\x01\x02");
            var centralExtra = central + 46 + le(result, central + 28, 2);
            assert.equal(le(result, centralExtra + 2, 2), 16, "central extra holds the sizes only (offset fits)");
            assert.notEqual(le(result, central + 42, 4), MAX_32, "offset stays a plain 4 byte value");
        });

        QUnit.test("white-box: an offset over 4 GiB gets its own ZIP64 field", function (assert) {
            var worker = new ZipFileWorker(false, "", "DOS", utf8.utf8encode, false);
            var out = [];
            worker.isPaused = false;
            worker.on("data", function (chunk) {
                out.push(chunk.data);
            });
            worker.entriesCount = 1;
            // pretend 5,000,000,000 bytes were already written before this entry
            worker.bytesWritten = 5000000000;
            var info = {
                "file": {name: "late.bin", dir: false, date: new Date(1580000000000), comment: "", unixPermissions: null, dosPermissions: null},
                "compression": {magic: "\x00\x00"},
                "crc32": 42,
                "compressedSize": 5,
                "uncompressedSize": 5
            };
            worker.openedSource(info);
            worker.closedSource(info);
            worker.flush();
            var result = out.join("");

            var central = indexOfSig(result, "PK\x01\x02");
            assert.equal(le(result, central + 42, 4), MAX_32, "offset marker in the central record");
            var centralExtra = central + 46 + le(result, central + 28, 2);
            assert.equal(le(result, centralExtra, 2), 0x0001, "ZIP64 extra field present");
            assert.equal(le(result, centralExtra + 2, 2), 8, "the extra field holds the offset only");
            assert.equal(le(result, centralExtra + 4, 8), 5000000000, "64 bit offset is exact");
            assert.equal(le(result, central + 20, 4), 5, "sizes stay plain 4 byte values");
        });

        QUnit.test("white-box: a streamed entry over 4 GiB without zip64: true fails loudly", function (assert) {
            var worker = new ZipFileWorker(true, "", "DOS", utf8.utf8encode, false);
            worker.isPaused = false;
            worker.on("data", function () {});
            worker.on("error", function () {});
            worker.entriesCount = 1;
            var info = hugeInfo();
            worker.openedSource(info);
            assert.throws(function () {
                worker.closedSource(info);
            }, /larger than 4 GiB and streamFiles is enabled: pass zip64: true/, "the error explains the fix");
        });
    }

    // The real thing: 4.2 GiB of zeros streamed through DEFLATE. The output
    // is tiny (~20 MB) but the uncompressed size crosses the 4 GiB line,
    // exercising the full ZIP64 write + read path end to end. ~45s, so it
    // only runs when JSZIP2_BIG_TESTS is set (done before every release).
    if (JSZip.support.nodestream && typeof process !== "undefined" && process.env.JSZIP2_BIG_TESTS) {
        QUnit.test("a real file over 4 GiB round trips", function (assert) {
            var done = assert.async();
            assert.timeout(10 * 60 * 1000);
            var Readable = require("stream").Readable;
            var TOTAL = 4.2 * 1024 * 1024 * 1024;
            var sent = 0;
            var chunk = Buffer.alloc(4 * 1024 * 1024);
            var source = new Readable({
                read: function () {
                    if (sent >= TOTAL) {
                        return this.push(null);
                    }
                    sent += chunk.length;
                    this.push(chunk);
                }
            });
            var zip = new JSZip();
            zip.file("zeros.bin", source);
            zip.generateAsync({type: "nodebuffer", compression: "DEFLATE", compressionOptions: {level: 1}})
                .then(function (generated) {
                    var entry = JSZip.loadSync(generated).file("zeros.bin");
                    assert.ok(entry._data.uncompressedSize > MAX_32, "uncompressed size over 4 GiB: " + entry._data.uncompressedSize);
                    assert.equal(entry._data.uncompressedSize, sent, "the exact size survived the round trip");
                    done();
                })["catch"](JSZipTestUtils.assertNoError);
        });
    }
});
