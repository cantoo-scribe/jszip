---
title: "generateWebStream(options[, onUpdate])"
layout: default
section: api
---

Generates the complete zip file at the current folder level, as a web
`ReadableStream` (WHATWG Streams). This is the web counterpart of
[generateNodeStream]({{site.baseurl}}/documentation/api_jszip/generate_node_stream.html).

Backpressure is honored: the zip generation pauses when the consumer stops
reading and resumes on demand.

__Returns__ : A web [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
of the zip content.

__Since__: @bybrave/jszip2 v4.2.0 (see
[upstream issue #830](https://github.com/Stuk/jszip/issues/830))

## Arguments

name      | type     | default | description
----------|----------|---------|------------
options   | object   |         | same as [generateAsync]({{site.baseurl}}/documentation/api_jszip/generate_async.html); `type` is restricted to `uint8array` (the default) or `nodebuffer`
onUpdate  | function |         | The optional function called on each internal update with the metadata.

## Examples

```js
// stream a zip download from a service worker / server-side runtime
const stream = zip.generateWebStream({ compression: "DEFLATE" });
return new Response(stream, {
    headers: { "Content-Type": "application/zip" }
});
```

```js
// write to a file with the File System Access API
const handle = await window.showSaveFilePicker({suggestedName: "archive.zip"});
await zip.generateWebStream().pipeTo(await handle.createWritable());
```
