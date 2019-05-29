
{
    "radius0": [
        78.21000000000001,
        10,
        200
    ],
    "dtheta": [
        317.47,
        0,
        360
    ],
    "rotation": [
        211.48000000000002,
        0,
        360
    ],
    "segments": [
        7,
        1,
        50,
        1
    ],
    "segLength": [
        2.9000000000000004,
        0,
        20,
        0.1
    ],
    "moreLength": [
        0.8200000000000001,
        -5,
        5
    ],
    "numCircles": [
        4,
        0.1,
        6,
        1
    ],
    "transmissive": [
        0,
        0,
        1
    ],
    "diffuse": [
        0.23,
        0,
        1
    ],
    "reflective": [
        0.85,
        0,
        1
    ]
}




// calculated, cached constants
var deltaTheta  = (Math.PI * 2) * c.numCircles / c.segments
  , dTheta = c.dtheta * Math.PI / 180 / c.segments;

var br=c.radius0,b=c.segments,d=Math.PI*2*c.numCircles/b;

function tangent(angle, radius, left, right) {
  var cos = Math.cos(angle)
    , sin = Math.sin(angle)
    , cx = cos * radius + c.cx
    , cy = sin * radius + c.cy
    , x0 = cx - sin * left
    , y0 = cy + cos * left
    , x1 = cx + sin * right
    , y1 = cy - cos * right
  add_wall(x0, y0, x1, y1, c.diffuse, c.reflective, c.transmissive);
}


var rby = Math.PI*2 / c.segments
for (var i=0; i<c.numCircles; i++) {
  for (var m = 0; m<c.segments; m++) {
    tangent(c.rotation * Math.PI / 180 + m * rby + i*dTheta, c.radius0 * (i/4 + .5), c.segLength*15 + c.moreLength*i*15, 0)
  }
}


