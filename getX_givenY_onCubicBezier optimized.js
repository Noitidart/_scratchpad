function getValOnCubicBezier_givenXorY(options) {
  /*
  options = {
   cubicBezier: {xs:[x1, x2, x3, x4], ys:[y1, y2, y3, y4]};
   x: NUMBER //this is the known x, if provide this must not provide y, a number for x will be returned
   y: NUMBER //this is the known y, if provide this must not provide x, a number for y will be returned
  }
  */
  if ('x' in options && 'y' in options) {
    throw new Error('cannot provide known x and known y');
  }
  if (!('x' in options) && !('y' in options)) {
    throw new Error('must provide EITHER a known x OR a known y');
  }
  
  var x1 = options.cubicBezier.xs[0];
  var x2 = options.cubicBezier.xs[1];
  var x3 = options.cubicBezier.xs[2];
  var x4 = options.cubicBezier.xs[3];
  
  var y1 = options.cubicBezier.ys[0];
  var y2 = options.cubicBezier.ys[1];
  var y3 = options.cubicBezier.ys[2];
  var y4 = options.cubicBezier.ys[3];
  
  var LUT = {
    x: [],
    y: []
  }
  
  if ('x' in options) {
    var knw = 'x'; //known
    var unk = 'y'; //unknown
  } else {
    var knw = 'y'; //known
    var unk = 'x'; //unknown
  }
  var knws = knw + 's';
  var unks = unk + 's';
  
  var t = 1/100; //initially get 1
  var tNext;
  var LUTunk;
  var LUTknw;
  var LUTknw_next = (1-t)*(1-t)*(1-t)*options.cubicBezier[knws][0] + 3*(1-t)*(1-t)*t*options.cubicBezier[knws][1] + 3*(1-t)*t*t*options.cubicBezier[knws][2] + t*t*t*options.cubicBezier[knws][3]; //initially get 1 for loop at 0
  for(var i=0; i<100; i++) {
    t = i/100;
    LUTknw = LUTknw_next;
    t = (i+1)/100;
    LUTknw_next = (1-t)*(1-t)*(1-t)*options.cubicBezier[knws][0] + 3*(1-t)*(1-t)*t*options.cubicBezier[knws][1] + 3*(1-t)*t*t*options.cubicBezier[knws][2] + t*t*t*options.cubicBezier[knws][3];
    if (options[knw] >= LUTknw && options[knw] <= LUTknw_next) {
      console.log('LUTknw:', LUTknw)
      t = i/100;
      LUTunk = (1-t)*(1-t)*(1-t)*options.cubicBezier[unks][0] + 3*(1-t)*(1-t)*t*options.cubicBezier[unks][1] + 3*(1-t)*t*t*options.cubicBezier[unks][2] + t*t*t*options.cubicBezier[unks][3];
      var linearInterpolationValue = options[knw] - LUTknw;
      return LUTunk + linearInterpolationValue;
    }
  }
}

var ease = { //cubic-bezier(0.25, 0.1, 0.25, 1.0)
  xs: [0, .25, .25, 1],
  ys: [0, .1, 1, 1]
};

var linear = {
  xs: [0, 0, 1, 1],
  ys: [0, 0, 1, 1]
};

console.time('calc');
var x = getValOnCubicBezier_givenXorY({y:.5, cubicBezier:ease});
console.timeEnd('calc');
console.log('x:', x);