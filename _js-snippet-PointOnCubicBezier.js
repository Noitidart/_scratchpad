var coord = function (x,y) {
  if(!x) var x=0;
  if(!y) var y=0;
  return {x: x, y: y};
}

function B1(t) { return t*t*t }
function B2(t) { return 3*t*t*(1-t) }
function B3(t) { return 3*t*(1-t)*(1-t) }
function B4(t) { return (1-t)*(1-t)*(1-t) }

function getBezier(percent,C1,C2,C3,C4) {
  var pos = new coord();
  pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
  pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
  return pos;
}

var finalHeight = 300;
var finalTime = 250;
var me = Services.ww.activeWindow;

var ease = { //cubic-bezier(0.25, 0.1, 0.25, 1.0)
  xs: [0, .25, .25, 1],
  ys: [0, .1, 1, 1]
};


var theBezier = ease;
me.alert(getBezier(.8, new coord(theBezier.xs[3]*finalTime,theBezier.ys[3]*finalHeight), new coord(theBezier.xs[2]*finalTime,theBezier.ys[2]*finalHeight), new coord(theBezier.xs[1]*finalTime,theBezier.ys[1]*finalHeight), new coord(theBezier.xs[0]*finalTime,theBezier.ys[0]*finalHeight)).toSource());
me.alert(getBezier(.8, new coord(theBezier.xs[0]*finalTime,theBezier.ys[0]*finalHeight), new coord(theBezier.xs[1]*finalTime,theBezier.ys[1]*finalHeight), new coord(theBezier.xs[2]*finalTime,theBezier.ys[2]*finalHeight), new coord(theBezier.xs[3]*finalTime,theBezier.ys[3]*finalHeight)).toSource());

//({x:78.125, y:161.25})
//({x:78.125, y:161.25})