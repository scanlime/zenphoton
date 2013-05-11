#!/bin/sh

set -e

if [[ $1 == "debug" ]]; then
    echo Debug build, not minified.
    MINIFY=cat
    DEBUG_CODE=src/fakeworker-0.1.js
else
    MINIFY=jsmin
    DEBUG_CODE=
fi

# Worker thread (plain JS version)
(
    cat src/header.js
    (
        coffee -c -p src/worker-noasm.coffee
    ) | $MINIFY
) > rayworker.js

# Worker thread (asm.js version)
(
    cat src/header.js
    (
        cat src/worker-asm-core.js
        coffee -c -p src/worker-asm-shell.coffee
    ) | $MINIFY
) > rayworker-asm.js

# Main file
(
    cat src/header.js
    (
        cat \
            src/jquery-1.9.1.min.js \
            src/jquery.hotkeys.js \
            src/asmjs-feature-test.js \
            src/analytics.js \
            $DEBUG_CODE
        (
            cat \
                src/zen-renderer.coffee \
                src/zen-widgets.coffee \
                src/zen-ui.coffee \
                src/zen-setup.coffee
        ) | coffee -p -s
    ) | $MINIFY
) > zenphoton.js
