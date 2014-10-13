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
  var GetWindowLong = lib.user32.declare('GetWindowLongW', ctypes.winapi_abi, ctypes.unsigned_long,
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
var styleIsInAltTab = WS_VISIBLE | WS_CAPTION;

var GetClassName = lib.user32.declare('GetClassNameW', ctypes.winapi_abi, ctypes.int,
  ctypes.voidptr_t, // HWND
  ctypes.jschar.ptr, // LPTSTR
  ctypes.int
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633522%28v=vs.85%29.aspx
* DWORD WINAPI GetWindowThreadProcessId(
* __in_ HWND hWnd,
* __out_opt_ LPDWORD lpdwProcessId
* );
*/
var GetWindowThreadProcessId = lib.user32.declare('GetWindowThreadProcessId', ctypes.winapi_abi, ctypes.unsigned_long, //DWORD
  ctypes.voidptr_t, //ctypes.uint32_t, //HWND
  ctypes.uint32_t.ptr //LPDWORD
);

/* http://msdn.microsoft.com/en-us/library/ms633539%28v=vs.85%29.aspx
* BOOL WINAPI SetForegroundWindow(
* __in HWND hWnd
* );
*/
var SetForegroundWindow = lib.user32.declare('SetForegroundWindow', ctypes.winapi_abi, ctypes.bool,
  ctypes.voidptr_t // HWND
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633507%28v=vs.85%29.aspx
* BOOL WINAPI IsIconic(
* __in HWND hWnd
* );
*/
var IsIconic = lib.user32.declare('IsIconic', ctypes.winapi_abi, ctypes.bool, // BOOL
    ctypes.voidptr_t // HWND
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633507%28v=vs.85%29.aspx
* BOOL WINAPI ShowWindow(
* __in HWND hWnd
* __in INT nCmdShow
* );
*/
var ShowWindow = lib.user32.declare('ShowWindow', ctypes.winapi_abi, ctypes.bool, // BOOL
    ctypes.voidptr_t, // HWND
    ctypes.int // INT
);
var SW_RESTORE = 9;

function winFocusWindow(hwnd) {
    if (IsIconic(hwnd)) {
        console.warn('its minimized so un-minimize it');
        //its minimized so unminimize it
        var rez = ShowWindow(hwnd, SW_RESTORE);
        if (!rez) {
            throw new Error('Failed to un-minimize window');
        }
    }
    var rez = SetForegroundWindow(hwnd);
    if (!rez) {
        console.log('could not set to foreground window for a reason other than minimized, maybe process is not foreground, lets try that now');
        /*
        var cPid = 	ctypes.cast(ctypes.voidptr_t(0), ctypes.unsigned_long);
        var rez = GetWindowThreadProcessId(hwnd, cPid.address());
        if (!rez) {
            throw new Error('Failed to get PID');
        } else {
            console.log('trying to set pid to foreground process');
            return false;
        }
        */
    } else {
        return rez;
    }
}


var hwndC = GetTopWindow(null);

var hwndStyle;
var i = 0;
var buf;
var PID = new ctypes.uint32_t;
var skipThisMany = 3;
var skipped = 0;
while (hwndC != NULL) {
  //console.log('i:', i);  
  hwndC = GetWindow(hwndC, GW_HWNDNEXT);

  var rez_GWTPI = GetWindowThreadProcessId(hwndC, PID.address());
  //console.log(i, 'rez_GWTPI:', rez_GWTPI.toString(), 'pid:', PID.value);
  if (rez_GWTPI > 0 && PID.value == 4764) {
    //console.log('pid found:', PID.value);
    hwndStyle = GetWindowLong(hwndC, GWL_STYLE);
    if ('contents' in hwndStyle) {
      hwndStyle = hwndStyle.contents; //handles 64 bit //untested but im pretty sure (99%) it will get the uint64 like it is for 32bit
    }
    //console.log('hwndStyle', hwndStyle.toString());
    if (hwndStyle & WS_VISIBLE) {
       var rez_WFW = winFocusWindow(hwndC);
       console.log('rez_WFW:', rez_WFW);
      if (!rez_WFW) {
        throw new Error('failed to focus most recent window');
      }
      break;
    }
  }
  /*
  buf = new new ctypes.ArrayType(ctypes.jschar, 255);
  GetClassName(hwndC, buf, 255);
  var className = buf.readString();
  hwndStyle = GetWindowLong(hwndC, GWL_STYLE);
  if (className == 'MozillaWindowClass') {
    var rez = GetWindowThreadProcessId(hwndC, PID.address());
    console.log(PID.value);
    if (PID.value == 4764) {
      if (skipped == skipThisMany) {
       var rez_SFW = SetForegroundWindow(hwndC);
       console.log('rez_SFW:', rez_SFW);
       break;
      } else {
        console.log('SKIPPING ', skipped);
        skipped++;
      }
    }
  };
  */
  i++;
  if (i >= 3000) {
    console.warn('breaking because went through too many windows, i:', i);
    throw new Error('could not find most recent window of this pid')
    break;
  }
}
console.log('hwndC:', hwndC);

for (var l in lib) {
  lib[l].close();
}