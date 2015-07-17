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
var SHChangeNotify = shell32.declare('SHChangeNotify', ctypes.winapi_abi,
	ctypes.voidptr_t, // return
	ctypes.long, //wEventId
	ctypes.unsigned_int, //uFlags
	ctypes.voidptr_t, //dwItem1
	ctypes.voidptr_t //dwItem2
);

// CONSTANTS
var SHCNE_UPDATEITEM = 0x02000;
var SHCNE_ASSOCCHANGED = 0x8000000;
var SHCNF_IDLIST = 0x0000;
var SHCNF_PATH = 0x0005; // SHCNF_PATHW = 0x0005
var SHCNF_FLUSH = 0x1000;
var SHCNF_FLUSHNOWAIT = 0x2000;

//var rez = SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, null, null); //updates all
var path = ctypes.jschar.array()('C:\\Users\\Vayeate\\AppData\\Roaming\\Mozilla\\Firefox\\profilist_data\\launcher_icons\\BADGE-ID_youtube-2__CHANNEL-REF_beta.ico');
console.log('path:', path.address())
var rez = SHChangeNotify(SHCNE_UPDATEITEM, SHCNF_PATH | SHCNF_FLUSHNOWAIT, path, null); //updates path
console.info('rez:', rez, rez.toString(), uneval(rez));