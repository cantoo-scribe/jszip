"use strict";

// Smoke test for the browser bundles: evaluates dist/jszip(.min).js in a
// scope without `require` (like a <script> tag) and runs a zip round-trip.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

async function testBundle(file) {
    const code = fs.readFileSync(path.join(__dirname, "..", "dist", file), "utf8");
    const JSZip = new Function(`${code}; return JSZip;`)();

    assert.strictEqual(JSZip.version, require("../package.json").version, `${file}: version matches package.json`);
    assert.strictEqual(JSZip.support.nodestream, false, `${file}: node streams disabled in the browser bundle`);
    assert.strictEqual(JSZip.support.blob, true, `${file}: blob supported`);

    const zip = new JSZip();
    zip.file("hello.txt", "hello jszip2");
    zip.folder("dir").file("a.bin", new Uint8Array([1, 2, 3]));

    const b64 = await zip.generateAsync({ type: "base64", compression: "DEFLATE" });
    const reloaded = await JSZip.loadAsync(b64, { base64: true });

    assert.strictEqual(await reloaded.file("hello.txt").async("string"), "hello jszip2");
    assert.deepStrictEqual(
        Array.from(await reloaded.file("dir/a.bin").async("uint8array")),
        [1, 2, 3],
    );

    const blobInput = new Blob([new Uint8Array([4, 5, 6])]);
    zip.file("blob.bin", blobInput);
    const reloaded2 = await JSZip.loadAsync(await zip.generateAsync({ type: "blob" }));
    assert.deepStrictEqual(
        Array.from(await reloaded2.file("blob.bin").async("uint8array")),
        [4, 5, 6],
    );

    const syncZip = new JSZip();
    syncZip.file("sync.txt", "sync in the bundle");
    const reloaded3 = JSZip.loadSync(syncZip.generateSync({ type: "uint8array", compression: "DEFLATE" }));
    assert.strictEqual(reloaded3.file("sync.txt").sync("string"), "sync in the bundle", `${file}: sync API round trip`);

    assert.strictEqual(JSZip.support.webstream, true, `${file}: web streams supported`);
    const wsZip = new JSZip();
    wsZip.file("ws.txt", new Response("web streams in the bundle").body);
    const wsOut = await new Response(wsZip.generateWebStream({ compression: "DEFLATE" })).arrayBuffer();
    const reloaded4 = await JSZip.loadAsync(wsOut);
    assert.strictEqual(await reloaded4.file("ws.txt").async("string"), "web streams in the bundle", `${file}: web stream round trip`);

    console.log(`${file} OK`);
}

(async () => {
    await testBundle("jszip.js");
    await testBundle("jszip.min.js");
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
