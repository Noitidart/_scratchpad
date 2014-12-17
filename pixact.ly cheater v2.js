Cu.import("resource://gre/modules/ctypes.jsm");

/*start getcursorpos*/
var lib = ctypes.open("user32.dll");

/* Declare the signature of the function we are going to call */
var struct_lpPoint = new ctypes.StructType("lpPoint",
                        [ { "x": ctypes.int },
                          { "y": ctypes.int } ]);
var GetCursorPos = lib.declare('GetCursorPos', ctypes.winapi_abi, ctypes.bool, struct_lpPoint.ptr);
/*end getcursorpos*/

/*start setcursorpos*/
//var lib = ctypes.open("user32.dll"); //already called on line 4
var SetCursorPos = lib.declare('SetCursorPos', ctypes.winapi_abi, ctypes.bool, ctypes.int, ctypes.int)
/*end setcursorpos*/

var mouseX0;
var mouseX1;
var mouseY0;
var mouseY1;
var doc = gBrowser.contentDocument;
var can = doc.querySelector('section[id=canvas]');

function trackPageXY(e) {
  mouseX1 = e.pageX;
  mouseY1 = e.pageY;
}
var moveTillPageXRight;
var moveTillPageYRight;
var delayIt;

can.addEventListener('mouseup', function(e) {
  
  can.removeEventListener('mousemove', trackPageXY, false);
  try {
   doc.defaultView.clearTimeout(delayIt);
   doc.defaultView.clearInterval(moveTillPageXRight);
   doc.defaultView.clearInterval(moveTillPageYRight);
  } catch (ignore) {}
    mouseX1 = e.pageX;
    mouseY1 = e.pageY;
  console.log('mouseX1:', e.pageX);
  console.log('mouseY1:', e.pageY);
      var width = parseInt(doc.querySelector('.width-copy .value').textContent);
    var height = parseInt(doc.querySelector('.height-copy .value').textContent);
  
  console.log('mouseXDiff:', mouseX1-mouseX0, 'failWidth:', mouseX1-mouseX0-width);
  console.log('mouseYDiff:', mouseY1-mouseY0, 'failHeight:', mouseY1-mouseY0-height);
  
}, false);
can.addEventListener('mousedown', function(e) {
  can.addEventListener('mousemove', trackPageXY, false);
  delayIt = doc.defaultView.setTimeout(function() {
     mouseX0 = e.pageX;
    mouseY0 = e.pageY;
     console.log('mouseX0:',e.pageX);
     console.log('mouseY0', e.pageY);
    
     var point = new struct_lpPoint;
     var ret = GetCursorPos(point.address());
    if (!ret) {
      console.warn('failed to get cursor pos')
      return;
    }
    console.log('point:', point.x, point.y);

    var width = parseInt(doc.querySelector('.width-copy .value').textContent);
    var height = parseInt(doc.querySelector('.height-copy .value').textContent);
    
    console.log('width:', width, 'height:', height);
    
    
    var win = doc.defaultView;
    var xOffset = 0;
    moveTillPageXRight = win.setInterval(function() {
      if (xOffset > 0 && mouseX1-mouseX0-width >= 0) {
        win.clearInterval(moveTillPageXRight);
        console.log('reached proper width')
        //now move to get y right
        var yOffset = 0;
        moveTillPageYRight = win.setInterval(function() {
          if (yOffset > 0 && mouseY1-mouseY0-height >= 0) {
            console.log('reached proper height');
            win.clearInterval(moveTillPageYRight);
            return;
          }
          yOffset++;
          var ret = SetCursorPos(point.x + xOffset, point.y + yOffset);
          if (!ret) {
            console.warn('failed to set cursor pos');
            return;
          }
        }, 10);
        //end nw move to get y right
        return;
      }
      xOffset++;
      var ret = SetCursorPos(point.x + xOffset, point.y);
      if (!ret) {
        console.warn('failed to set cursor pos');
        return;
      }
    }, 10);
    


    
    /*
    //for some reason this is offset so not accurate
    console.log('move to:', point.x + width, point.y + height)
    var ret = SetCursorPos(point.x + width, point.y + height);
    if (!ret) {
      console.warn('failed to set cursor pos');
      return;
    }
    */
  }, 1000);
}, false)