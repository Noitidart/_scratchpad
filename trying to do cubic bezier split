//////////////////START FROM ISCRIPTDESIGN
var splitBezier = function(array, perc) {
    array.unshift({x:0, y:0});
    var coll = [];
    while (array.length > 0) {
    for (var i = 0;i < array.length-1; i++) {
        coll.unshift(array[i]);
        array[i] = interpolate(array[i], array[i+1], perc);
    }
    coll.unshift(array.pop());
    }
    return {b1: [{x:coll[5].x, y:coll[5].y}, {x:coll[2].x, y:coll[2].y},{x:coll[0].x, y:coll[0].y}]
        , b2: [{x:coll[1].x - coll[0].x,y:coll[1].y-coll[0].y}, {x:coll[3].x - coll[0].x,y:coll[3].y-coll[0].y}, {x:coll[6].x - coll[0].x,y:coll[6].y-coll[0].y}]};
}

var interpolate = function (p0, p1, percent) {
    if (typeof percent === 'undefined') percent = 0.5;  
    return  {x: p0.x + (p1.x - p0.x) * percent
         , y: p0.y + (p1.y - p0.y) * percent};
}
//////////////////END FROM ISCRIPTDESIGN
var coord = function (x,y) {
  if(!x) var x=0;
  if(!y) var y=0;
  return {x: x, y: y};
}
var easeInOut = [new coord(0,0), new coord(.42,0), new coord(.58,1), new coord(1,1)];
var split50percent = splitBezier(easeInOut.slice(), .5);
Services.ww.activeWindow.alert(uneval(split50percent))