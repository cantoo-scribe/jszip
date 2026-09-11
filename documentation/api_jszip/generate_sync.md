---
title: "generateSync(options)"
layout: default
section: api
---

Generates the complete zip file at the current folder level, synchronously.
This is the blocking counterpart of
[generateAsync]({{site.baseurl}}/documentation/api_jszip/generate_async.html):
same options, same output types, byte-identical result.

__Returns__ : The generated zip file, in the format specified by `type`.

__Throws__ : An error if a file of the zip comes from an asynchronous source
(a `Blob`, a `Promise`, a nodejs stream): such content can't be read without
awaiting it. The error names the offending file. Everything else works,
including zips loaded with
[loadAsync]({{site.baseurl}}/documentation/api_jszip/load_async.html).

__Since__: @bybrave/jszip2 v4.1.0 (see
[upstream issue #281](https://github.com/Stuk/jszip/issues/281))

## Arguments

Same as [generateAsync]({{site.baseurl}}/documentation/api_jszip/generate_async.html),
except `onUpdate`: there is no update callback, the method returns when the
zip is complete.

Note that a synchronous call blocks the thread (and in a browser, the UI)
until the whole archive is generated: prefer `generateAsync` for big archives
on the main thread. `generateSync` shines in CLI scripts, Web Workers and
code that can't be made asynchronous.

## Examples

```js
var zip = new JSZip();
zip.file("Hello.txt", "Hello World\n");

// in nodejs
require("fs").writeFileSync("hello.zip", zip.generateSync({
    type: "nodebuffer",
    compression: "DEFLATE"
}));

// in a browser (or a Web Worker)
var blob = zip.generateSync({type: "blob"});
```
