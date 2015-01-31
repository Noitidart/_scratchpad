Cu.import('resource://gre/modules/ctypes.jsm');

var shell32 = ctypes.open('shell32.dll');

/* http://msdn.microsoft.com/en-us/library/windows/desktop/bb762118%28v=vs.85%29.aspx
* void SHChangeNotify(
* LONG wEventId,
* UINT uFlags,
* __in_opt_  LPCVOID dwItem1,
* __in_opt_  LPCVOID dwItem2
* );
*/
var SHChangeNotify = shell32.declare('SHChangeNotify', ctypes.winapi_abi, ctypes.voidptr_t, //void
	ctypes.long, //LONG
	ctypes.long, //LONG
	ctypes.char.ptr, //LPCVOID
	ctypes.char.ptr //LPCVOID
);

// CONSTANTS
var SHCNE_UPDATEITEM = 0x02000;
var SHCNE_ASSOCCHANGED = 0x8000000;
var SHCNF_IDLIST = 0x0;
var SHCNF_PATH = 5;

//var rez = SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, null, null); //updates all
var rez = SHChangeNotify(SHCNE_UPDATEITEM, SHCNF_PATH, OS.Path.join('C:\\Users\\Vayeate\\AppData\\Roaming\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar', 'Firefox (2).lnk'), null); //updates path
console.info('rez:', rez, rez.toString(), uneval(rez));