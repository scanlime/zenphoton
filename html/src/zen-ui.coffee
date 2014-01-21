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
        @createConfigSliders(@parseConfig())

        @renderer = new Renderer('histogramImage')
        window.renderer = @renderer
        @undo = new UndoTracker(@renderer)

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
                @showLines()
            .mouseleave (e) =>
                @hideLines()

        @codeChanged = true
        $('#code')
            .focus (e) =>
                @showLines()
            .blur (e) =>
                @hideLines()
                if @codeChanged
                    @renderer.clear()
                    @codeChanged = false
            .keyup (e) =>
                @runCode()
                @codeChanged = true

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

        $('#evaluate-code').button()
            .hotkey('shift-return')
            .click () =>
                @runCode()
                @renderer.clear()

        # Load saved state, if any
        saved = document.location.hash.replace('#', '')
        if saved
            @getGist(saved)
            # @exposureSlider.setValue(@renderer.exposure)
        @renderer.clear()

        # If the scene is empty, let our 'first run' help show through.
        # This fades out when the first segment is drawn.
        if @renderer.segments.length or on
            $('#help').hide()

        @runCode()

    runCode: () ->
        ctx = @parseConfig()
        code = $('#code')[0].value
        c =
            width: @renderer.width
            height: @renderer.height
            cx: @renderer.lightX
            cy: @renderer.lightY
        for own name, conf of ctx
            if typeof(conf[0]) == 'string'
                c[name] = c[conf[0]] + conf[1]
            else
                c[name] = conf[0]
        top = """(function(c, add_wall){"""
        bottom = ';})'
        code = top + code + bottom
        try
            @renderer.clearAllWalls()
            eval(code)(c, @renderer.addWall.bind(@renderer))
            $('#error-msg').hide()
        catch error
            $('#error-msg').html(error.message).show()

    getGist: (gistname) ->
        id = gistname.split('/')[1]
        url = 'https://api.github.com/gists/' + id
        $.getJSON url, (data) =>
            $('#code')[0].value = data.files['code.js'].content
            setConfig(data.files['config.js'].content)
            @createConfigSliders(@parseConfig())
            @runCode()

    updateLink: ->
        # document.location.hash = btoa @renderer.getStateBlob()

    mouseXY: (e) ->
        o = $(@renderer.canvas).offset()
        return [e.pageX - o.left, e.pageY - o.top]

    lineToolBegin: (e) ->
        $('#help').fadeOut(2000)
        @undo.checkpoint()

        [x, y] = @mouseXY e
        @renderer.segments.push(new Segment(x, y, x, y,
            @material[0].value, @material[1].value, @material[2].value))

        @drawingSegment = true
        @showLines()

    lineToolMove: (e) ->
        # Update a line segment previously started with beginLine

        s = @renderer.segments[@renderer.segments.length - 1]
        [s.x1, s.y1] = @mouseXY e

        @renderer.clear()   # Asynchronously start rendering the new scene
        @renderer.redraw()  # Immediately draw the updated segments

    lineToolEnd: (e) ->
        @renderer.trimSegments()
        @hideLines()
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

    showLines: () ->
        @renderer.showSegments = 1
        @renderer.redraw()

    hideLines: () ->
        @renderer.showSegments = 0
        @renderer.redraw()

    hideAndRedraw: () ->
        @renderer.clear()
        @hideLines()

    setConfigValues: (json) ->
        for own key, widget of @sliders
            vals = if typeof config[0] == 'string' then config.slice(1) else config
            widget.setValue((vals[0] - vals[1])/(vals[2]-vals[1]))

    createConfigSliders: (json) ->
        controls = $('#controls').empty()
        showLines = @showLines.bind(this)
        hideLines = @hideLines.bind(this)
        hideAndRedraw = @hideAndRedraw.bind(this)
        # setConfigValues = @setConfigValues.bind(this)
        # @sliders = {}
        for own key, config of json
            vals = if typeof config[0] == 'string' then config.slice(1) else config
            node = $("<div class='ui-box'><div class='ui-hslider'></div>" + key + '</div>')
                     .appendTo(controls)
            widget = new HSlider node
            min = vals[1]
            max = vals[2]
            value = vals[0]
            widget.setValue(0)
            widget.valueChanged = @makeConfigCallback(key)
            widget.beginChange = showLines
            widget.endChange = hideAndRedraw
        # setTimeout((() ->  setConfigValues(json)), 50)

    makeConfigCallback: (key) ->
        return (v) =>
            @setConfigValue(key, v)
            @runCode()
            @renderer.redraw()

    parseConfig: () ->
        return JSON.parse($('#config')[0].value)

    setConfig: (value) ->
        $('#config')[0].value = JSON.stringify(value, null, 4)

    setConfigValue: (key, value) ->
        config = @parseConfig()
        offset = if typeof config[key][0] == 'string' then 1 else 0
        if config[key].length >= (offset + 4)
            step = config[key][3 + offset]
        else
            step = .01
        new_value = value * (config[key][2 + offset] - config[key][1 + offset]) + config[key][1 + offset]
        new_value = Math.floor(new_value / step) * step
        config[key][0 + offset] = new_value
        @setConfig(config)
