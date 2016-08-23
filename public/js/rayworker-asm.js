(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){/*
    @license

    Zen Photon Garden.
    https://github.com/scanlime/zenphoton

    Copyright (c) 2013 Micah Elizabeth Scott <micah@scanlime.org>

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict"},{}],2:[function(require,module,exports){require("./header");require("./worker-asm-shell.coffee")},{"./header":1,"./worker-asm-shell.coffee":4}],3:[function(require,module,exports){/*
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
function AsmModule(stdlib,foreign,heap){"use asm";var F32=new stdlib.Float32Array(heap);var U32=new stdlib.Uint32Array(heap);var sqrt=stdlib.Math.sqrt;var sin=stdlib.Math.sin;var cos=stdlib.Math.cos;var imul=stdlib.Math.imul;function lineLoop(i,e,b,y,g,u,v){i=i|0;e=e|0;b=+b;y=+y;g=+g;u=u|0;v=v|0;var t=0;var j=0;for(;;){if((i-e|0)>=0)return;j=~~y;t=b*(y-+(j|0));j=i+imul(v,j)|0;U32[j>>2]=(U32[j>>2]|0)+~~(b-t);j=j+v|0;U32[j>>2]=(U32[j>>2]|0)+~~t;y=+(y+g);i=i+u|0;if((i-e|0)>=0)return;j=~~y;t=b*(y-+(j|0));j=i+imul(v,j)|0;U32[j>>2]=(U32[j>>2]|0)+~~(b-t);j=j+v|0;U32[j>>2]=(U32[j>>2]|0)+~~t;y=+(y+g);i=i+u|0;if((i-e|0)>=0)return;j=~~y;t=b*(y-+(j|0));j=i+imul(v,j)|0;U32[j>>2]=(U32[j>>2]|0)+~~(b-t);j=j+v|0;U32[j>>2]=(U32[j>>2]|0)+~~t;y=+(y+g);i=i+u|0;if((i-e|0)>=0)return;j=~~y;t=b*(y-+(j|0));j=i+imul(v,j)|0;U32[j>>2]=(U32[j>>2]|0)+~~(b-t);j=j+v|0;U32[j>>2]=(U32[j>>2]|0)+~~t;y=+(y+g);i=i+u|0}}function accumLoop(s,d,n){s=s|0;d=d|0;n=n|0;for(;;){U32[d>>2]=(U32[d>>2]|0)+(U32[s>>2]|0);s=s+4|0;d=d+4|0;U32[d>>2]=(U32[d>>2]|0)+(U32[s>>2]|0);s=s+4|0;d=d+4|0;U32[d>>2]=(U32[d>>2]|0)+(U32[s>>2]|0);s=s+4|0;d=d+4|0;U32[d>>2]=(U32[d>>2]|0)+(U32[s>>2]|0);s=s+4|0;d=d+4|0;n=n-4|0;if(!n)return}}function accumLoopSat(s,d,n){s=s|0;d=d|0;n=n|0;var x=0;for(;;){x=+(U32[d>>2]|0)+ +(U32[s>>2]|0);if(x>2147483647)x=2147483647;U32[d>>2]=~~x;s=s+4|0;d=d+4|0;x=+(U32[d>>2]|0)+ +(U32[s>>2]|0);if(x>2147483647)x=2147483647;U32[d>>2]=~~x;s=s+4|0;d=d+4|0;x=+(U32[d>>2]|0)+ +(U32[s>>2]|0);if(x>2147483647)x=2147483647;U32[d>>2]=~~x;s=s+4|0;d=d+4|0;x=+(U32[d>>2]|0)+ +(U32[s>>2]|0);if(x>2147483647)x=2147483647;U32[d>>2]=~~x;s=s+4|0;d=d+4|0;n=n-4|0;if(!n)return}}function renderLoop(s,d,n,b){s=s|0;d=d|0;n=n|0;b=+b;var g=0;for(;;){g=~~(+(U32[s>>2]|0)*b);if(~~(g-255)>0)g=255;U32[d>>2]=4278190080|g<<16|g<<8|g;s=s+4|0;d=d+4|0;g=~~(+(U32[s>>2]|0)*b);if(~~(g-255)>0)g=255;U32[d>>2]=4278190080|g<<16|g<<8|g;s=s+4|0;d=d+4|0;g=~~(+(U32[s>>2]|0)*b);if(~~(g-255)>0)g=255;U32[d>>2]=4278190080|g<<16|g<<8|g;s=s+4|0;d=d+4|0;g=~~(+(U32[s>>2]|0)*b);if(~~(g-255)>0)g=255;U32[d>>2]=4278190080|g<<16|g<<8|g;s=s+4|0;d=d+4|0;n=n-4|0;if(!n)return}}function trace(counts,width,height,lightX,lightY,numRays,sceneBegin,sceneEnd,seed){counts=counts|0;width=width|0;height=height|0;lightX=+lightX;lightY=+lightY;numRays=numRays|0;sceneBegin=sceneBegin|0;sceneEnd=sceneEnd|0;seed=seed|0;var rng0=4058668781;var rng1=0;var rng2=0;var rng3=0;var rng4=0;var t=0;var rayOriginX=0;var rayOriginY=0;var rayDirX=0;var rayDirY=0;var raySlope=0;var lastSeg=-1;var segment=0;var bounces=0;var closestDist=0;var closestSeg=-1;var s1x=0;var s1y=0;var sDx=0;var sDy=0;var n=0;var m=0;var intX=0;var intY=0;var x0=0;var y0=0;var x1=0;var y1=0;var dx=0;var dy=0;var hX=0;var hY=0;var gradient=0;var br=0;var x05=0;var xend=0;var yend=0;var xgap=0;var xpxl1=0;var ypxl1=0;var i=0;var intery=0;var x15=0;var xpxl2=0;var ypxl2=0;var xn=0;var yn=0;rng1=rng2=rng3=seed;for(i=20;i;i=i-1|0){rng4=rng0-(rng1<<27|rng1>>>5)|0;rng0=rng1^(rng2<<17|rng2>>>15);rng1=rng2+rng3|0;rng2=rng3+rng4|0;rng3=rng4+rng0|0}for(;numRays;numRays=numRays-1|0){rng4=rng0-(rng1<<27|rng1>>>5)|0;rng0=rng1^(rng2<<17|rng2>>>15);rng1=rng2+rng3|0;rng2=rng3+rng4|0;rng3=rng4+rng0|0;t=+(rng3>>>1)*2.9258361585343192e-9;rayOriginX=lightX;rayOriginY=lightY;rayDirX=sin(t);rayDirY=cos(t);lastSeg=-1|0;for(bounces=1e3;bounces;bounces=bounces-1|0){closestDist=+4294967295;closestSeg=-1|0;raySlope=rayDirY/rayDirX;for(segment=sceneBegin;sceneEnd-segment|0!=0;segment=segment+64|0){if((segment-lastSeg|0)==0)continue;s1x=+F32[segment+0>>2];s1y=+F32[segment+4>>2];sDx=+F32[segment+8>>2];sDy=+F32[segment+12>>2];n=((s1x-rayOriginX)*raySlope+(rayOriginY-s1y))/(sDy-sDx*raySlope);if(n<0)continue;if(n>1)continue;m=(s1x+sDx*n-rayOriginX)/rayDirX;if(m<0)continue;if(m<closestDist){closestDist=m;closestSeg=segment}}if((closestSeg+1|0)==0){break}intX=rayOriginX+closestDist*rayDirX;intY=rayOriginY+closestDist*rayDirY;x0=rayOriginX;y0=rayOriginY;x1=intX;y1=intY;dx=x1-x0;dy=y1-y0;if(dx<0)dx=-dx;if(dy<0)dy=-dy;if(dy>dx){t=x0;x0=y0;y0=t;t=x1;x1=y1;y1=t;hX=width<<2;hY=4}else{hX=4;hY=width<<2}if(x0>x1){t=x0;x0=x1;x1=t;t=y0;y0=y1;y1=t}dx=x1-x0;dy=y1-y0;gradient=dy/dx;br=128*sqrt(dx*dx+dy*dy)/dx;x05=x0+.5;xend=+~~x05;yend=y0+gradient*(xend-x0);xgap=br*(1-x05+xend);xpxl1=~~xend+1|0;ypxl1=~~yend;i=counts+imul(hX,xpxl1-1)+imul(hY,ypxl1)|0;t=+~~yend;t=yend-t;U32[i>>2]=(U32[i>>2]|0)+~~(xgap*(1-t));i=i+hY|0;U32[i>>2]=(U32[i>>2]|0)+~~(xgap*t);intery=yend+gradient;x15=x1+.5;t=+~~x15;xpxl2=~~x15;yend=y1+gradient*(t-x1);xgap=br*(x15-t);ypxl2=~~yend;i=counts+imul(hX,xpxl2)+imul(hY,ypxl2)|0;t=+~~yend;t=yend-t;U32[i>>2]=(U32[i>>2]|0)+~~(xgap*(1-t));i=i+hY|0;U32[i>>2]=(U32[i>>2]|0)+~~(xgap*t);lineLoop(counts+imul(hX,xpxl1)|0,counts+imul(hX,xpxl2)|0,br,intery,gradient,hX,hY);rng4=rng0-(rng1<<27|rng1>>>5)|0;rng0=rng1^(rng2<<17|rng2>>>15);rng1=rng2+rng3|0;rng2=rng3+rng4|0;rng3=rng4+rng0|0;t=+(rng3>>>1)*4.656612873077393e-10;rayOriginX=intX;rayOriginY=intY;lastSeg=closestSeg;if(t<+F32[closestSeg+16>>2]){rng4=rng0-(rng1<<27|rng1>>>5)|0;rng0=rng1^(rng2<<17|rng2>>>15);rng1=rng2+rng3|0;rng2=rng3+rng4|0;rng3=rng4+rng0|0;t=+(rng3>>>1)*2.9258361585343192e-9;rayDirX=sin(t);rayDirY=cos(t)}else if(t<+F32[closestSeg+20>>2]){xn=+F32[closestSeg+28>>2];yn=+F32[closestSeg+32>>2];t=2*(xn*rayDirX+yn*rayDirY);rayDirX=rayDirX-t*xn;rayDirY=rayDirY-t*yn}else if(t>=+F32[closestSeg+24>>2]){break}}}}return{trace:trace,accumLoop:accumLoop,accumLoopSat:accumLoopSat,renderLoop:renderLoop}}module.exports=AsmModule},{}],4:[function(require,module,exports){/*
 *   @license
 *
 *   Worker thread for Zen Photon Garden.
 *
 *   Workers are used for our CPU-intensive computing tasks:
 *
 *       - Rendering a scene to a ray histogram
 *       - Combining multiple ray histograms
 *       - Rendering a combined ray histogram to a bitmap
 *
 *   Copyright (c) 2013 Micah Elizabeth Scott <micah@scanlime.org>
 *
 *   Permission is hereby granted, free of charge, to any person
 *   obtaining a copy of this software and associated documentation
 *   files (the "Software"), to deal in the Software without
 *   restriction, including without limitation the rights to use,
 *   copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following
 *   conditions:
 *
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *   OTHER DEALINGS IN THE SOFTWARE.
 *
 */
var AsmModule;AsmModule=require("./worker-asm-core");(function(){var alloc32;this.onmessage=function(_this){return function(event){var msg;_this.init();msg=event.data;switch(msg.job){case"trace":return _this.job_trace(msg);case"firstTrace":return _this.job_firstTrace(msg);case"accumulate":return _this.job_accumulate(msg);case"render":return _this.job_render(msg)}}}(this);this.init=function(){var stdlib;if(!Math.imul){Math.imul=function(a,b){return a*b}}this.heap=new ArrayBuffer(8388608);this.F32=new Float32Array(this.heap);this.U32=new Uint32Array(this.heap);this.zeroes=new ArrayBuffer(65536);this.Z32=new Uint32Array(this.zeroes);stdlib={Math:Math,Uint32Array:Uint32Array,Float32Array:Float32Array};this.AsmFn=AsmModule(stdlib,{},this.heap);return this.init=function(){return null}};alloc32=function(ptr,width,height){return ptr+4*width*height};this.allocScene=function(ptr,scene){var d1,dx,dy,i,len,len1,r2,s,t3,xn,yn;for(i=0,len1=scene.length;i<len1;i++){s=scene[i];dx=s.x1-s.x0;dy=s.y1-s.y0;len=Math.sqrt(dx*dx+dy*dy);xn=-dy/len;yn=dx/len;d1=s.diffuse;r2=d1+s.reflective;t3=r2+s.transmissive;this.F32[ptr+0>>2]=s.x0;this.F32[ptr+4>>2]=s.y0;this.F32[ptr+8>>2]=dx;this.F32[ptr+12>>2]=dy;this.F32[ptr+16>>2]=d1;this.F32[ptr+20>>2]=r2;this.F32[ptr+24>>2]=t3;this.F32[ptr+28>>2]=xn;this.F32[ptr+32>>2]=yn;ptr+=64}return ptr};this.traceWithHeap=function(ptr,msg){var counts,sceneBegin,sceneEnd,seed;counts=ptr;sceneBegin=alloc32(counts,msg.width,msg.height);sceneEnd=this.allocScene(sceneBegin,msg.segments);seed=Math.random()*4294967295|0;return this.AsmFn.trace(counts,msg.width,msg.height,msg.lightX,msg.lightY,msg.numRays,sceneBegin,sceneEnd,seed)};this.memzero=function(begin,end){var l;while(true){l=end-begin;if(l<=0){return}if(l>=65536){this.U32.set(this.Z32,begin>>2);begin+=65536}else{this.U32.set(this.Z32.slice(0,l>>2),begin>>2);begin+=l}}};this.job_trace=function(msg){var counts,endCounts,result;counts=0;endCounts=alloc32(counts,msg.width,msg.height);this.memzero(counts,endCounts);this.traceWithHeap(counts,msg);result=this.heap.slice(counts,endCounts);return this.postMessage({job:msg.job,cookie:msg.cookie,numRays:msg.numRays,counts:result},[result])};this.job_accumulate=function(msg){var accumulator,counts,n,src;accumulator=0;src=alloc32(accumulator,this.width,this.height);counts=new Uint32Array(msg.counts);if(msg.cookie>this.cookie){this.U32.set(counts,accumulator>>2);this.raysTraced=msg.numRays;return this.cookie=msg.cookie}else if(msg.cookie===this.cookie){this.U32.set(counts,src>>2);n=this.width*this.height;this.raysTraced+=msg.numRays;if(this.raysTraced>=16777215){return this.AsmFn.accumLoopSat(src,accumulator,n)}else{return this.AsmFn.accumLoop(src,accumulator,n)}}};this.job_render=function(msg){var accumulator,br,end,n,pixels,result;accumulator=0;pixels=alloc32(accumulator,msg.width,msg.height);end=alloc32(pixels,msg.width,msg.height);br=Math.exp(1+10*msg.exposure)/this.raysTraced;n=msg.width*msg.height;this.AsmFn.renderLoop(accumulator,pixels,n,br);result=this.heap.slice(pixels,end);return this.postMessage({job:msg.job,cookie:this.cookie,raysTraced:this.raysTraced,pixels:result},[result])};return this.job_firstTrace=function(msg){var accumulator,end;this.width=msg.width;this.height=msg.height;accumulator=0;end=alloc32(accumulator,msg.width,msg.height);this.memzero(accumulator,end);this.traceWithHeap(accumulator,msg);this.raysTraced=msg.numRays;this.cookie=msg.cookie;return this.job_render(msg)}})()},{"./worker-asm-core":3}]},{},[2]);