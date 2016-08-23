###
#   @license
#
#   Worker thread for Zen Photon Garden.
#
#   Workers are used for our CPU-intensive computing tasks:
#
#       - Rendering a scene to a ray histogram
#       - Combining multiple ray histograms
#       - Rendering a combined ray histogram to a bitmap
#
#   Copyright (c) 2013 Micah Elizabeth Scott <micah@scanlime.org>
#
#   Permission is hereby granted, free of charge, to any person
#   obtaining a copy of this software and associated documentation
#   files (the "Software"), to deal in the Software without
#   restriction, including without limitation the rights to use,
#   copy, modify, merge, publish, distribute, sublicense, and/or sell
#   copies of the Software, and to permit persons to whom the
#   Software is furnished to do so, subject to the following
#   conditions:
#
#   The above copyright notice and this permission notice shall be
#   included in all copies or substantial portions of the Software.
#
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
#   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
#   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
#   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
#   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
#   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
#   OTHER DEALINGS IN THE SOFTWARE.
#
###

AsmModule = require './worker-asm-core'

#####################################################################
# Entry point


# thisをglobalにするために無名関数でwrap
do ->
    @onmessage = (event) =>
        @init()
        msg = event.data
        switch msg.job
            when 'trace' then @job_trace msg
            when 'firstTrace' then @job_firstTrace msg
            when 'accumulate' then @job_accumulate msg
            when 'render' then @job_render msg


    @init = () ->
        # First-time setup

        if not Math.imul
            # This is close enough for our purposes. If we need it, real polyfill is at:
            # https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/imul
            Math.imul = (a, b) -> a * b

        # Allocate heap
        @heap = new ArrayBuffer 0x800000
        @F32 = new Float32Array @heap
        @U32 = new Uint32Array @heap

        @zeroes = new ArrayBuffer 0x10000
        @Z32 = new Uint32Array @zeroes

        stdlib =
            Math: Math
            Uint32Array: Uint32Array
            Float32Array: Float32Array

        # Link the asm.js module
        @AsmFn = AsmModule stdlib, {}, @heap

        # One-time initialization done.
        @init = () -> null


    #####################################################################
    # Utilities


    alloc32 = (ptr, width, height) ->
        return ptr + (4 * width * height)


    @allocScene = (ptr, scene) ->
        # Transcribe our scene from an array of Segment objects into a flat list of floats in our heap

        for s in scene
            dx = s.x1 - s.x0
            dy = s.y1 - s.y0

            # Calculate normal
            len = Math.sqrt(dx*dx + dy*dy)
            xn = -dy / len
            yn = dx / len

            # Calculate ray probabilities
            d1 = s.diffuse
            r2 = d1 + s.reflective
            t3 = r2 + s.transmissive

            @F32[(ptr + 0 ) >> 2] = s.x0
            @F32[(ptr + 4 ) >> 2] = s.y0
            @F32[(ptr + 8 ) >> 2] = dx
            @F32[(ptr + 12) >> 2] = dy
            @F32[(ptr + 16) >> 2] = d1
            @F32[(ptr + 20) >> 2] = r2
            @F32[(ptr + 24) >> 2] = t3
            @F32[(ptr + 28) >> 2] = xn
            @F32[(ptr + 32) >> 2] = yn

            ptr += 64
        return ptr

    @traceWithHeap = (ptr, msg) ->
        # Middleman for AsmFn.trace(), helps set up the heap first

        # Heap layout
        counts = ptr
        sceneBegin = alloc32(counts, msg.width, msg.height)
        sceneEnd = @allocScene(sceneBegin, msg.segments)

        # Use JavaScript's PRNG to seed our fast inlined PRNG
        seed = (Math.random() * 0xFFFFFFFF)|0

        @AsmFn.trace(counts, msg.width, msg.height, msg.lightX, msg.lightY, msg.numRays, sceneBegin, sceneEnd, seed)

    @memzero = (begin, end) ->
        # Quickly zero an area of the heap, by splatting data from a zero buffer.
        # Must be 32-bit aligned.

        loop
            l = end - begin
            if l <= 0
                return

            if l >= 0x10000
                @U32.set(@Z32, begin >> 2)
                begin += 0x10000
            else
                @U32.set(@Z32.slice(0, l >> 2), begin >> 2)
                begin += l


    #####################################################################
    # Job handlers


    @job_trace = (msg) ->
        # Trace rays, and transfer back a copy of the rendering

        # Heap layout
        counts = 0
        endCounts = alloc32(counts, msg.width, msg.height)

        @memzero(counts, endCounts)
        @traceWithHeap(counts, msg)
        result = @heap.slice(counts, endCounts)

        @postMessage({
            job: msg.job,
            cookie: msg.cookie,
            numRays: msg.numRays,
            counts: result,
        }, [result])


    @job_accumulate = (msg) ->
        # Accumulate samples from another thread's raytracing. No response.

        # Heap layout
        accumulator = 0
        src = alloc32(accumulator, @width, @height)

        # Input buffer
        counts = new Uint32Array msg.counts

        if msg.cookie > @cookie
            # Newer cookie; start over

            @U32.set(counts, accumulator>>2)
            @raysTraced = msg.numRays
            @cookie = msg.cookie

        else if msg.cookie == @cookie
            # Accumulator matches.
            # Use our saturation-robust accumulator loop only if enough rays
            # have been cast such that saturation is a concern.

            @U32.set(counts, src>>2)
            n = @width * @height
            @raysTraced += msg.numRays

            if @raysTraced >= 0xffffff
                @AsmFn.accumLoopSat(src, accumulator, n)
            else
                @AsmFn.accumLoop(src, accumulator, n)


    @job_render = (msg) ->
        # Using the current accumulator state, render an RGBA image.
        # Copies the pixel data into a smaller buffer, which is transferred back.

        # Heap layout
        accumulator = 0
        pixels = alloc32(accumulator, msg.width, msg.height)
        end = alloc32(pixels, msg.width, msg.height)

        # Brightness calculation
        br = Math.exp(1 + 10 * msg.exposure) / @raysTraced

        n = msg.width * msg.height
        @AsmFn.renderLoop(accumulator, pixels, n, br)
        result = @heap.slice(pixels, end)

        @postMessage({
            job: msg.job,
            cookie: @cookie,
            raysTraced: @raysTraced,
            pixels: result,
        }, [result])


    @job_firstTrace = (msg) ->
        # Trace rays, replace the entire accumulator buffer with the new counts,
        # and return a rendered image. This is the fastest way to initialize the
        # accumulator with data from a modified scene, so this is what we use during
        # interactive rendering.

        @width = msg.width
        @height = msg.height

        # Heap layout
        accumulator = 0
        end = alloc32(accumulator, msg.width, msg.height)

        # Zero the accumulator
        @memzero(accumulator, end)

        @traceWithHeap(accumulator, msg)
        @raysTraced = msg.numRays
        @cookie = msg.cookie

        @job_render(msg)
