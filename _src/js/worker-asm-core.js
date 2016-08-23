/*
 * @license
 *
 * Low-level asm.js code for Zen Photon Garden worker thread.
 *
 * These low-level functions can be treated as asm.js code, and optimized
 * significantly more than standard JavaScript. See the asm.js spec:
 *   http://asmjs.org/spec/latest/
 *
 * On browsers that don't support asm.js, this code will compile as
 * normal JavaScript.
 *
 * Copyright (c) 2013 Micah Elizabeth Scott <micah@scanlime.org>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

function AsmModule (stdlib, foreign, heap) {
    "use asm";

    var F32 = new stdlib.Float32Array(heap);
    var U32 = new stdlib.Uint32Array(heap);

    var sqrt = stdlib.Math.sqrt;
    var sin = stdlib.Math.sin;
    var cos = stdlib.Math.cos;
    var imul = stdlib.Math.imul;

    function lineLoop(i, e, b, y, g, u, v) {
        // Unrolled inner loop for line drawing algorithm.

        i = i|0;    // Major-axis starting point
        e = e|0;    // Major-axis end point
        b = +b;     // Brightness scale factor
        y = +y;     // Minor-axis float coordinate
        g = +g;     // Minor-axis gradient
        u = u|0;    // Major-axis stride
        v = v|0;    // Minor-axis stride

        var t = 0.0;   // Float temp (brightness result)
        var j = 0;     // Signed int temp (address / Y int-part)

        for (;;) {
            // Unrolled 4x

            if (((i - e)|0) >= 0) return;
            j = ~~y;
            t = b * (y - +(j|0));
            j = (i + imul(v, j))|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~(b - t);
            j = (j + v)|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~t;
            y = +(y + g);
            i = (i + u)|0;

            if (((i - e)|0) >= 0) return;
            j = ~~y;
            t = b * (y - +(j|0));
            j = (i + imul(v, j))|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~(b - t);
            j = (j + v)|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~t;
            y = +(y + g);
            i = (i + u)|0;

            if (((i - e)|0) >= 0) return;
            j = ~~y;
            t = b * (y - +(j|0));
            j = (i + imul(v, j))|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~(b - t);
            j = (j + v)|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~t;
            y = +(y + g);
            i = (i + u)|0;

            if (((i - e)|0) >= 0) return;
            j = ~~y;
            t = b * (y - +(j|0));
            j = (i + imul(v, j))|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~(b - t);
            j = (j + v)|0;
            U32[j>>2] = (U32[j>>2]|0) + ~~t;
            y = +(y + g);
            i = (i + u)|0;
        }
    }

    function accumLoop (s, d, n) {
        // Unrolled inner loop for summing histogram data.

        s = s|0;
        d = d|0;
        n = n|0;

        for (;;) {
            // Unrolled 4x

            U32[d>>2] = (U32[d>>2]|0) + (U32[s>>2]|0);
            s = (s + 4)|0;
            d = (d + 4)|0;

            U32[d>>2] = (U32[d>>2]|0) + (U32[s>>2]|0);
            s = (s + 4)|0;
            d = (d + 4)|0;

            U32[d>>2] = (U32[d>>2]|0) + (U32[s>>2]|0);
            s = (s + 4)|0;
            d = (d + 4)|0;

            U32[d>>2] = (U32[d>>2]|0) + (U32[s>>2]|0);
            s = (s + 4)|0;
            d = (d + 4)|0;

            n = (n - 4)|0;
            if (!n) return;
        }
    }

    function accumLoopSat (s, d, n) {
        // Unrolled inner loop for summing histogram data, with saturation.

        s = s|0;
        d = d|0;
        n = n|0;

        var x = 0.0;

        for (;;) {
            // Unrolled 4x

            x = +(U32[d>>2]|0) + (+(U32[s>>2]|0));
            if (x > 2147483647.0) x = 2147483647.0;
            U32[d>>2] = ~~x;
            s = (s + 4)|0;
            d = (d + 4)|0;

            x = +(U32[d>>2]|0) + (+(U32[s>>2]|0));
            if (x > 2147483647.0) x = 2147483647.0;
            U32[d>>2] = ~~x;
            s = (s + 4)|0;
            d = (d + 4)|0;

            x = +(U32[d>>2]|0) + (+(U32[s>>2]|0));
            if (x > 2147483647.0) x = 2147483647.0;
            U32[d>>2] = ~~x;
            s = (s + 4)|0;
            d = (d + 4)|0;

            x = +(U32[d>>2]|0) + (+(U32[s>>2]|0));
            if (x > 2147483647.0) x = 2147483647.0;
            U32[d>>2] = ~~x;
            s = (s + 4)|0;
            d = (d + 4)|0;

            n = (n - 4)|0;
            if (!n) return;
        }
    }

    function renderLoop (s, d, n, b) {
        // Unrolled image rendering loop.
        // Converts 'n' counts from 's' to pixels in 'd', using brightness 'b'

        s = s|0;
        d = d|0;
        n = n|0;
        b = +b;

        var g = 0;    // Gray level

        for (;;) {
            // Unrolled 4x

            g = ~~(+(U32[s>>2]|0) * b);
            if (~~(g - 0xFF) > 0) g = 0xFF;
            U32[d>>2] = 0xFF000000 | (g << 16) | (g << 8) | g;
            s = (s + 4)|0;
            d = (d + 4)|0;

            g = ~~(+(U32[s>>2]|0) * b);
            if (~~(g - 0xFF) > 0) g = 0xFF;
            U32[d>>2] = 0xFF000000 | (g << 16) | (g << 8) | g;
            s = (s + 4)|0;
            d = (d + 4)|0;

            g = ~~(+(U32[s>>2]|0) * b);
            if (~~(g - 0xFF) > 0) g = 0xFF;
            U32[d>>2] = 0xFF000000 | (g << 16) | (g << 8) | g;
            s = (s + 4)|0;
            d = (d + 4)|0;

            g = ~~(+(U32[s>>2]|0) * b);
            if (~~(g - 0xFF) > 0) g = 0xFF;
            U32[d>>2] = 0xFF000000 | (g << 16) | (g << 8) | g;
            s = (s + 4)|0;
            d = (d + 4)|0;

            n = (n - 4)|0;
            if (!n) return;
        }
    }

    function trace (counts, width, height, lightX, lightY, numRays, sceneBegin, sceneEnd, seed) {
        // Big ugly monolithic raytracing loop!

        counts = counts|0;
        width = width|0;
        height = height|0;
        lightX = +lightX;
        lightY = +lightY;
        numRays = numRays|0;
        sceneBegin = sceneBegin|0;
        sceneEnd = sceneEnd|0;
        seed = seed|0;

        // Our inlined PRNG algorithm is the simple public domain algorithm from:
        // http://burtleburtle.net/bob/rand/smallprng.html
        var rng0 = 0xf1ea5eed;
        var rng1 = 0;
        var rng2 = 0;
        var rng3 = 0;
        var rng4 = 0;

        var t = 0.0;

        var rayOriginX = 0.0;
        var rayOriginY = 0.0;
        var rayDirX = 0.0;
        var rayDirY = 0.0;
        var raySlope = 0.0;

        var lastSeg = -1;
        var segment = 0;
        var bounces = 0;

        var closestDist = 0.0;
        var closestSeg = -1;

        var s1x = 0.0;
        var s1y = 0.0;
        var sDx = 0.0;
        var sDy = 0.0;
        var n = 0.0;
        var m = 0.0;

        var intX = 0.0;
        var intY = 0.0;

        var x0 = 0.0;
        var y0 = 0.0;
        var x1 = 0.0;
        var y1 = 0.0;
        var dx = 0.0;
        var dy = 0.0;
        var hX = 0;
        var hY = 0;
        var gradient = 0.0;
        var br = 0.0;
        var x05 = 0.0;
        var xend = 0.0;
        var yend = 0.0;
        var xgap = 0.0;
        var xpxl1 = 0;
        var ypxl1 = 0;
        var i = 0;
        var intery = 0.0;
        var x15 = 0.0;
        var xpxl2 = 0;
        var ypxl2 = 0;
        var xn = 0.0;
        var yn = 0.0;

        // Initialize the PRNG
        rng1 = rng2 = rng3 = seed;
        for (i=20;i; i = (i - 1)|0) {
            rng4 = (rng0 - ((rng1 << 27) | (rng1 >>> 5)))|0;
            rng0 = rng1 ^ ((rng2 << 17) | (rng2 >>> 15));
            rng1 = (rng2 + rng3)|0;
            rng2 = (rng3 + rng4)|0;
            rng3 = (rng4 + rng0)|0;
        }

        for (;numRays; numRays = (numRays - 1)|0) {

            ////////////////////////////////////////////////////////////////
            // Start a new ray, at the light source

            // Random angle in [0, 2*pi)
            rng4 = (rng0 - ((rng1 << 27) | (rng1 >>> 5)))|0;
            rng0 = rng1 ^ ((rng2 << 17) | (rng2 >>> 15));
            rng1 = (rng2 + rng3)|0;
            rng2 = (rng3 + rng4)|0;
            rng3 = (rng4 + rng0)|0;
            t = (+(rng3>>>1)) * 2.9258361585343192e-09;

            rayOriginX = lightX;
            rayOriginY = lightY;
            rayDirX = sin(t);
            rayDirY = cos(t);
            lastSeg = -1|0;

            ////////////////////////////////////////////////////////////////
            // Cast until the ray is absorbed or we hit our bounce limit

            for (bounces = 1000; bounces; bounces = (bounces - 1)|0) {
                closestDist = +0xFFFFFFFF;
                closestSeg = -1|0;

                raySlope = rayDirY / rayDirX;
        
                for (segment = sceneBegin; (sceneEnd - segment)|0 != 0; segment = (segment + 64)|0) {
                    if (((segment - lastSeg)|0) == 0) continue;

                    ////////////////////////////////////////////////////////
                    // Ray to Segment Intersection

                    /*
                     * Ray equation: [rayOrigin + rayDirection * M], 0 <= M
                     * Segment equation: [p1 + (p2-p1) * N], 0 <= N <= 1
                     * Returns true with dist=M if we find an intersection.
                     *
                     *  M = (seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x
                     *  M = (seg1.y + segD.y * N - rayOrigin.y) / rayDirection.y
                     */

                    s1x = +F32[(segment + 0) >> 2];
                    s1y = +F32[(segment + 4) >> 2];
                    sDx = +F32[(segment + 8) >> 2];
                    sDy = +F32[(segment + 12) >> 2];

                    /*
                     * First solving for N, to see if there's an intersection at all:
                     *
                     *  M = (seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x
                     *  N = (M * rayDirection.y + rayOrigin.y - seg1.y) / segD.y
                     *
                     *  N = (((seg1.x + segD.x * N - rayOrigin.x) / rayDirection.x) *
                     *     rayDirection.y + rayOrigin.y - seg1.y) / segD.y
                     */

                    n = ((s1x - rayOriginX)*raySlope + (rayOriginY - s1y)) / (sDy - sDx*raySlope);
                    if (n < 0.0) continue;
                    if (n > 1.0) continue;

                    // Now solve for M, the ray/segment distance

                    m = (s1x + sDx * n - rayOriginX) / rayDirX;
                    if (m < 0.0) continue;

                    // It's an intersection! Store it, and keep track of the closest one.
                    if (m < closestDist) {
                        closestDist = m;
                        closestSeg = segment;
                    }
                }

                if (((closestSeg + 1)|0) == 0) {
                    // Escaped from the scene? This may happen due to math inaccuracies.
                    break;
                }

                // Locate the intersection point
                intX = rayOriginX + closestDist * rayDirX;
                intY = rayOriginY + closestDist * rayDirY;

                /////////////////////////////////////////////////////////////////
                // Draw one ray segment on the histogram, from (x0,y0) to (y0,y1)

                x0 = rayOriginX;
                y0 = rayOriginY;
                x1 = intX;
                y1 = intY;

                /*
                 * Modified version of Xiaolin Wu's antialiased line algorithm:
                 * http://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
                 *
                 * Brightness compensation:
                 *   The total brightness of the line should be proportional to its
                 *   length, but with Wu's algorithm it's proportional to dx.
                 *   We scale the brightness of each pixel to compensate.
                 */

                dx = x1 - x0;
                dy = y1 - y0;
                if (dx < 0.0) dx = -dx;
                if (dy < 0.0) dy = -dy;

                if (dy > dx) {
                    // Swap X and Y axes
                    t = x0;
                    x0 = y0;
                    y0 = t;
                    t = x1;
                    x1 = y1;
                    y1 = t;
                    hX = width << 2;
                    hY = 4;
                } else {
                    hX = 4;
                    hY = width << 2;
                }

                if (x0 > x1) {
                    t = x0;
                    x0 = x1;
                    x1 = t;
                    t = y0;
                    y0 = y1;
                    y1 = t;
                }

                dx = x1 - x0;
                dy = y1 - y0;
                gradient = dy / dx;
                br = 128.0 * sqrt(dx*dx + dy*dy) / dx;

                // First endpoint
                x05 = x0 + 0.5;
                xend = +(~~x05);
                yend = y0 + gradient * (xend - x0);
                xgap = br * (1.0 - x05 + xend);
                xpxl1 = ((~~xend) + 1)|0;
                ypxl1 = ~~yend;
                i = (counts + imul(hX, xpxl1 - 1) + imul(hY, ypxl1)) | 0;
                t = +(~~yend);
                t = yend - t;
                U32[i>>2] = (U32[i>>2]|0) + ~~(xgap * (1.0 - t));
                i = (i + hY)|0;
                U32[i>>2] = (U32[i>>2]|0) + ~~(xgap * t);
                intery = yend + gradient;

                // Second endpoint
                x15 = x1 + 0.5;
                t = +(~~x15);
                xpxl2 = ~~x15;
                yend = y1 + gradient * (t - x1);
                xgap = br * (x15 - t);
                ypxl2 = ~~yend;
                i = (counts + imul(hX, xpxl2) + imul(hY, ypxl2)) | 0;
                t = +(~~yend);
                t = yend - t;
                U32[i>>2] = (U32[i>>2]|0) + ~~(xgap * (1.0 - t));
                i = (i + hY)|0;
                U32[i>>2] = (U32[i>>2]|0) + ~~(xgap * t);

                lineLoop(
                    (counts + imul(hX, xpxl1)) | 0,
                    (counts + imul(hX, xpxl2)) | 0,
                    br, intery, gradient, hX, hY);

                ////////////////////////////////////////////////////////////////
                // What happens to the ray now?

                // Random uniform value in [0, 1)
                rng4 = (rng0 - ((rng1 << 27) | (rng1 >>> 5)))|0;
                rng0 = rng1 ^ ((rng2 << 17) | (rng2 >>> 15));
                rng1 = (rng2 + rng3)|0;
                rng2 = (rng3 + rng4)|0;
                rng3 = (rng4 + rng0)|0;
                t = (+(rng3>>>1)) * 4.656612873077393e-10;
                
                rayOriginX = intX;
                rayOriginY = intY;
                lastSeg = closestSeg;
            
                if (t < +F32[(closestSeg + 16) >> 2]) {
                    // Diffuse reflection. Angle randomized.

                    // Random angle in [0, 2*pi)
                    rng4 = (rng0 - ((rng1 << 27) | (rng1 >>> 5)))|0;
                    rng0 = rng1 ^ ((rng2 << 17) | (rng2 >>> 15));
                    rng1 = (rng2 + rng3)|0;
                    rng2 = (rng3 + rng4)|0;
                    rng3 = (rng4 + rng0)|0;
                    t = (+(rng3>>>1)) * 2.9258361585343192e-09;

                    rayDirX = sin(t);
                    rayDirY = cos(t);

                } else if (t < +F32[(closestSeg + 20) >> 2]) {
                    // Glossy reflection. Angle reflected.
                    xn = +F32[(closestSeg + 28) >> 2];
                    yn = +F32[(closestSeg + 32) >> 2];
                    t = 2.0 * (xn * rayDirX + yn * rayDirY);
                    rayDirX = rayDirX - t * xn;
                    rayDirY = rayDirY - t * yn;

                } else if (t >= +F32[(closestSeg + 24) >> 2]) {
                    // Absorbed
                    break;
                }
            }
        }
    }

    // Exports
    return {
        trace: trace,
        accumLoop: accumLoop,
        accumLoopSat: accumLoopSat,
        renderLoop: renderLoop,
    };
}

module.exports = AsmModule;
