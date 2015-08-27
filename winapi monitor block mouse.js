Cu.import('resource://gre/modules/ctypes.jsm');

var is64bit = ctypes.voidptr_t.size == 4 ? false : true;
var ifdef_UNICODE = true;

var TYPES = {
    ABI: is64bit ? ctypes.default_abi : ctypes.winapi_abi,
    CALLBACK_ABI: is64bit ? ctypes.default_abi : ctypes.stdcall_abi,

	BOOL: ctypes.bool,
	INT: ctypes.int,
	LONG_PTR: is64bit ? ctypes.int64_t : ctypes.long,
	PVOID: ctypes.voidptr_t,
	UINT_PTR: is64bit ? ctypes.uint64_t : ctypes.unsigned_int,
    CHAR: ctypes.char,
    DWORD: ctypes.uint32_t,
    LONG: ctypes.long,
    LPCVOID: ctypes.voidptr_t,
    ULONG_PTR: is64bit ? ctypes.uint64_t : ctypes.unsigned_long,
    WCHAR: ctypes.jschar
};

// advanced types - based on simple types
TYPES.HANDLE = TYPES.PVOID;
TYPES.LPARAM = TYPES.LONG_PTR;
TYPES.LPCSTR = TYPES.CHAR.ptr;
TYPES.LPCWSTR = TYPES.WCHAR.ptr;
TYPES.LPDWORD = TYPES.DWORD.ptr;
TYPES.LPSTR = TYPES.CHAR.ptr;
TYPES.LPWSTR = TYPES.WCHAR.ptr;
TYPES.LRESULT = TYPES.LONG_PTR;
TYPES.SCARDCONTEXT = TYPES.ULONG_PTR;
TYPES.WPARAM = TYPES.UINT_PTR;

// advanced advanced types - based on advanced types
TYPES.HHOOK = TYPES.HANDLE;
TYPES.HINSTANCE = TYPES.HANDLE;
TYPES.HWND = TYPES.HANDLE;
TYPES.LPCTSTR = ifdef_UNICODE ? TYPES.LPCWSTR : TYPES.LPCSTR;
TYPES.LPSCARDCONTEXT = TYPES.SCARDCONTEXT.ptr;
TYPES.LPTSTR = ifdef_UNICODE ? TYPES.LPWSTR : TYPES.LPSTR;
TYPES.PSCARDCONTEXT = TYPES.SCARDCONTEXT.ptr;

// simple structs
TYPES.POINT = ctypes.StructType('_tagPOINT', [
	{ x: TYPES.LONG },
	{ y: TYPES.LONG }
]);

TYPES.MSLLHOOKSTRUCT = ctypes.StructType('tagMSLLHOOKSTRUCT', [
	{ pt: TYPES.POINT },
	{ mouseData: TYPES.DWORD },
	{ flags: TYPES.DWORD },
	{ time: TYPES.DWORD },
	{ dwExtraInfo: TYPES.ULONG_PTR },
]);

// simple callbacks
TYPES.LowLevelMouseProc = ctypes.FunctionType(TYPES.CALLBACK_ABI, TYPES.LRESULT, [TYPES.INT, TYPES.WPARAM, TYPES.LPARAM]);


// guess types
TYPES.HOOKPROC = TYPES.LowLevelMouseProc.ptr; // not a guess really, as this is the hook type i use, so yeah it has to be a pointer to it

var CONST = {
	WH_MOUSE_LL: 14,
	WM_LBUTTONDOWN: 0x0201,
	WM_LBUTTONUP: 0x0202,
	WM_MOUSEMOVE: 0x0200,
	WM_MOUSEWHEEL: 0x020A,
	WM_MOUSEHWHEEL: 0x020E,
	WM_RBUTTONDOWN: 0x0204,
	WM_RBUTTONUP: 0x0205
};

var user32 = ctypes.open('user32');
var SetWindowsHookEx = user32.declare(ifdef_UNICODE ? 'SetWindowsHookExW' : 'SetWindowsHookExA', TYPES.ABI, TYPES.HHOOK, TYPES.INT, TYPES.HOOKPROC, TYPES.HINSTANCE, TYPES.DWORD);
var UnhookWindowsHookEx = user32.declare('UnhookWindowsHookEx', TYPES.ABI, TYPES.BOOL, TYPES.HHOOK);
var CallNextHookEx = user32.declare('CallNextHookEx', TYPES.ABI, TYPES.LRESULT, TYPES.HHOOK, TYPES.INT, TYPES.WPARAM, TYPES.LPARAM);
var GetWindowThreadProcessId = user32.declare('GetWindowThreadProcessId', TYPES.ABI, TYPES.DWORD, TYPES.HWND, TYPES.LPDWORD);

// types, consts, and functions declarations complete, now lets use it
try {

	/*
	var domWinMain = Services.wm.getMostRecentWindow('navigator:browser');
	if (!domWinMain) {
		throw new Error('No browser window found');
	}
	var hwndStrMain = domWinMain.QueryInterface(Ci.nsIInterfaceRequestor)
								  .getInterface(Ci.nsIWebNavigation)
								  .QueryInterface(Ci.nsIDocShellTreeItem)
								  .treeOwner
								  .QueryInterface(Ci.nsIInterfaceRequestor)
								  .getInterface(Ci.nsIBaseWindow)
								  .nativeHandle;

	var hwndMain = TYPES.HWND(ctypes.UInt64(hwndStrMain));
	
	var tpidMain = GetWindowThreadProcessId(hwndMain, null); // thread id of main thread
	console.info('tpidMain:', tpidMain);
	*/
	
	var myLLMouseHook_js = function(nCode, wParam, lParam) {
		
		var rez_CallNext = CallNextHookEx(null, nCode, wParam, lParam);
		console.info('rez_CallNext:', rez_CallNext, rez_CallNext.toString());
		
		return rez_CallNext;
	};
	var myLLMouseHook_c = TYPES.LowLevelMouseProc.ptr(myLLMouseHook_js);
	
	var aHhk = SetWindowsHookEx(CONST.WH_MOUSE_LL, myLLMouseHook_c, null, 0);
	console.info('aHhk:', aHhk, aHhk.toString());
	if (aHhk.isNull()) {
		console.error('failed to set hook, winLastError:', ctypes.winLastError);
		throw new Error('failed to set hook');
	}
	
	setTimeout(function() {
		var rez_Unhook = UnhookWindowsHookEx(aHhk);
		console.info('rez_Unhook:', rez_Unhook);
		
		user32.close();
		console.log('user32 closed');		
	}, 5000);
} finally {
    // user32.close();
    // console.log('user32 closed');
}