Cu.import('resource://gre/modules/ctypes.jsm');
var user32 = ctypes.open('user32');

if (ctypes.voidptr_t.size == 4 /* 32-bit */) {
	var is64bit = false;
} else if (ctypes.voidptr_t.size == 8 /* 64-bit */) {
	var is64bit = true;
} else {
	throw new Error('huh??? not 32 or 64 bit?!?!');
}

var wantUnicode = true;

// types
// def bool
var BOOL = ctypes.bool;

// def hwnd
var PVOID = ctypes.voidptr_t;
var HANDLE = PVOID;
var HWND = HANDLE;

// def uint
var UINT = ctypes.unsigned_int;

// def wparam
var UINT_PTR = is64bit ? ctypes.uint64_t : ctypes.unsigned_int;
var WPARAM = UINT_PTR;

// def lparam
var LONG_PTR = is64bit ? ctypes.int64_t : ctypes.long;
var LPARAM = LONG_PTR;

//constants
var HWND_BROADCAST = HWND(0xffff);
var WM_WININICHANGE = 0x001A;
var WM_SETTINGCHANGE = WM_WININICHANGE;

var SendNotifyMessage = user32.declare(wantUnicode ? 'SendNotifyMessageW' : 'SendNotifyMessageA', ctypes.winapi_abi, BOOL, HWND, UINT, WPARAM, LPARAM);

var rez_SNM = SendNotifyMessage(HWND_BROADCAST, WM_SETTINGCHANGE, 0, 0);
console.log('rez_SNM:', rez_SNM.toString());

user32.close();