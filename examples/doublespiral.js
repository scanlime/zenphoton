
clear_all();

var dist = 0, cy = cy + 0;

// Constants for you to play around with :)
var x0           = cx + dist
  , y0           = cy
  , radius0      = 50 // pixels
  , finalRadius  = 200
  , theta0       = 0   // in radians. 2*PI = full circle
  , segments     = 40
  , segLength    = .8  // 1 makes a continuous spiral
  , numCircles   = 2
  , diffuse      = 0
  , reflective   = .5
  , transmissive = .5

  // calculated, cached constants
  , deltaTheta  = (Math.PI * 2) * numCircles / segments
  , deltaRadius = (finalRadius - radius0) / segments;

// Create the walls
for (var i=0; i < segments; i+=1) {
    var theta1  = theta0  + i * deltaTheta
      , theta2  = theta1  +     deltaTheta * segLength
      , radius1 = radius0 + i * deltaRadius
      , radius2 = radius1 +     deltaRadius;

    add_wall(Math.cos(theta1) * radius1 + x0, 
             Math.sin(theta1) * radius1 + y0, 
             Math.cos(theta2) * radius2 + x0, 
             Math.sin(theta2) * radius2 + y0, 
             diffuse, reflective, transmissive);
}
// Constants for you to play around with :)
var x0          = cx - dist;
deltaTheta *= -1;

// Create the walls
for (var i=0; i < segments; i+=1) {
    var theta1  = theta0  + i * deltaTheta
      , theta2  = theta1  +     deltaTheta * segLength
      , radius1 = radius0 + i * deltaRadius
      , radius2 = radius1 +     deltaRadius;

    add_wall(- Math.cos(theta1) * radius1 + x0, 
             Math.sin(theta1) * radius1 + y0, 
             - Math.cos(theta2) * radius2 + x0, 
             Math.sin(theta2) * radius2 + y0, 
             diffuse, reflective, transmissive);
}
draw();

