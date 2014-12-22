Cu.import("resource://gre/modules/ctypes.jsm");

/*start getcursorpos*/
var lib = ctypes.open("user32.dll");


/* Declare the signature of the function we are going to call */
var struct_lpPoint = new ctypes.StructType("lpPoint",
                        [ { "x": ctypes.int },
                          { "y": ctypes.int } ]);
var GetCursorPos = lib.declare('GetCursorPos', ctypes.winapi_abi, ctypes.bool, struct_lpPoint.ptr);

function doGetCursorPos() {
        var point = new struct_lpPoint;
        var ret = GetCursorPos(point.address());
        Cu.reportError(ret);
        Cu.reportError(point);
}
/*end getcursorpos*/




/*start setcursorpos*/
//var lib = ctypes.open("user32.dll"); //already called on line 4
var SetCursorPos = lib.declare('SetCursorPos', ctypes.winapi_abi, ctypes.bool, ctypes.int, ctypes.int)

function doSetCursorPos() {
    var ret = SetCursorPos(10, 10);
}
/*end setcursorpos*/

/*start mouse_event*/
//used to click
//const DWORD = ctypes.uint32_t; //this just shows you that DWORD == ctypes.uint32_t
var mouse_event = lib.declare('mouse_event', ctypes.winapi_abi, ctypes.void_t, ctypes.uint32_t, ctypes.uint32_t, ctypes.uint32_t, ctypes.uint32_t, ctypes.uintptr_t);
var MOUSEEVENTF_LEFTDOWN = 2;
var MOUSEEVENTF_LEFTUP = 4;

function domouse_event() {
    var ret = mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    var ret = mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
}
/*end mouse_event*/

function clickXTimesWhereCursorIs(X, everyMs) {
        var point = new struct_lpPoint;
        var ret = GetCursorPos(point.address());
        Cu.reportError(ret);
        Cu.reportError(point);
    var ret = SetCursorPos(point.x, point.y);
    for (var i=0; i<X; i++) {
          setTimeout(function() {
       var ret = mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);      
       var ret = mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
          }, i*everyMs);
    }
}

setTimeout(function() {
    clickXTimesWhereCursorIs(150, 200);
}, 3000)