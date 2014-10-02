//https://github.com/nightwing/foximirror/blob/f40afb12beb512fb1d453afa028bc94c53f9326b/ctypes.picker.js#L8
Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  user32: ctypes.open('user32.dll')
}

var DWORD = ctypes.uint32_t;
var HANDLE = ctypes.size_t;
var HWND = HANDLE;
var BOOL = ctypes.bool;
var LPARAM = ctypes.size_t;
var LPTSTR = ctypes.jschar.ptr;

var CallBackABI;
var WinABI;
if (ctypes.size_t.size == 8) {
  CallBackABI = ctypes.default_abi;
  WinABI = ctypes.default_abi;
} else {
  CallBackABI = ctypes.stdcall_abi;
  WinABI = ctypes.winapi_abi;
}

var EnumWindowsProc = ctypes.FunctionType(CallBackABI, BOOL, [HWND, LPARAM]);
var EnumWindows = lib.user32.declare('EnumWindows', WinABI, BOOL, EnumWindowsProc.ptr, LPARAM);
var EnumChildWindows = lib.user32.declare('EnumChildWindows', WinABI, BOOL, HWND, EnumWindowsProc.ptr, LPARAM);
var GetClassName = lib.user32.declare('GetClassNameW', WinABI, ctypes.int, HWND, LPTSTR, ctypes.int);


/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633522%28v=vs.85%29.aspx
* DWORD WINAPI GetWindowThreadProcessId(
* __in_ HWND hWnd,
* __out_opt_ LPDWORD lpdwProcessId
* );
*/
var GetWindowThreadProcessId = lib.user32.declare('GetWindowThreadProcessId', ctypes.winapi_abi, ctypes.unsigned_long, //DWORD
  ctypes.uint32_t, //HWND
  ctypes.uint32_t.ptr //LPDWORD
);

// code to run it

function getRunningPids() {
  //returns an array of pids of running firefox instances
  var ffPids = {};
  var PID = new DWORD;
  var buf = new new ctypes.ArrayType(ctypes.jschar, 255);
  
  var SearchPD = function(hwnd, lParam) {    
    GetClassName(hwnd, buf, 255);
    var className = buf.readString();
    if (className == 'MozillaWindowClass') {
        //console.log('className', className)
        var rez = GetWindowThreadProcessId(hwnd, PID.address());
        if (rez > 0) {
          if (!(PID.value in ffPids)) {
           ffPids[PID.value] = [];
          }
          ffPids[PID.value].push(hwnd);
        } else {
          console.warn('rez is <=0, rez:', rez);
        }
    };
    return true; //let enum continue till nothing to enum
  }
  
  SearchPD_ptr = EnumWindowsProc.ptr(SearchPD);
  var wnd = LPARAM(0);
  console.time('EnumWindows');
  EnumWindows(SearchPD_ptr, ctypes.cast(wnd.address(), LPARAM));
  console.timeEnd('EnumWindows');
  
  return ffPids;
  
}

console.time('getRunningPids');
var pids = getRunningPids();
console.timeEnd('getRunningPids', pids);
///// start - check if vis
/* http://msdn.microsoft.com/en-us/library/ms633515%28v=vs.85%29.aspx
 * LONG_PTR WINAPI GetWindowLongPtr(
 *  __in_  HWND hWnd,
 *  __in_  int nIndex
 * );
 */
if (ctypes.voidptr_t.size == 4 /* 32-bit */) {
  var GetWindowLong = lib.user32.declare('GetWindowLongW', ctypes.winapi_abi, ctypes.unsigned_long,
    HWND,
    ctypes.int
  );
} else if (ctypes.voidptr_t.size == 8 /* 64-bit */) {
  var GetWindowLong = lib.user32.declare('GetWindowLongPtrW', ctypes.winapi_abi, ctypes.unsigned_long.ptr,
    HWND,
    ctypes.int
  );
}
var GWL_STYLE = -16;
var WS_VISIBLE = 0x10000000;
var WS_CAPTION = 0x00C00000;
var altTabStyle = WS_CAPTION | WS_VISIBLE;
var hwndStyle;
///// end - check if vis
for (var p in pids) {
  for (var i=0; i<pids[p].length; i++) {
    if (ctypes.voidptr_t.size == 8) {
      //use ptr for hwndStyle
      hwndStyle = GetWindowLong(pids[p][i], GWL_STYLE);
      hwndStyle = hwndStyle.value; // untested note: i need to test or verify this somehow
    } else {
      //DONT use ptr for hwndStyle
      hwndStyle = GetWindowLong(pids[p][i], GWL_STYLE);
    }
    console.log(i, hwndStyle.toString())
    if (hwndStyle & WS_VISIBLE) {
      pids[p][i] = null;
    }
  }
}
console.log('pids:', pids);

for (var l in lib) {
  lib[l].close();
}