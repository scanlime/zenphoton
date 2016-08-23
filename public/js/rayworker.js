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
"use strict"},{}],2:[function(require,module,exports){require("./header");require("./worker-noasm.coffee")},{"./header":1,"./worker-noasm.coffee":3}],3:[function(require,module,exports){/*
 *   @license
 *
 *   Worker thread for Zen Photon Garden.
 *
 *   Plain JavaScript implementation (no asm.js).
 *   This one is still fastest on Safari and on released versions of Firefox
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
var accumLoop,accumLoopSat,lineLoop,renderLoop;lineLoop=function(c,i,e,b,y,g,u,v){var j,t;while(true){if(i>=e){return}t=b*(y-(y|0));c[j=i+v*(y|0)]+=b-t;c[j+v]+=t;y+=g;i+=u;if(i>=e){return}t=b*(y-(y|0));c[j=i+v*(y|0)]+=b-t;c[j+v]+=t;y+=g;i+=u;if(i>=e){return}t=b*(y-(y|0));c[j=i+v*(y|0)]+=b-t;c[j+v]+=t;y+=g;i+=u;if(i>=e){return}t=b*(y-(y|0));c[j=i+v*(y|0)]+=b-t;c[j+v]+=t;y+=g;i+=u}};accumLoop=function(s,d){var e,i;i=0;e=s.length;while(true){d[i]+=s[i];i++;d[i]+=s[i];i++;d[i]+=s[i];i++;d[i]+=s[i];i++;if(i>=e){return}}};accumLoopSat=function(s,d){var e,i;i=0;e=s.length;while(true){if((d[i]+=s[i])>4294967295){d[i]=4294967295}i++;if((d[i]+=s[i])>4294967295){d[i]=4294967295}i++;if((d[i]+=s[i])>4294967295){d[i]=4294967295}i++;if((d[i]+=s[i])>4294967295){d[i]=4294967295}i++;if(i>=e){return}}};this.testClampedArray=function(){var c;c=new Uint8ClampedArray(1);c[0]=300;return c[0]===255};if(this.testClampedArray()){renderLoop=function(s,d,b){var i,j,n;i=0;j=0;n=s.length;while(true){d[i++]=d[i++]=d[i++]=s[j++]*b;d[i++]=255;d[i++]=d[i++]=d[i++]=s[j++]*b;d[i++]=255;d[i++]=d[i++]=d[i++]=s[j++]*b;d[i++]=255;d[i++]=d[i++]=d[i++]=s[j++]*b;d[i++]=255;if(j>=n){return}}}}else{renderLoop=function(s,d,b){var i,j,n,v;i=0;j=0;n=s.length;while(true){v=0|s[j++]*b;if(v>255){v=255}d[i++]=d[i++]=d[i++]=v;d[i++]=255;v=0|s[j++]*b;if(v>255){v=255}d[i++]=d[i++]=d[i++]=v;d[i++]=255;v=0|s[j++]*b;if(v>255){v=255}d[i++]=d[i++]=d[i++]=v;d[i++]=255;v=0|s[j++]*b;if(v>255){v=255}d[i++]=d[i++]=d[i++]=v;d[i++]=255;if(j>=n){return}}}}this.trace=function(msg){var bounces,br,closestDist,closestSeg,cos,counts,d,dx,dy,gradient,hX,hY,height,i,intX,intY,intery,k,l,lastSeg,len,len1,len2,lightX,lightY,m,n,numRays,r,random,rayDirX,rayDirY,rayOriginX,rayOriginY,raySlope,s,s1x,s1y,sDx,sDy,segments,sin,sqrt,t,width,x0,x05,x1,x15,xend,xgap,xn,xpxl1,xpxl2,y0,y1,yend,yn,ypxl1,ypxl2;width=msg.width;height=msg.height;lightX=msg.lightX;lightY=msg.lightY;segments=msg.segments;numRays=msg.numRays;counts=new Uint32Array(width*height);sqrt=Math.sqrt;random=Math.random;sin=Math.sin;cos=Math.cos;for(k=0,len1=segments.length;k<len1;k++){s=segments[k];dx=s.x1-s.x0;dy=s.y1-s.y0;len=Math.sqrt(dx*dx+dy*dy);s.xn=-dy/len;s.yn=dx/len;s.d1=s.diffuse;s.r2=s.d1+s.reflective;s.t3=s.r2+s.transmissive}while(numRays--){t=random()*6.283185307179586;rayOriginX=lightX;rayOriginY=lightY;rayDirX=sin(t);rayDirY=cos(t);lastSeg=null;bounces=1e3;while(bounces--){closestDist=1e38;closestSeg=null;raySlope=rayDirY/rayDirX;for(l=0,len2=segments.length;l<len2;l++){s=segments[l];if(s===lastSeg){continue}s1x=s.x0;s1y=s.y0;sDx=s.x1-s1x;sDy=s.y1-s1y;n=((s1x-rayOriginX)*raySlope+(rayOriginY-s1y))/(sDy-sDx*raySlope);if(n<0||n>1){continue}m=(s1x+sDx*n-rayOriginX)/rayDirX;if(m<0){continue}if(m<closestDist){closestDist=m;closestSeg=s}}if(!closestSeg){break}intX=rayOriginX+closestDist*rayDirX;intY=rayOriginY+closestDist*rayDirY;x0=rayOriginX;y0=rayOriginY;x1=intX;y1=intY;dx=x1-x0;dy=y1-y0;if(dx<0){dx=-dx}if(dy<0){dy=-dy}if(dy>dx){t=x0;x0=y0;y0=t;t=x1;x1=y1;y1=t;hX=width;hY=1}else{hX=1;hY=width}if(x0>x1){t=x0;x0=x1;x1=t;t=y0;y0=y1;y1=t}dx=x1-x0;dy=y1-y0;gradient=dy/dx;br=128*sqrt(dx*dx+dy*dy)/dx;x05=x0+.5;xend=x05|0;yend=y0+gradient*(xend-x0);xgap=br*(1-x05+xend);xpxl1=xend+1;ypxl1=yend|0;i=hX*xend+hY*ypxl1;counts[i]+=xgap*(1-yend+ypxl1);counts[i+hY]+=xgap*(yend-ypxl1);intery=yend+gradient;x15=x1+.5;xpxl2=x15|0;yend=y1+gradient*(xpxl2-x1);xgap=br*(x15-xpxl2);ypxl2=yend|0;i=hX*xpxl2+hY*ypxl2;counts[i]+=xgap*(1-yend+ypxl2);counts[i+hY]+=xgap*(yend-ypxl2);lineLoop(counts,hX*xpxl1,hX*xpxl2,br,intery,gradient,hX,hY);r=random();rayOriginX=intX;rayOriginY=intY;lastSeg=closestSeg;if(r<closestSeg.d1){t=random()*6.283185307179586;rayDirX=sin(t);rayDirY=cos(t)}else if(r<closestSeg.r2){xn=closestSeg.xn;yn=closestSeg.yn;d=2*(xn*rayDirX+yn*rayDirY);rayDirX-=d*xn;rayDirY-=d*yn}else if(r>=closestSeg.t3){break}}}return counts};this.job_trace=function(msg){var c;c=this.trace(msg);return this.postMessage({job:msg.job,cookie:msg.cookie,numRays:msg.numRays,counts:c.buffer},[c.buffer])};this.job_accumulate=function(msg){var src;src=new Uint32Array(msg.counts);if(msg.cookie>this.cookie){this.accumulator=src;this.raysTraced=msg.numRays;return this.cookie=msg.cookie}else if(msg.cookie===this.cookie){this.raysTraced+=msg.numRays;if(this.raysTraced>=16777215){return accumLoopSat(src,this.accumulator)}else{return accumLoop(src,this.accumulator)}}};this.job_render=function(msg){var br,pix;pix=new Uint8ClampedArray(4*this.accumulator.length);br=Math.exp(1+10*msg.exposure)/this.raysTraced;renderLoop(this.accumulator,pix,br);return this.postMessage({job:msg.job,cookie:this.cookie,raysTraced:this.raysTraced,pixels:pix.buffer},[pix.buffer])};this.job_firstTrace=function(msg){this.accumulator=this.trace(msg);this.raysTraced=msg.numRays;this.cookie=msg.cookie;return this.job_render(msg)};this.onmessage=function(_this){return function(event){var msg;msg=event.data;return _this["job_"+msg.job](msg)}}(this)},{}]},{},[2]);