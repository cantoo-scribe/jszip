"use strict";

/**
 * Create a web ReadableStream (WHATWG Streams) using a StreamHelper as
 * source. Backpressure is honored: the workers chain is paused when the
 * stream's internal queue is full and resumed on pull().
 * @param {StreamHelper} helper the helper wrapping the worker.
 * @param {Function} updateCb the update callback.
 * @return {ReadableStream} the web stream.
 */
module.exports = function (helper, updateCb) {
    // once the consumer cancels, the stream refuses chunks: drop the ones
    // already scheduled on the event loop before pause() took effect.
    var cancelled = false;

    return new ReadableStream({
        start: function (controller) {
            helper
                .on("data", function (data, meta) {
                    if (cancelled) {
                        return;
                    }
                    controller.enqueue(data);
                    if (controller.desiredSize !== null && controller.desiredSize <= 0) {
                        helper.pause();
                    }
                    if (updateCb) {
                        updateCb(meta);
                    }
                })
                .on("error", function (e) {
                    if (cancelled) {
                        return;
                    }
                    controller.error(e);
                })
                .on("end", function () {
                    if (cancelled) {
                        return;
                    }
                    controller.close();
                });
        },
        pull: function () {
            helper.resume();
        },
        cancel: function () {
            cancelled = true;
            helper.pause();
        }
    });
};
