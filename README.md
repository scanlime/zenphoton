Zen photon garden
=================

![screenshot](media/screenshot.png)

This is a little HTML5 art toy about raytracing.

It's built for modern web browsers with a fast JavaScript engine, Web Workers, Typed Arrays, and Canvas.

There's [a blog](http://scanlime.org/category/projects/zen-photon-garden/) where you can read more about it, or you can [try it out online](http://zenphoton.com).

Web App
-------

The web app is written in a mix of JavaScript and CoffeeScript. You'll need the [CoffeeScript compiler](http://coffeescript.org) and [jsmin](http://www.crockford.com/javascript/jsmin.html) to build it.

Everything related to the web app is contained in the `html` directory. The included shell scripts `build.sh` and `deploy.sh` are responsible for compiling, minifying and deploying the site.

During development, you will need to make the `html` directory accessible to a local web server. The `file://` URI scheme won't work with Web Workers.

A debug mode is available by running `build.sh debug`. Minification is disabled, and it uses a **fake** implementation of Web Workers to facilitate source-level debugging.

Batch Renderer
--------------

An experimental batch rendererer called `hqz` (High Quality Zen) is under development in the `hqz` directory. 

Contact
-------

Zen photon garden was created by [Micah Elizabeth Scott](http://scanlime.org/contact).

Contributors
------------

Jared Forsyth <jared@jaredforsyth.com>
