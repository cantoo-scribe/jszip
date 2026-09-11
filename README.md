# @cantoo/jszip

Maintained fork of [JSZip](https://github.com/Stuk/jszip) — create, read and edit `.zip` files with JavaScript, in Node.js and the browser.

Based on [@bybrave/jszip2](https://github.com/bybraveHQ/jszip2) (modern runtime, sync API, web streams, ZIP64), with **[fflate](https://github.com/101arrowz/fflate)** instead of pako for compression.

```bash
npm install @cantoo/jszip
```

```js
// CommonJS
const JSZip = require("@cantoo/jszip");

// ESM
import JSZip from "@cantoo/jszip";

const zip = new JSZip();
zip.file("hello.txt", "Hello World\n");
zip.folder("images").file("smile.gif", imgData, { base64: true });
const blob = await zip.generateAsync({ type: "blob" });

const archive = await JSZip.loadAsync(data);
const text = await archive.file("hello.txt").async("string");
```

## What's included (from jszip2 + this fork)

| Change | Notes |
|---|---|
| ESM + `exports` map with types | drop-in for modern bundlers |
| Native `Promise` / `setImmediate` / `MessageChannel` | no `lie` / `setimmediate` polyfills |
| Node `stream` + browser stub | no `readable-stream` |
| **fflate** for DEFLATE | smaller/faster than pako |
| Blob input in Node via `arrayBuffer()` | no FileReader required |
| Sync API (`generateSync`, `loadSync`, `file.sync`) | from jszip2 4.1 |
| Web Streams (`generateWebStream`, `webStream`) | from jszip2 4.2 |
| ZIP64 write + exact 64-bit reads | from jszip2 4.3 (covers [#777](https://github.com/Stuk/jszip/issues/777) / large sizes) |
| Build with esbuild | Node ≥ 18 |

## Migrating from `jszip` / `@bybrave/jszip2`

```diff
- const JSZip = require('jszip');
+ const JSZip = require('@cantoo/jszip');
```

Same 3.x API. Node.js ≥ 18; no IE. Compressed payloads are not bit-identical to zlib/pako/Info-ZIP, but they round-trip and interoperate with standard unzip tools.

## Compatibility

- Full original API docs: [stuk.github.io/jszip](https://stuk.github.io/jszip/) (copy in [`documentation/`](./documentation))
- `JSZip.external.Promise` remains overridable
- Browser builds: `dist/jszip.js` / `dist/jszip.min.js`

## Credits & license

Dual-licensed MIT or GPLv3 — see [LICENSE.markdown](./LICENSE.markdown).

Based on [JSZip](https://github.com/Stuk/jszip) by Stuart Knightley et al., and modernization work from [bybraveHQ/jszip2](https://github.com/bybraveHQ/jszip2).
