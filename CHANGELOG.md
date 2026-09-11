# Changelog

`@cantoo/jszip` is based on [@bybrave/jszip2](https://github.com/bybraveHQ/jszip2)
(itself a maintained fork of [Stuk/jszip](https://github.com/Stuk/jszip)).

## 4.3.0 (Cantoo)

- Switch compression from pako to [fflate](https://github.com/101arrowz/fflate).
- Rebrand as `@cantoo/jszip`; keep jszip2 features (ESM, sync API, web streams, ZIP64).

## Upstream jszip2 notes

The following sections are from `@bybrave/jszip2` 4.x (dates 2026-07-05).

## 4.3.0 — 2026-07-05

ZIP64: files and archives over 4 GB, and over 65 535 entries
([Stuk/jszip#580](https://github.com/Stuk/jszip/issues/580),
[#739](https://github.com/Stuk/jszip/issues/739)). The jszip2 marathon is complete:
ESM + modern runtime (4.0), sync API (4.1), web streams (4.2), ZIP64 (4.3).

### Added
- Automatic ZIP64 writing. No configuration: when a size, an offset or the entries
  count overflows the classic format, the affected entries get their ZIP64 extra
  field and the archive gets a ZIP64 end-of-central-directory record — field by
  field, exactly per APPNOTE, so small zips don't change by a single byte
  (verified byte-identical to 4.2.0 output).
- `zip64: true` generate option for the one case automation can't cover:
  `streamFiles: true` with entries over 4 GiB, whose local header is written before
  the sizes are known (a descriptive error reminds you otherwise). Can also force
  ZIP64 everywhere for testing.
- Exact 64-bit reads. Reading ZIP64 existed upstream, but values beyond 4 GB were
  truncated by 32-bit bitwise arithmetic (the exact bug of #739). 8-byte fields are
  now read arithmetically — exact up to 2^53 − 1, no BigInt needed.

### Fixed
- Sync API stack overflow on zips with thousands of entries (each entry's end
  synchronously resumed the next one; now driven by a trampoline queue). Affected
  `generateSync` in 4.1.0–4.2.0 with roughly 2000+ files.

### Verification
- 232 tests (8 new ZIP64 suites incl. byte-level header checks), plus a gated
  real-4.2-GiB round-trip test run before this release.
- Archives with >4 GB files, 65 540 entries, forced ZIP64 and streamed ZIP64 all
  validated by Info-ZIP `unzip -t` / `zipinfo`.
- Output without ZIP64 involvement is byte-identical to 4.2.0.

## 4.2.0 — 2026-07-05

WHATWG Streams support, in and out
([Stuk/jszip#345](https://github.com/Stuk/jszip/issues/345),
[#830](https://github.com/Stuk/jszip/issues/830)). Works in browsers, Web Workers
and Node.js ≥ 18 — `ReadableStream` is global everywhere, no polyfills.

### Added
- Input: `file()` and `loadAsync()` accept a web `ReadableStream`, including a
  `fetch` response body — zip or load without buffering first.
- Output: `generateWebStream()` and `file.webStream()` mirror the Node.js stream API
  (service workers, edge runtimes, `pipeTo`).
- Backpressure honored both ways: input streams are only pulled while the pipeline is
  running; output pauses zip generation when the consumer stops reading.
- Input chunks can be `Uint8Array`, `ArrayBuffer` or strings; unsupported chunk types
  fail with an error naming the file.
- Feature detection via `JSZip.support.webstream`.
- Like Node.js streams, files added from a web stream can't be read with the sync API
  from 4.1.0 — those throw a descriptive error.
- 13 new tests (224 total), TypeScript definitions included.

## 4.1.0 — 2026-07-05

The most-requested feature of the original JSZip
([Stuk/jszip#281](https://github.com/Stuk/jszip/issues/281), open since 2016):
a full synchronous API.

### Added
- Every async entry point now has a sync mirror — same options, same output types,
  byte-identical results: `generateSync(options)` (mirrors `generateAsync`),
  `JSZip.loadSync(data, options)` (mirrors `loadAsync`), and `file.sync(type)`
  (mirrors `file.async`). `checkCRC32` is supported by `loadSync` too.
- Works in Node.js, browsers and Web Workers (including the `dist/` bundles).
- The one rule: the data must actually be available synchronously. Files added from a
  `Blob`, a `Promise` or a Node.js stream throw a descriptive error naming the file.
  The async API is unchanged.

### Under the hood
- No duplicated code paths: the same worker pipeline is driven by a blocking loop
  (`SyncDataWorker`) instead of the event loop, which is why sync and async outputs
  are byte-identical.
- Content added from synchronous sources is prepared once and shared by both APIs.
- 22 new tests (211 total), TypeScript definitions included.

## 4.0.0 — 2026-07-05

Modernization of the fork: ESM, a modern runtime and a single dependency.

### Changed
- Dropped `lie`, `setimmediate` and `readable-stream`
  ([Stuk/jszip#909](https://github.com/Stuk/jszip/issues/909),
  [#934](https://github.com/Stuk/jszip/issues/934),
  [#596](https://github.com/Stuk/jszip/issues/596),
  [#704](https://github.com/Stuk/jszip/issues/704)) — using native Promises and
  Node.js streams instead.
- Upgraded to `pako` 2 ([Stuk/jszip#720](https://github.com/Stuk/jszip/issues/720)).
- Ships ESM alongside CJS
  ([Stuk/jszip#867](https://github.com/Stuk/jszip/issues/867),
  [#717](https://github.com/Stuk/jszip/issues/717)).
- Blob input in Node.js is read via `arrayBuffer()`.
- Build switched from grunt/browserify to esbuild.
- Dependencies reduced from 4 to 1.

### Verification
- The original 189-test suite passes on Node.js 18/20/22.
- Install verified for CJS, ESM and the `dist/` bundles.
