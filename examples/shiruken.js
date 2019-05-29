{
    "x0": [
        "cx",
        0.01,
        -100,
        100
    ],
    "y0": [
        "cy",
        0.01,
        -100,
        100
    ],
    "xoffset": [
        2.7,
        0,
        10
    ],
    "radius0": [
        17.02,
        10,
        200
    ],
    "finalRadius": [
        12.950000000000001,
        0,
        20
    ],
    "theta0": [
        178.54,
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
        18.6,
        0,
        20,
        0.1
    ],
    "numCircles": [
        6,
        0.1,
        6,
        1
    ],
    "transmissive": [
        0.07,
        0,
        1
    ],
    "diffuse": [
        0.6,
        0,
        1
    ],
    "reflective": [
        0.16,
        0,
        1
    ]
}

// calculated, cached constants
var deltaTheta  = (Math.PI * 2) * c.numCircles / c.segments
  , deltaRadius = (c.finalRadius - c.radius0) / c.segments;

var x = c.x0, y = c.y0;

var br=c.radius0,b=c.segments,d=Math.PI*2*c.numCircles/b;
var inc = (c.finalRadius - c.radius0) / c.segments;

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
  , r2by = (c.finalRadius - c.radius0) / c.numCircles
for (var i=0; i<c.numCircles; i++) {
  for (var m = 0; m<c.segments; m++) {
    tangent(c.theta0 + m * rby + i*r2by, c.radius0 * (i/4 + .5), c.segLength*15, 0)
  }
}

            

