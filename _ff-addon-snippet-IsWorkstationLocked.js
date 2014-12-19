Cu.import('resource://gre/modules/ctypes.jsm')

var wintypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.bool;
	this.DWORD = ctypes.uint32_t;
	this.HANDLE = ctypes.voidptr_t;
	this.INT = ctypes.int;
	this.PVOID = ctypes.voidptr_t;

	// ADVANCED types (ones that are equal to something predefined by me)
	this.ACCESS_MASK = this.DWORD; // http://msdn.microsoft.com/en-us/library/windows/desktop/aa374892%28v=vs.85%29.aspx // typedef DWORD ACCESS_MASK; // typedef ACCESS_MASK* PACCESS_MASK;
	this.HDESK = this.HANDLE; // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383751%28v=vs.85%29.aspx // typedef HANDLE HDESK;
	this.LPDWORD = this.DWORD.ptr; // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383751%28v=vs.85%29.aspx // typedef DWORD *LPDWORD;

	// CONSTANTS
	this.GENERIC_READ = 0x80000000;
	this.UOI_NAME = 2;
}
var ostypes = new wintypesInit();

var lib = {};

function _lib(path) {
	//ensures path is in lib, if its in lib then its open, if its not then it adds it to lib and opens it. returns lib
	//path is path to open library
	//returns lib so can use straight away

	if (!(path in lib)) {
		lib[path] = ctypes.open(path);
	}
	return lib[path];
}

// declares in this worker, i set them all = to null for the scratchpad because i may declare it wrong and it wont re-declare unless if it first the var is !
var OpenInputDesktop = null;
var GetUserObjectInformation = null;
var CloseDesktop = null;

function IsWorkstationLocked() {
	if (!OpenInputDesktop) {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms684309%28v=vs.85%29.aspx
		 * HDESK WINAPI OpenInputDesktop(
		 *   __in_  DWORD dwFlags,
		 *   __in_  BOOL fInherit,
		 *   __in_  ACCESS_MASK dwDesiredAccess
		 * );
		 */
		OpenInputDesktop = _lib('user32.dll').declare('OpenInputDesktop', ctypes.winapi_abi,
			ostypes.HDESK,		// return
			ostypes.DWORD,		// dwFlags
			ostypes.BOOL,		// fInherit
			ostypes.ACCESS_MASK	// dwDesiredAccess
		);
	}
	if (!GetUserObjectInformation) {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms683238%28v=vs.85%29.aspx
		 * BOOL WINAPI GetUserObjectInformation(
		 *   __in_       HANDLE hObj,
		 *   __in_       int nIndex,
		 *   __out_opt_  PVOID pvInfo,
		 *   __in_       DWORD nLength,
		 *   __out_opt_  LPDWORD lpnLengthNeeded
		 * );
		 */
		GetUserObjectInformation = _lib('user32.dll').declare('GetUserObjectInformationW', ctypes.winapi_abi,
			ostypes.BOOL,	// return
			ostypes.HANDLE,	// hObj
			ostypes.INT,	// nIndex
			ostypes.PVOID,	// pvInfo
			ostypes.DWORD,	// nLength
			ostypes.LPDWORD	// lpnLengthNeeded
		);
	}
	if (!CloseDesktop) {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms682024%28v=vs.85%29.aspx
		 * BOOL WINAPI CloseDesktop(
		 *   __in_  HDESK hDesktop
		 * );
		 */
		CloseDesktop = _lib('user32.dll').declare('CloseDesktop', ctypes.winapi_abi,
			ostypes.BOOL,	// return
			ostypes.HDESK	// hDesktop
		);
	}

	var is_locked = true;
	var input_desk = OpenInputDesktop(0, false, ostypes.GENERIC_READ);
	//console.info('debug-msg :: input_desk:', input_desk, uneval(input_desk));

	if (!input_desk.isNull()) { //if work station is locked, input_desk is null
		try {
			var name = ctypes.jschar.array(256)(); // wchar_t name[256] from chromium code they decidd onwchar_t and 256bytes // this is `var buffer = ` of wchar_t if i do ctypes.char.array(256) on readString of it i get `D`, which is just the first character, i dont know why, but jschar fixed it up // i was doing `ostypes.PVOID();` but i was geting ctypes.winLastError of 998 which isERROR_NOACCESS
			var needed = ostypes.DWORD();
			var rez_GUBI = GetUserObjectInformation(input_desk, ostypes.UOI_NAME, name, name.constructor.size, needed.address());
			if (!rez_GUBI) {
				//console.error('An error occured in GetUserObjectInformation, ctypes.winLastError:', ctypes.winLastError);
				throw new Error('An error occured in GetUserObjectInformation, ctypes.winLastError: ' + ctypes.winLastError);
			} else {
				//console.info('debug-msg :: SUCCESS on rez_GUBI:', rez_GUBI);
				//console.info('debug-msg :: needed:', needed);
				var str_ofBuffer_name = name.readString();
				console.info('debug-msg :: str_ofBuffer_name:', str_ofBuffer_name);
				if (str_ofBuffer_name == 'Default') {
					is_locked = str_ofBuffer_name != 'Default';
				}
			}
		} finally {
			var rez_CD = CloseDesktop(input_desk);
			if (!rez_CD) {
				console.warn('Failed to CloseDesktop', 'rez_CD:', rez_CD, 'winLastError:', ctypes.winLastError);
				//should maybe throw here
			} else {
				//console.info('debug-msg :: succesfully did closedesktop');
			}
		}
	} else {
		console.log('debug-msg :: input_desk is null so its locked im guessing, input_desk:', input_desk, uneval(input_desk));
	}
	return is_locked;
}

/*
var rez_IWL = IsWorkstationLocked();
console.info('debug-msg :: rez_IWL:', rez_IWL);

for (var l in lib) {
	lib[l].close();
}
*/

setTimeout(function() {
	var rez_IWL = IsWorkstationLocked();
	console.info('debug-msg :: rez_IWL:', rez_IWL);

	for (var l in lib) {
		lib[l].close();
	}
}, 5000);