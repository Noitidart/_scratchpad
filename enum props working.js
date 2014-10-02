Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  user32: ctypes.open('user32.dll')
}

var HANDLE = ctypes.size_t;
var HWND = ctypes.int32_t;
var BOOL = ctypes.bool;
var LPARAM = ctypes.size_t;
var LPCTSTR = ctypes.char.ptr;

var CallBackABI;
var WinABI;
if (ctypes.size_t.size == 8) {
  CallBackABI = ctypes.default_abi;
  WinABI = ctypes.default_abi;
} else {
  CallBackABI = ctypes.stdcall_abi;
  WinABI = ctypes.winapi_abi;
}

var PropEnumProc = ctypes.FunctionType(CallBackABI, BOOL, [HWND, LPCTSTR, HANDLE]);
var EnumProps = lib.user32.declare('EnumPropsW', WinABI, ctypes.int, HWND, PropEnumProc.ptr);

// code to run it

function doEnumProps(tHwnd) {
  var i = 0;
  var SearchPD = function(hwnd, lpctstr, hnd) {    
    i++;
    //console.log('hwnd:', hwnd)
    console.log('lpctstr:', lpctstr.readString())
    console.log('hnd:', hnd.toString())
    return true; //let enum continue till nothing to enum
  }
  SearchPD_ptr = PropEnumProc.ptr(SearchPD);
  var wnd = LPARAM(0);
  console.time('EnumProps');
  //EnumProps(ctypes.cast(wnd.address(), LPARAM), SearchPD_ptr);
  EnumProps(tHwnd, SearchPD_ptr);
  console.timeEnd('EnumProps');

}

var tWin = window; //Services.wm.getMostRecentWindow(null); // tWin means target_window
var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIWebNavigation)
                    .QueryInterface(Ci.nsIDocShellTreeItem)
                    .treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIBaseWindow);
var cHwnd = ctypes.int32_t(ctypes.UInt64(tBaseWin.nativeHandle));

console.time('doEnumProps');
var pids = doEnumProps(cHwnd);
console.timeEnd('doEnumProps');

var tBaseWin = Services.wm.getMostRecentWindow('devtools:webconsole').QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIWebNavigation)
                    .QueryInterface(Ci.nsIDocShellTreeItem)
                    .treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIBaseWindow);
var cHwnd = ctypes.int32_t(ctypes.UInt64(tBaseWin.nativeHandle));

console.time('doEnumProps');
var pids = doEnumProps(cHwnd);
console.timeEnd('doEnumProps');

for (var l in lib) {
  lib[l].close();
}