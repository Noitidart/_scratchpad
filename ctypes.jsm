Cu.import('resource://gre/modules/ctypes.jsm');
var rstrtmgr = ctypes.open('Rstrtmgr.dll');

/* http://msdn.microsoft.com/en-us/library/ms633539%28v=vs.85%29.aspx
* BOOL WINAPI SetForegroundWindow(
* __in HWND hWnd
* );
*/
var SetForegroundWindow = user32.declare('SetForegroundWindow', ctypes.winapi_abi, ctypes.bool,
    ctypes.int32_t
);

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


var me = Services.ww.activeWindow;

console.log('execing now');    
var tWin = Services.wm.getMostRecentWindow('navigator:browser'); // tWin means target_window
var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor)
                  .getInterface(Ci.nsIWebNavigation)
                  .QueryInterface(Ci.nsIDocShellTreeItem)
                  .treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
                  .getInterface(Ci.nsIBaseWindow);
var tHwnd = ctypes.int32_t(ctypes.UInt64(tBaseWin.nativeHandle));
console.info('tHwnd:', tHwnd, uneval(tHwnd), tHwnd.toString());

var rez = SwitchToThisWindow(tHwnd, false);
if (!rez) {
  throw new Error('SwitchToThisWindow failed!');
}


 
rstrtmgr.close();