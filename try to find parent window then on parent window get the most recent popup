Cu.import('resource://gre/modules/ctypes.jsm');
var user32 = ctypes.open('user32.dll');

/* http://msdn.microsoft.com/en-us/library/ms633539%28v=vs.85%29.aspx
* BOOL WINAPI SetForegroundWindow(
* __in HWND hWnd
* );
*/
var SetForegroundWindow = user32.declare('SetForegroundWindow', ctypes.winapi_abi, ctypes.bool,
    ctypes.int32_t
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633522%28v=vs.85%29.aspx
* DWORD WINAPI GetWindowThreadProcessId(
* __in_ HWND hWnd,
* __out_opt_ LPDWORD lpdwProcessId
* );
*/
var GetWindowThreadProcessId = user32.declare('GetWindowThreadProcessId', ctypes.winapi_abi, ctypes.unsigned_long, //DWORD
    ctypes.int32_t, //HWND
    ctypes.unsigned_long.ptr //LPDWORD
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633507%28v=vs.85%29.aspx
* HWND WINAPI GetLastActivePopup(
* __in HWND hWnd
* );
*/
var GetLastActivePopup = user32.declare('GetLastActivePopup', ctypes.winapi_abi, ctypes.int32_t, // HWND
    ctypes.int32_t // HWND
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633507%28v=vs.85%29.aspx
* BOOL WINAPI IsIconic(
* __in HWND hWnd
* );
*/
var IsIconic = user32.declare('IsIconic', ctypes.winapi_abi, ctypes.bool, // BOOL
    ctypes.int32_t // HWND
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633507%28v=vs.85%29.aspx
* BOOL WINAPI ShowWindow(
* __in HWND hWnd
* __in INT nCmdShow
* );
*/
var ShowWindow = user32.declare('ShowWindow', ctypes.winapi_abi, ctypes.bool, // BOOL
    ctypes.int32_t, // HWND
    ctypes.int // INT
);
var SW_RESTORE = 9;

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms632668%28v=vs.85%29.aspx
* BOOL WINAPI AllowSetForegroundWindow(
* __in DWORD dwProcessId
* );
*/
var AllowSetForegroundWindow = user32.declare('AllowSetForegroundWindow', ctypes.winapi_abi, ctypes.bool, // BOOL
    ctypes.unsigned_long // DWORD
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633502%28v=vs.85%29.aspx
* BOOL WINAPI GetAncestor(
* __in_  HWND hwnd,
* __in_  UINT gaFlags
* );
*/
var GetAncestor = user32.declare('GetAncestor', ctypes.winapi_abi, ctypes.int32_t, // HWND
    ctypes.int32_t, // HWND
    ctypes.unsigned_int // UINT
);
var GA_PARENT = 1;
var GA_ROOT = 2;
var GA_ROOTOWNER = 3; //same as if calling with GetParent

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633553%28v=vs.85%29.aspx
* VOID WINAPI SwitchToThisWindow(
* __in_  HWND hwnd,
* __in_  BOOL fAltTab
* );
*/
var SwitchToThisWindow = user32.declare('SwitchToThisWindow', ctypes.winapi_abi, ctypes.voidptr_t, // VOID
    ctypes.int32_t, // HWND
    ctypes.bool // BOOL
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633520%28v=vs.85%29.aspx
* int WINAPI GetWindowText(
*  __in_   HWND hWnd,
*  __out_  LPTSTR lpString,
*  __in_   int nMaxCount
* );
*/
var GetWindowTextW = user32.declare('GetWindowTextW', ctypes.winapi_abi, ctypes.int, // INT
    ctypes.int32_t, // HWND
    ctypes.jschar.ptr, // LPTSTR
    ctypes.int // INT
);

var me = Services.ww.activeWindow;
me.setTimeout(function() {
  console.log('execing now');    
    var tWin = Services.wm.getMostRecentWindow('navigator:browser'); // tWin means target_window
  var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIWebNavigation)
                     .QueryInterface(Ci.nsIDocShellTreeItem)
                     .treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIBaseWindow);
  var tHwnd = ctypes.int32_t(ctypes.UInt64(tBaseWin.nativeHandle));
  console.info('tHwnd:', tHwnd, uneval(tHwnd), tHwnd.toString());

    console.log('tHwnd:', tHwnd);
  var nHwnd = GetLastActivePopup(tHwnd);
    console.log('nHwnd:', nHwnd);
  if (!nHwnd) {
      throw new Error('no hwnd returned by GetLastActivePopup');
  }
    
    var bufType = ctypes.ArrayType(ctypes.jschar);
    var buffer = new bufType(256);
    var nWinTitleLen = GetWindowTextW(nHwnd, buffer, buffer.length);
    var nWinTitle = buffer.readString();
    console.log('nWinTitle=', nWinTitle);
    /*
  var rez = SetForegroundWindow(tHwnd);
  if (!rez) {
      throw new Error('SetForegroundWindow failed!');
  }*/
  /*
  var lastActivePopupHwnd = cHwnd; //GetLastActivePopup(cHwnd);
  console.log('lastActivePopupHwnd=', lastActivePopupHwnd, uneval(lastActivePopupHwnd), lastActivePopupHwnd.toString());
  if (!lastActivePopupHwnd) {
      throw new Error('failed to get hwnd of last active popup');
  }
  var rez = FocusWindow(lastActivePopupHwnd);
  console.log('rez=', rez);
  if (!rez) {
      throw new Error('failed to focus window');
  }
  */
}, 10);

function FocusWindow(hwnd) {
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
        var cPid = 	ctypes.cast(ctypes.voidptr_t(0), ctypes.unsigned_long);
        var rez = GetWindowThreadProcessId(hwnd, cPid.address());
        if (!rez) {
            throw new Error('Failed to get PID');
        } else {
            console.log('cPid=', cPid, uneval(cPid), cPid.toString());
            console.log('trying to set pid to foreground process');
            var rez = AllowSetForegroundWindow(cPid);
            console.info('AllowSetForegroundWindow rez:', rez, uneval(rez), rez.toString());
            if (!rez) {
                throw new Error('Failed to AllowSetForegroundWindow');
            } else {
                var rez = SetForegroundWindow(hwnd);
                if (!rez) {
                    throw new Error('Did AllowSetForegroundWindow and then ran SetForegroundWindow but still failed, im now out of ideas to try');
                } else {
                    return rez;
                }
            }
            return false;
        }
    } else {
        return rez;
    }
}