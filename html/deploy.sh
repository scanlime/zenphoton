#!/bin/sh

set -e
./build.sh

FILES="\
    zenphoton.js                       \
    rayworker.js                       \
    rayworker-asm.js                   \
    index.html                         \
    missing.html                       \
    favicon.gif                        \
    favicon.ico                        \
    logo-57.png                        \
    logo-72.png                        \
    logo-114.png                       \
    logo-144.png                       \
    apple-touch-icon-precomposed.png   \
    apple-touch-icon.png               \
    humans.txt                         \
    robots.txt                         \
    roboto.ttf                         "

rsync -v $FILES matthias@paquari.com:/usr/share/nginx/html/zenphoton.com/
