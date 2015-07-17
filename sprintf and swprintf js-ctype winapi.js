Cu.import('resource://gre/modules/ctypes.jsm');
var msv = ctypes.open('msvcrt');
var swprintf = msv.declare('swprintf', ctypes.default_abi, ctypes.int, ctypes.jschar.ptr, ctypes.jschar.ptr, ctypes.uint64_t.ptr)
var sprintf = msv.declare('sprintf', ctypes.default_abi, ctypes.int, ctypes.char.ptr, ctypes.char.ptr, ctypes.uint64_t.ptr);
var result = ctypes.uint64_t.array(100)();
var hexResult = ctypes.jschar.array()(Services.dirsvc.get('GreD', Ci.nsIFile).path);
var rez = swprintf(hexResult, '%I64X', result);
console.log('rez:', rez.toString(), 'hexResult:', hexResult.readString());