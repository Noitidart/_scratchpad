Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  user32: ctypes.open('user32.dll')
}

var NULL = ctypes.cast(ctypes.uint64_t(0x0), ctypes.voidptr_t);

/* http://msdn.microsoft.com/en-us/library/ms633514%28VS.85%29.aspx
 * HWND WINAPI GetTopWindow(
 * __in_opt_  HWND hWnd
 * );
 */
var GetTopWindow = lib.user32.declare('GetTopWindow', ctypes.winapi_abi, ctypes.voidptr_t,
  ctypes.voidptr_t
);

/* http://msdn.microsoft.com/en-us/library/ms633515%28v=vs.85%29.aspx
 * I was trying to use GetNextWindow however that is not available through DLL, but that just calls GetWindow so am using GetWindow with GW_HWNDNEXT instead
 * HWND WINAPI GetWindow(
 *  __in_  HWND hWnd,
 *  __in_  UINT wCmd
 * );
 */
var GetWindow = lib.user32.declare('GetWindow', ctypes.winapi_abi, ctypes.voidptr_t,
  ctypes.voidptr_t,
  ctypes.unsigned_int
);
var GW_HWNDNEXT = 2;

/* http://msdn.microsoft.com/en-us/library/ms633515%28v=vs.85%29.aspx
 * LONG_PTR WINAPI GetWindowLongPtr(
 *  __in_  HWND hWnd,
 *  __in_  int nIndex
 * );
 */
if (ctypes.voidptr_t.size == 4 /* 32-bit */) {
  var GetWindowLong = lib.user32.declare('GetWindowLongW', ctypes.winapi_abi, ctypes.unsigned_long.ptr,
    ctypes.voidptr_t,
    ctypes.int
  );
} else if (ctypes.voidptr_t.size == 8 /* 64-bit */) {
  var GetWindowLong = lib.user32.declare('GetWindowLongPtrW', ctypes.winapi_abi, ctypes.unsigned_long.ptr,
    ctypes.voidptr_t,
    ctypes.int
  );
}
var GWL_STYLE = -16;
var WS_VISIBLE = 0x10000000;
var WS_CAPTION = 0x00C00000;


var GetClassName = lib.user32.declare('GetClassNameW', WinABI, ctypes.int, HWND, LPTSTR, ctypes.int);

var hwndC = GetTopWindow(NULL);
var hwndStyle;
var styleIsInAltTab = WS_VISIBLE | WS_CAPTION;

var i = 0;
var buf;
var PID = new ctypes.uint_32t;
while (hwndC != NULL) {
  hwndStyle = GetWindowLong(hwndC, GWL_STYLE);
  
  hwndC = GetWindow(hwndC, GW_HWNDNEXT);
  buf = new new ctypes.ArrayType(ctypes.jschar, 255);
  GetClassName(hwnd, buf, 255);
  var className = buf.readString();
  if (className == 'MozillaWindowClass') {
    var rez = GetWindowThreadProcessId(hwnd, PID.address());
    console.log
  };
  console.log('i:', i);
  i++;
  if (i >= 10) {
    console.warn('breaking because went through too many windows, i:', i);
    break;
  }
}
console.log('hwndC:', hwndC);

for (var l in lib) {
  lib[l].close();
}