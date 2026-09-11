---
title: "webStream(type[, onUpdate])"
layout: default
section: api
---

Return the content of the file as a web `ReadableStream` (WHATWG Streams).
This is the web counterpart of
[nodeStream]({{site.baseurl}}/documentation/api_zipobject/node_stream.html).

__Returns__ : A web [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
of the content.

__Since__: @bybrave/jszip2 v4.2.0

## Arguments

name     | type     | default      | description
---------|----------|--------------|------------
type     | String   | `uint8array` | the type of each chunk: `uint8array` or `nodebuffer`
onUpdate | function |              | an optional function called on each internal update with the metadata.

## Examples

```js
const zip = await JSZip.loadAsync(data);
const stream = zip.file("video.mp4").webStream();
await stream.pipeTo(destination);
```
