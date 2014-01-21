// calculated, cached constants
var deltaTheta  = (Math.PI * 2) * c.numCircles / c.segments
  , deltaRadius = (c.finalRadius - c.radius0) / c.segments;

var br=c.radius0,b=c.segments,d=Math.PI*2*c.numCircles/b;
var inc = (c.finalRadius - c.radius0) / c.segments;
for (var i=0; i<b; i+=2) {
    var a = i*d;
    var r = br + i*inc, r2 = r + inc;
    add_wall(Math.cos(a)*r+c.x0,
             Math.sin(a)*r   +c.y0,
             Math.cos(a+d)*r2+c.x0,
             Math.sin(a+d)*r2+c.y0,
             0, 1, 0);
}


clear_all();
var x=cx,y=cy,br=100,b=40,d=Math.PI*2/b;
var inc = 2;
for (var i=0; i<b; i+=2) {
    var a = i*d;
    var r = br + i*inc, r2 = r + inc;
    add_wall(Math.cos(a)*r+x, Math.sin(a)*r+y, Math.cos(a+d)*r2+x, Math.sin(a+d)*r2+y, 0, 1, 0);
}
draw();


clear_all();
var x=cx,y=cy,br=50,b=50,d=Math.PI*10/b;
var l = 5;
var inc = 1;
for (var i=0; i<b; i+=2) {
    var a = i*d;
    var r = br + i*inc, r2 = r + inc;
    add_wall(Math.cos(a)*r+x, Math.sin(a)*r+y, Math.cos(a+l)*r2+x, Math.sin(a+l)*r2+y, 0, .5, .5);
}
draw();

clear_all();
var x=cx,y=cy,br=20,b=65,d=Math.PI/b;
var l = 5.7;
var inc = 1;
for (var i=0; i<b; i+=2) {
    var a = i*d+Math.PI+.2;
    var r = br + i*inc, r2 = r + inc;
    add_wall(Math.cos(a)*r+x, Math.sin(a)*r+y, Math.cos(a+l)*r2+x, Math.sin(a+l)*r2+y, 0, 1, 0);
}
draw();

function wall_at(a0, r0, a1, r1) {
  add_wall(Math.cos(a0)*r0+c.x0, Math.sin(a0)*r0+c.y0, Math.cos(a1)*r1+c.x0, Math.sin(a1)*r1+c.y0, c.transmissive, c.diffuse, c.reflective);
}

function tangent(angle, radius, left, right) {
  var cos = Math.cos(angle)
    , sin = Math.sin(angle)
    , cx = cos * radius + c.x0
    , cy = sin * radius + c.y0
    , x0 = cx - sin * left
    , y0 = cy + cos * left
    , x1 = cx + sin * right
    , y1 = cy - cos * right
  add_wall(x0, y0, x1, y1, c.transmissive, c.diffuse, c.reflective);
}

var rby = Math.PI*2 / c.segments
for (var i=0; i<c.numCircles) {
  for (var m = 0; m<c.segments) {
    tangent(m * rby, c.radius0, c.segLength, c.segLength)
  }
}

