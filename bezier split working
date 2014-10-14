function splitCubicBezier(options) {
  var z = options.z,
      cz = z-1,
      z2 = z*z,
      cz2 = cz*cz,
      z3 = z2*z,
      cz3 = cz2*cz,
      x = options.x,
      y = options.y;

  var left = [
    x[0],
    y[0],
    z*x[1] - cz*x[0], 
    z*y[1] - cz*y[0], 
    z2*x[2] - 2*z*cz*x[1] + cz2*x[0],
    z2*y[2] - 2*z*cz*y[1] + cz2*y[0],
    z3*x[3] - 3*z2*cz*x[2] + 3*z*cz2*x[1] - cz3*x[0],
    z3*y[3] - 3*z2*cz*y[2] + 3*z*cz2*y[1] - cz3*y[0]];

  var right = [
    z3*x[3] - 3*z2*cz*x[2] + 3*z*cz2*x[1] - cz3*x[0],
    z3*y[3] - 3*z2*cz*y[2] + 3*z*cz2*y[1] - cz3*y[0],
                    z2*x[3] - 2*z*cz*x[2] + cz2*x[1],
                    z2*y[3] - 2*z*cz*y[2] + cz2*y[1],
                                    z*x[3] - cz*x[2], 
                                    z*y[3] - cz*y[2], 
                                                x[3],
                                                y[3]];
  
  if (options.fitUnitSquare) {
    return {
      left: left.map(function(el, i) {
        if (i % 2 == 0) {
          //return el * (1 / left[6])
          var Xmin = left[0];
          var Xmax = left[6]; //should be 1
          var Sx = 1 / (Xmax - Xmin);
          return (el - Xmin) * Sx;
        } else {
          //return el * (1 / left[7])
          var Ymin = left[1];
          var Ymax = left[7]; //should be 1
          var Sy = 1 / (Ymax - Ymin);
          return (el - Ymin) * Sy;
        }
      }),
      right: right.map(function(el, i) {
        if (i % 2 == 0) {
          //xval
          var Xmin = right[0]; //should be 0
          var Xmax = right[6];
          var Sx = 1 / (Xmax - Xmin);
          return (el - Xmin) * Sx;
        } else {
          //yval
          var Ymin = right[1]; //should be 0
          var Ymax = right[7];
          var Sy = 1 / (Ymax - Ymin);
          return (el - Ymin) * Sy;
        }
      })
    }
  } else {
   return { left: left, right: right};
  }
}

var easeInOut = {
  xs: [0, .42, .58, 1],
  ys: [0,   0,   1, 1]
};

[0.5, 0.5, 0.645, 0.75, 0.79, 1, 1, 1]
[  0,   0,  0.29,  0.5, 0.58, 1, 1, 1]

var splitRes = splitCubicBezier({
  z: .1,
  x: easeInOut.xs,
  y: easeInOut.ys,
  fitUnitSquare: false
});

Services.wm.getMostRecentWindow(null).alert(splitRes.toSource())

var easeInOutSine = {
  xs: [0, .44, .55, 1],
  ys: [0, .05, .95, 1]
};

var ease = { //cubic-bezier(0.25, 0.1, 0.25, 1.0)
  xs: [0, .25, .25, 1],
  ys: [0, .1, 1, 1]
};