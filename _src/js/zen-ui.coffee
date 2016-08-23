#
#   Zen Photon Garden.
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

$ = require 'jquery'
Segment = require './zen-segment.coffee'
Renderer = require './zen-renderer.coffee'
UndoTracker = require './zen-undo.coffee'


class GardenUI
    constructor: (canvasId) ->

        @renderer = new Renderer('histogramImage')
        @undo = new UndoTracker(@renderer)

        # First thing first, check compatibility. If we're good, hide the error message and show the help.
        # If not, bail out now.
        unless @renderer.browserSupported()
            console.log('Not Supported.')
            return

        $('#histogramImage')
            .mousedown (e) =>
                e.preventDefault()
                return if @handlingTouch

                # Starting to draw a line
                @lineToolBegin e

            .bind 'touchstart', (e) =>
                e.preventDefault()
                @handlingTouch = true
                @lineToolBegin e.originalEvent.changedTouches[0]

            .bind 'touchmove', (e) =>
                return unless @handlingTouch
                if @drawingSegment
                    e.preventDefault()
                    @lineToolMove e.originalEvent.changedTouches[0]

            .bind 'touchend', (e) =>
                return unless @handlingTouch
                @handlingTouch = false
                if @drawingSegment
                    e.preventDefault()
                    @lineToolEnd e.originalEvent.changedTouches[0]

        $(window)
            .mouseup (e) =>
                return if @handlingTouch

                if @drawingSegment
                    e.preventDefault()
                    @lineToolEnd e

            .mousemove (e) =>
                return if @handlingTouch

                if @drawingSegment
                    e.preventDefault()
                    @lineToolMove e

        @material = {
            diffuse: 1.0,
            reflective: 0.0,
            transmissive: 0.0,
        }

        # Load saved state, if any
        saved = document.location.hash.replace('#', '')
        if saved
            @renderer.setStateBlob(atob(saved))
        @renderer.clear()

    updateLink: ->
        document.location.hash = btoa @renderer.getStateBlob()

    mouseXY: (e) ->
        o = $(@renderer.canvas).offset()
        return [e.pageX - o.left, e.pageY - o.top]

    lineToolBegin: (e) ->
        @undo.checkpoint()

        [x, y] = @mouseXY e
        @renderer.segments.push(new Segment(x, y, x, y,
            @material.diffuse, @material.reflective, @material.transmissive))

        @drawingSegment = true
        @renderer.showSegments++
        @renderer.redraw()

    lineToolMove: (e) ->
        # Update a line segment previously started with beginLine

        s = @renderer.segments[@renderer.segments.length - 1]
        [s.x1, s.y1] = @mouseXY e if s

        @renderer.clear()   # Asynchronously start rendering the new scene
        @renderer.redraw()  # Immediately draw the updated segments

    lineToolEnd: (e) ->
        @renderer.trimSegments()
        @renderer.showSegments--
        @renderer.redraw()
        # @updateLink()
        @drawingSegment = false


module.exports = GardenUI
