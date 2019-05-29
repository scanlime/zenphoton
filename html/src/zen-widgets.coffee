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


class VSlider
    # Events
    beginChange: () ->
    endChange: () ->
    valueChanged: (v) ->

    constructor: (@button, @track) ->
        @button
            .mousedown (e) =>
                return unless e.which == 1
                return if @touchDragging
                e.preventDefault()        
                @beginDrag e.pageY

            .bind 'touchstart', (e) =>
                touches = e.originalEvent.changedTouches
                e.preventDefault()        
                @touchDragging = true
                @beginDrag touches[0].pageY

            .bind 'touchmove', (e) =>
                return unless @dragging
                touches = e.originalEvent.changedTouches
                e.preventDefault()
                @updateDrag touches[0].pageY

            .bind 'touchend', (e) =>
                return unless @dragging
                e.preventDefault()
                @endDrag()

        $(window)
            .mousemove (e) =>
                return unless @dragging
                return if @touchDragging
                e.preventDefault()
                @updateDrag e.pageY

            .mouseup (e) =>
                return unless @dragging
                return if @touchDragging
                @endDrag()

    beginDrag: (pageY) ->
        @button.uiActive true
        @dragging = true
        @beginChange()
        @updateDrag pageY

    updateDrag: (pageY) ->
        h = @button.innerHeight()
        y = pageY - @button.parent().offset().top - h/2
        value = y / (@track.innerHeight() - h)
        value = 1 - Math.min(1, Math.max(0, value))
        $('body').css cursor: 'pointer'
        @setValue(value)
        @valueChanged(value)

    endDrag: ->
        @dragging = false
        @touchDragging = false
        @button.uiActive false
        $('body').css cursor: 'auto'
        @endChange()

    setValue: (@value) ->
        y = (@track.innerHeight() - @button.innerHeight()) * (1 - @value)
        @button.css top: y


class HSlider
    # Events
    beginChange: () ->
    endChange: () ->
    valueChanged: (v) ->

    constructor: (@button) ->
        @button
            .mousedown (e) =>
                return unless e.which == 1
                return if @touchDragging
                e.preventDefault()
                @beginDrag e.pageX

            .bind 'touchstart', (e) =>
                touches = e.originalEvent.changedTouches
                e.preventDefault()
                @touchDragging = true
                @beginDrag touches[0].pageX

            .bind 'touchmove', (e) =>
                return unless @dragging
                touches = e.originalEvent.changedTouches
                e.preventDefault()
                @updateDrag touches[0].pageX

            .bind 'touchend', (e) =>
                return unless @dragging
                e.preventDefault()
                @endDrag()

        $(window)
            .mousemove (e) =>
                return unless @dragging
                return if @touchDragging
                @updateDrag(e.pageX)
                e.preventDefault()

            .mouseup (e) =>
                return if @touchDragging
                return unless @dragging
                @endDrag()

    beginDrag: (pageX) ->
        @dragging = true
        @beginChange()
        @updateDrag pageX

    updateDrag: (pageX) ->
        w = @button.innerWidth()
        x = pageX - @button.parent().offset().left
        value = Math.min(1, Math.max(0, x / w))
        $('body').css cursor: 'pointer'
        @setValue(value)
        @valueChanged(value)

    endDrag: ->
        @dragging = false
        @touchDragging = false
        $('body').css cursor: 'auto'
        @endChange()

    setValue: (@value) ->
        w = @button.innerWidth()
        @button.children('.ui-hslider').width(w * @value)


class Button
    # Events
    onClick: () ->

    constructor: (@button) ->
        @button
            .mousedown (e) =>
                return unless e.which == 1
                e.preventDefault()
                @beginDrag()

            .click (e) =>
                @endDrag()
                @onClick e

            .bind 'touchstart', (e) =>
                # Touches time out; long-touch is not interpreted as a click.
                e.preventDefault()
                @timer = window.setTimeout (() => @endDrag()), 500
                @beginDrag()

            .bind 'touchmove', (e) =>
                return unless @dragging
                e.preventDefault()

            .bind 'touchend', (e) =>
                return unless @dragging
                e.preventDefault()
                @endDrag()
                @onClick e

        $(window)
            .mouseup (e) =>
                return unless @dragging
                @endDrag()

    click: (handler) ->
        @onClick = handler
        return this

    beginDrag: ->
        @button.uiActive true
        @dragging = true
        $('body').css cursor: 'pointer'

    endDrag: ->
        @button.uiActive false
        @dragging = false
        $('body').css cursor: 'auto'
        if @timer
            window.clearTimeout @timer
            @timer = null

    hotkey: (key) ->
        # We only use 'keydown' here... for keys that are also used by the browser UI,
        # keyup and keypress don't work for all keys and platforms we care about.

        $(document).bind 'keydown', key, (e) =>
            @button.uiActive(true)
            setTimeout (() => @button.uiActive(false)), 100
            @onClick(e)

        return this


$.fn.uiActive = (n) ->
    if n
        @addClass('ui-active')
        @removeClass('ui-inactive')
    else
        @removeClass('ui-active')
        @addClass('ui-inactive')
    return this

$.fn.button = () ->
    return new Button this
