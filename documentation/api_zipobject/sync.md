---
title: "sync(type)"
layout: default
section: api
---

Return the content of the file in the asked type, synchronously. This is the
blocking counterpart of
[async]({{site.baseurl}}/documentation/api_zipobject/async.html): same types,
same result.

__Returns__ : The content of the file, in the format specified by `type`.

__Throws__ : An error if the file comes from an asynchronous source (a
`Blob`, a `Promise`, a nodejs stream): such content can't be read without
awaiting it. Files of a zip loaded with
[loadAsync]({{site.baseurl}}/documentation/api_jszip/load_async.html) or
[loadSync]({{site.baseurl}}/documentation/api_jszip/load_sync.html) work.

__Since__: @bybrave/jszip2 v4.1.0 (see
[upstream issue #281](https://github.com/Stuk/jszip/issues/281))

## Arguments

name | type   | description
-----|--------|------------
type | String | same values as [async]({{site.baseurl}}/documentation/api_zipobject/async.html): `base64`, `text` (or `string`), `binarystring`, `array`, `uint8array`, `arraybuffer`, `nodebuffer`, `blob`.

## Examples

```js
var zip = JSZip.loadSync(data);
var text = zip.file("hello.txt").sync("string");
var bytes = zip.file("image.png").sync("uint8array");
```
