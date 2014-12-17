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

var doc = gBrowser.contentDocument;
var can = doc.querySelector('section[id=canvas]')
can.addEventListener('mousedown', function() {
  doc.defaultView.setTimeout(function() {
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
    
    console.log('move to:', point.x + width, point.y + height)
    var ret = SetCursorPos(point.x + width, point.y + height);
    if (!ret) {
      console.warn('failed to set cursor pos');
      return;
    }
  }, 1000);
}, false)