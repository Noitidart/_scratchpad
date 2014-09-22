Cu.import("resource://gre/modules/ctypes.jsm");
var lib = ctypes.open("user32.dll");
var struct_Point = new ctypes.StructType("Point", [
  {"x": ctypes.int},
  {"y": ctypes.int}
]);

/*start setcursorpos*/
var SetCursorPos = lib.declare('SetCursorPos', ctypes.winapi_abi, ctypes.bool, ctypes.int, ctypes.int)

function doSetCursorPos() {
    var ret = SetCursorPos(-10, -500);
}
/*end setcursorpos*/

doSetCursorPos();

lib.close();