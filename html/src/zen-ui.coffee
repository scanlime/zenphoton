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


class UndoTracker
    constructor: (@renderer) ->
        @undoQueue = []
        @redoQueue = []

    checkpoint: ->
        @undoQueue.push(@checkpointData())

    checkpointData: ->
        return @renderer.getState()

    restore: (record) ->
        @renderer.setState(record)

    undo: ->
        if @undoQueue.length
            @redoQueue.push(@checkpointData())
            @restore(@undoQueue.pop())

    redo: ->
        if @redoQueue.length
            @checkpoint()
            @restore(@redoQueue.pop())


class GardenUI
    constructor: (canvasId) ->

        @renderer = new Renderer('histogramImage')
        @undo = new UndoTracker(@renderer)
        @lineMoveCallbacks = []

        # First thing first, check compatibility. If we're good, hide the error message and show the help.
        # If not, bail out now.
        return unless @renderer.browserSupported()
        $('#notsupported').hide()
        $('#help').show()
        $('#leftColumn, #rightColumn').fadeIn(1000)

        # Set up our 'exposure' slider
        do (e = @exposureSlider = new VSlider $('#exposureSlider'), $('#workspace')) =>
            e.setValue(@renderer.exposure)
            e.valueChanged = (v) => @renderer.setExposure(v)
            e.beginChange = () => @undo.checkpoint()
            e.endChange = () => @updateLink()

        @renderer.callback = () =>
            $('#raysTraced').text(@renderer.raysTraced)
            $('#raySpeed').text(@renderer.raysPerSecond()|0)

        $('#histogramImage, #help')
            .mousedown (e) =>
                e.preventDefault()
                return if @handlingTouch

                if e.shiftKey
                    # Moving light! This is a semi-hidden feature until I design a multi-tool
                    # UI that seems appropriately Zen. But anyway, how Zen is it to try and move
                    # the sun anyway? In the mean-time, shift-drag will do it.

                    @undo.checkpoint()
                    @movingLight = true
                    @renderer.moveLight @mouseXY e
                    @renderer.clear()

                else
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

                if @movingLight
                    e.preventDefault()
                    @updateLink()
                    @movingLight = false

            .mousemove (e) =>
                return if @handlingTouch

                if @drawingSegment
                    e.preventDefault()
                    @lineToolMove e

                if @movingLight
                    @renderer.moveLight @mouseXY e
                    @renderer.clear()
                    e.preventDefault()

        @material = [
            @initMaterialSlider('#diffuseSlider', 1.0),
            @initMaterialSlider('#reflectiveSlider', 0.0),
            @initMaterialSlider('#transmissiveSlider', 0.0),
        ]

        # Show existing segments when hovering over undo/redo/clear
        $('.show-segments-on-hover')
            .mouseenter (e) =>
                @renderer.showSegments++
                @renderer.redraw()
            .mouseleave (e) =>
                @renderer.showSegments--
                @renderer.redraw()

        $('#clearButton').button()
            .click (e) =>
                return if !@renderer.segments.length and @renderer.isDefaultLightSource()
                @undo.checkpoint()
                @renderer.segments = []
                @renderer.setDefaultLightSource()
                @renderer.clear()
                @updateLink()

        $('#undoButton').button()
            .hotkey('ctrl+z')
            .hotkey('meta+z')
            .click (e) =>
                @undo.undo()
                @exposureSlider.setValue(@renderer.exposure)
                @updateLink()

        $('#redoButton').button()
            .hotkey('ctrl+y')
            .hotkey('meta+shift+z')
            .click (e) =>
                @undo.redo()
                @exposureSlider.setValue(@renderer.exposure)
                @updateLink()

        $('#pngButton').button()
            .click () =>
                document.location.href = @renderer.toDataURL('image/png').replace('image/png', 'image/octet-stream')

        $('#linkButton').button()
            .click () =>
                @updateLink()
                window.prompt("Copy this URL to share your garden.", document.location)

        # Load saved state, if any
        saved = document.location.hash.replace('#', '')
        if saved
            @renderer.setStateBlob(atob(saved))
            @exposureSlider.setValue(@renderer.exposure)
        @renderer.clear()

        # If the scene is empty, let our 'first run' help show through.
        # This fades out when the first segment is drawn.
        if @renderer.segments.length
            $('#help').hide()

    updateLink: ->
        document.location.hash = btoa @renderer.getStateBlob()

    mouseXY: (e) ->
        o = $(@renderer.canvas).offset()
        return [e.pageX - o.left, e.pageY - o.top]

    lineToolBegin: (e) ->
        $('#help').fadeOut(2000)
        @undo.checkpoint()

        [x, y] = @mouseXY e
        @renderer.segments.push(new Segment(x, y, x, y,
            @material[0].value, @material[1].value, @material[2].value))
        @lineMoveCallbacks.push(((s) ->
            return (x, y) ->
                s.x1 = x
                s.y1 = y
        )(@renderer.segments[@renderer.segments.length - 1]))
        mirrorX = $('#mirrorXCheckbox').prop('checked')
        mirrorY = $('#mirrorYCheckbox').prop('checked')
        if mirrorX or mirrorY
            mcb = (s, mirrorX, mirrorY, aboutX, aboutY) ->
                return (x, y) ->
                    s.x1 = if mirrorX then aboutX * 2 - x else x
                    s.y1 = if mirrorY then aboutY * 2 - y else y
            o = {}
            f = mcb o, mirrorX, mirrorY, @renderer.lightX, @renderer.lightY
            f x, y
            @renderer.segments.push(new Segment(o.x1, o.y1, o.x1, o.y1,
                @material[0].value, @material[1].value, @material[2].value))
            @lineMoveCallbacks.push(mcb(
                @renderer.segments[@renderer.segments.length - 1],
                mirrorX, mirrorY, @renderer.lightX, @renderer.lightY))

        @drawingSegment = true
        @renderer.showSegments++
        @renderer.redraw()

    lineToolMove: (e) ->
        # Update a line segment previously started with beginLine

        [x, y] = @mouseXY e
        for cb in @lineMoveCallbacks
            cb(x, y)

        @renderer.clear()   # Asynchronously start rendering the new scene
        @renderer.redraw()  # Immediately draw the updated segments

    lineToolEnd: (e) ->
        @lineMoveCallbacks = []
        @renderer.trimSegments()
        @renderer.showSegments--
        @renderer.redraw()
        @updateLink()
        @drawingSegment = false

    initMaterialSlider: (sel, defaultValue) ->
        widget = new HSlider $(sel)
        widget.setValue(defaultValue)

        # If the material properties add up to more than 1, rebalance them.
        widget.valueChanged = (v) =>
            total = 0
            for m in @material
                total += m.value
            return if total <= 1

            # Leave this one as-is, rescale all other material sliders.
            for m in @material
                continue if m == widget
                if v == 1
                    m.setValue(0)
                else
                    m.setValue( m.value * (1 - v) / (total - v) )

        return widget
