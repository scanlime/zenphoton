#!/bin/sh

set -e

if [[ $1 == "debug" ]]; then
    echo Debug build, not minified.
    MINIFY=cat
    DEBUG_CODE=_src/js/lib/fakeworker-0.1.js
else
    MINIFY=./node_modules/jsmin/bin/jsmin
    DEBUG_CODE=
fi
COFFEE=./node_modules/coffee-script/bin/coffee

# Worker thread (plain JS version)
(
    cat _src/js/header.js
    (
        $COFFEE -c -p _src/js/worker-noasm.coffee
    ) | $MINIFY
) > ./public/js/rayworker.js

# Worker thread (asm.js version)
(
    cat _src/js/header.js
    (
        cat _src/js/worker-asm-core.js
        $COFFEE -c -p _src/js/worker-asm-shell.coffee
    ) | $MINIFY
) > ./public/js/rayworker-asm.js

# Main file
(
    cat _src/js/header.js
    (
        cat \
            node_modules/jquery/dist/jquery.min.js \
            _src/js/lib/asmjs-feature-test.js \
            $DEBUG_CODE
        (
            cat \
                _src/js/zen-renderer.coffee \
                _src/js/zen-undo.coffee \
                _src/js/zen-ui.coffee \
                _src/js/zen-setup.coffee
        ) | $COFFEE -p -s
    ) | $MINIFY
) > ./public/js/zenphoton.js
