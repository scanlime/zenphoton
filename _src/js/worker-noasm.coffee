###
#   @license
#
#   Worker thread for Zen Photon Garden.
#
#   Plain JavaScript implementation (no asm.js).
#   This one is still fastest on Safari and on released versions of Firefox
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

lineLoop = (c, i, e, b, y, g, u, v) ->
    # Unrolled inner loop for line drawing algorithm.
    #
    # Most of the raytracer is inlined below, to avoid the costs
    # in accessing member variables or making function calls. Here,
    # we're tightly iterating using only a few variables, and a small
    # function runs much faster.

    loop

        return if i >= e
        t = b * (y - (y|0))
        c[j = i + v * (y|0)] += b - t
        c[j + v] += t
        y += g
        i += u

        return if i >= e
        t = b * (y - (y|0))
        c[j = i + v * (y|0)] += b - t
        c[j + v] += t
        y += g
        i += u

        return if i >= e
        t = b * (y - (y|0))
        c[j = i + v * (y|0)] += b - t
        c[j + v] += t
        y += g
        i += u

        return if i >= e
        t = b * (y - (y|0))
        c[j = i + v * (y|0)] += b - t
        c[j + v] += t
        y += g
        i += u


accumLoop = (s, d) ->
    # Unrolled inner loop for summing histogram data.

    i = 0
    e = s.length

    loop
        d[i] += s[i]
        i++
        d[i] += s[i]
        i++
        d[i] += s[i]
        i++
        d[i] += s[i]
        i++

        return if i >= e


accumLoopSat = (s, d) ->
    # Unrolled inner loop for summing histogram data, with saturation.

    i = 0
    e = s.length

    loop
        d[i] = 0xFFFFFFFF if (d[i] += s[i]) > 0xFFFFFFFF
        i++
        d[i] = 0xFFFFFFFF if (d[i] += s[i]) > 0xFFFFFFFF
        i++
        d[i] = 0xFFFFFFFF if (d[i] += s[i]) > 0xFFFFFFFF
        i++
        d[i] = 0xFFFFFFFF if (d[i] += s[i]) > 0xFFFFFFFF
        i++

        return if i >= e


@testClampedArray = () ->
    c = new Uint8ClampedArray(1)
    c[0] = 300
    return c[0] == 255


if @testClampedArray()
    # Normal image rendering loop

    renderLoop = (s, d, b) ->
        i = 0
        j = 0
        n = s.length
        loop
            d[i++] = d[i++] = d[i++] = s[j++] * b
            d[i++] = 0xFF
            d[i++] = d[i++] = d[i++] = s[j++] * b
            d[i++] = 0xFF
            d[i++] = d[i++] = d[i++] = s[j++] * b
            d[i++] = 0xFF
            d[i++] = d[i++] = d[i++] = s[j++] * b
            d[i++] = 0xFF
            return if j >= n

else
    # Image rendering loop with explicit clamps, in case Uint8ClampedArray()
    # isn't actually clamping like it's supposed to. (This seems to be the case
    # on current versions of Webkit, blan.)

    renderLoop = (s, d, b) ->
        i = 0
        j = 0
        n = s.length
        loop
            v = 0 | (s[j++] * b)
            v = 255 if v > 255
            d[i++] = d[i++] = d[i++] = v
            d[i++] = 0xFF

            v = 0 | (s[j++] * b)
            v = 255 if v > 255
            d[i++] = d[i++] = d[i++] = v
            d[i++] = 0xFF

            v = 0 | (s[j++] * b)
            v = 255 if v > 255
            d[i++] = d[i++] = d[i++] = v
            d[i++] = 0xFF

            v = 0 | (s[j++] * b)
            v = 255 if v > 255
            d[i++] = d[i++] = d[i++] = v
            d[i++] = 0xFF

            return if j >= n


@trace = (msg) ->
    # Raytracing loop! Traces a scene, passes back the histogram array afterward.
    # Returns a buffer object.

    width = msg.width
    height = msg.height
    lightX = msg.lightX
    lightY = msg.lightY
    segments = msg.segments
    numRays = msg.numRays

    counts = new Uint32Array(width * height)

    sqrt = Math.sqrt
    random = Math.random
    sin = Math.sin
    cos = Math.cos

    ################################################################
    # Prepare scene

    for s in segments
        dx = s.x1 - s.x0
        dy = s.y1 - s.y0

        # Calculate normal
        len = Math.sqrt(dx*dx + dy*dy)
        s.xn = -dy / len
        s.yn = dx / len

        # Calculate ray probabilities
        s.d1 = s.diffuse
        s.r2 = s.d1 + s.reflective
        s.t3 = s.r2 + s.transmissive

    while numRays--

        ################################################################
        # Start a new ray, at the light source

        t = random() * 6.283185307179586
        rayOriginX = lightX
        rayOriginY = lightY
        rayDirX = sin(t)
        rayDirY = cos(t)
        lastSeg = null

        ################################################################
        # Cast until the ray is absorbed or we hit our bounce limit

        bounces = 1000
        while bounces--
            closestDist = 1e38
            closestSeg = null

            raySlope = rayDirY / rayDirX

            for s in segments
                if s == lastSeg
                    continue

                ########################################################
                # Ray to Segment Intersection

                # Ray equation: [rayOrigin + rayDirection * M], 0 <= M
                # Segment equation: [p1 + (p2-p1) * N], 0 <= N <= 1
                # Returns true with dist=M if we find an intersection.
                #
                #  M = (seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x
                #  M = (seg1.y + segD.y * N - rayOrigin.y) / rayDirection.y

                s1x = s.x0
                s1y = s.y0
                sDx = s.x1 - s1x
                sDy = s.y1 - s1y

                # First solving for N, to see if there's an intersection at all:
                #
                #  M = (seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x
                #  N = (M * rayDirection.y + rayOrigin.y - seg1.y) / segD.y
                #
                #  N = (((seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x) *
                #     rayDirection.y + rayOrigin.y - seg1.y) / segD.y

                n = ((s1x - rayOriginX)*raySlope + (rayOriginY - s1y)) / (sDy - sDx*raySlope)
                if n < 0 or n > 1
                    continue

                # Now solve for M, the ray/segment distance

                m = (s1x + sDx * n - rayOriginX) / rayDirX
                if m < 0
                    continue

                # It's an intersection! Store it, and keep track of the closest one.
                if m < closestDist
                    closestDist = m
                    closestSeg = s

            if !closestSeg
                # Escaped from the scene? This may happen due to math inaccuracies.
                break

            # Locate the intersection point
            intX = rayOriginX + closestDist * rayDirX
            intY = rayOriginY + closestDist * rayDirY

            ################################################################
            # Draw one ray segment on the histogram, from (x0,y0) to (y0,y1)
            
            x0 = rayOriginX
            y0 = rayOriginY
            x1 = intX
            y1 = intY
            
            # Modified version of Xiaolin Wu's antialiased line algorithm:
            # http://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
            #
            # Brightness compensation:
            #   The total brightness of the line should be proportional to its
            #   length, but with Wu's algorithm it's proportional to dx.
            #   We scale the brightness of each pixel to compensate.

            dx = x1 - x0
            dy = y1 - y0
            dx = -dx if dx < 0
            dy = -dy if dy < 0

            if dy > dx
                # Swap X and Y axes
                t = x0
                x0 = y0
                y0 = t
                t = x1
                x1 = y1
                y1 = t
                hX = width
                hY = 1
            else
                hX = 1
                hY = width

            if x0 > x1
                t = x0
                x0 = x1
                x1 = t
                t = y0
                y0 = y1
                y1 = t

            dx = x1 - x0
            dy = y1 - y0
            gradient = dy / dx
            br = 128 * sqrt(dx*dx + dy*dy) / dx

            # First endpoint
            x05 = x0 + 0.5
            xend = x05|0
            yend = y0 + gradient * (xend - x0)
            xgap = br * (1 - x05 + xend)
            xpxl1 = xend + 1
            ypxl1 = yend|0
            i = hX * xend + hY * ypxl1
            counts[i] += xgap * (1 - yend + ypxl1)
            counts[i + hY] += xgap * (yend - ypxl1)
            intery = yend + gradient

            # Second endpoint
            x15 = x1 + 0.5
            xpxl2 = x15|0
            yend = y1 + gradient * (xpxl2- x1)
            xgap = br * (x15 - xpxl2)
            ypxl2 = yend|0
            i = hX * xpxl2 + hY * ypxl2
            counts[i] += xgap * (1 - yend + ypxl2)
            counts[i + hY] += xgap * (yend - ypxl2)

            lineLoop(counts, hX * xpxl1, hX * xpxl2, br, intery, gradient, hX, hY)

            ################################################################
            # What happens to the ray now?

            r = random()
            rayOriginX = intX
            rayOriginY = intY
            lastSeg = closestSeg
        
            if r < closestSeg.d1
                # Diffuse reflection. Angle randomized.
                t = random() * 6.283185307179586
                rayDirX = sin(t)
                rayDirY = cos(t)

            else if r < closestSeg.r2
                # Glossy reflection. Angle reflected.
                xn = closestSeg.xn
                yn = closestSeg.yn
                d = 2 * (xn * rayDirX + yn * rayDirY)
                rayDirX -= d * xn
                rayDirY -= d * yn

            else if r >= closestSeg.t3
                # Absorbed
                break

    return counts


@job_trace = (msg) ->
    # Trace rays, and send back the buffer.

    c = @trace(msg)
    @postMessage({
        'job': msg.job,
        'cookie': msg.cookie,
        'numRays': msg.numRays,
        'counts': c.buffer,
    }, [c.buffer])


@job_accumulate = (msg) ->
    # Accumulate samples from another thread's raytracing. No response.

    src = new Uint32Array(msg.counts)

    if msg.cookie > @cookie
        # Newer cookie; start over

        @accumulator = src
        @raysTraced = msg.numRays
        @cookie = msg.cookie

    else if msg.cookie == @cookie
        # Accumulator matches.
        # Use our saturation-robust accumulator loop only if enough rays
        # have been cast such that saturation is a concern.

        @raysTraced += msg.numRays
        if @raysTraced >= 0xffffff
            accumLoopSat(src, @accumulator)
        else
            accumLoop(src, @accumulator)


@job_render = (msg) ->
    # Using the current accumulator state, render an RGBA image.

    pix = new Uint8ClampedArray(4 * @accumulator.length)
    br = Math.exp(1 + 10 * msg.exposure) / @raysTraced
    renderLoop(@accumulator, pix, br)

    @postMessage({
        'job': msg.job,
        'cookie': @cookie,
        'raysTraced': @raysTraced,
        'pixels': pix.buffer,
    }, [pix.buffer])


@job_firstTrace = (msg) ->
    # Trace rays, replace the entire accumulator buffer with the new counts,
    # and return a rendered image. This is the fastest way to initialize the
    # accumulator with data from a modified scene, so this is what we use during
    # interactive rendering.

    @accumulator = @trace(msg)
    @raysTraced = msg.numRays
    @cookie = msg.cookie
    @job_render(msg)


@onmessage = (event) =>
    msg = event.data
    this['job_' + msg.job](msg)
