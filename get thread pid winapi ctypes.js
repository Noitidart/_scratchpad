Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  user32: ctypes.open('user32.dll')
}
 
/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633522%28v=vs.85%29.aspx
* DWORD WINAPI GetWindowThreadProcessId(
* __in_ HWND hWnd,
* __out_opt_ LPDWORD lpdwProcessId
* );
*/
var GetWindowThreadProcessId = lib.user32.declare('GetWindowThreadProcessId', ctypes.winapi_abi,
  ctypes.unsigned_long, //DWORD
  ctypes.voidptr_t, //HWND
  ctypes.unsigned_long.ptr //LPDWORD
);
 
 
var aDOMWindow = window;
var baseWindow = aDOMWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem).treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).nsIBaseWindow;
 
var hWnd = ctypes.voidptr_t(ctypes.UInt64(baseWindow.nativeHandle));
 
var PID = new ctypes.unsigned_long; //DWORD
var rez = GetWindowThreadProcessId(hWnd, PID.address());

console.info('rez:', rez, rez.toString(), uneval(rez));
console.info('PID:', PID, PID.toString(), uneval(PID));

 
//can now do `console.log(PID.value)` OR `console.log(PID.address().contents)`
 
for (var l in lib) {
  lib[l].close();
}