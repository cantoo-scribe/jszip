---
title: "loadSync(data [, options])"
layout: default
section: api
---

Read an existing zip and merge the data in the current JSZip object at the
current folder level, synchronously. This is the blocking counterpart of
[loadAsync]({{site.baseurl}}/documentation/api_jszip/load_async.html): same
options, same merging behavior, same filename sanitization.

Also available as a static method: `JSZip.loadSync(data)` is a shortcut for
`new JSZip().loadSync(data)`.

__Returns__ : The updated JSZip object.

__Throws__ : An error if the data is not available synchronously (a `Blob`,
a `Promise` or a nodejs stream), if it is not valid zip data or if it uses
unsupported features (multi volume, password protected, etc).

__Since__: @bybrave/jszip2 v4.1.0 (see
[upstream issue #281](https://github.com/Stuk/jszip/issues/281))

## Arguments

name    | type   | description
--------|--------|------------
data    | String/Array of bytes/ArrayBuffer/Uint8Array/Buffer | the zip file
options | object | same as [loadAsync]({{site.baseurl}}/documentation/api_jszip/load_async.html), including `checkCRC32` (checked synchronously)

## Examples

```js
// in nodejs
var zip = JSZip.loadSync(require("fs").readFileSync("hello.zip"));
var content = zip.file("Hello.txt").sync("string");
```
