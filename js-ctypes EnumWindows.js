//https://github.com/nightwing/foximirror/blob/f40afb12beb512fb1d453afa028bc94c53f9326b/ctypes.picker.js#L8

Components.utils.import("resource://gre/modules/ctypes.jsm"); 
user32dll = ctypes.open('user32.dll');

var DWORD = ctypes.uint32_t;
var HANDLE = ctypes.size_t;
var HWND = HANDLE;
var BOOL = ctypes.bool;
var LPARAM = ctypes.size_t;
var LPTSTR = ctypes.jschar.ptr;

var CallBackABI;
var WinABI;
if (ctypes.size_t.size == 8) {
  CallBackABI = ctypes.default_abi;
  WinABI = ctypes.default_abi;
} else {
  CallBackABI = ctypes.stdcall_abi;
  WinABI = ctypes.winapi_abi;
}

var EnumWindowsProc = ctypes.FunctionType(CallBackABI, BOOL, [HWND, LPARAM]);
var EnumWindows = user32dll.declare('EnumWindows', WinABI, BOOL, EnumWindowsProc.ptr, LPARAM);
var EnumChildWindows = user32dll.declare('EnumChildWindows', WinABI, BOOL, HWND, EnumWindowsProc.ptr, LPARAM);
var GetClassName = user32dll.declare('GetClassNameW', WinABI, ctypes.int, HWND, LPTSTR, ctypes.int);
// code to run it

var i = 0;

function SearchPD(hwnd, lParam) {
    console.log('i=', i);
    i++;
    //var result = true;
    //var buf = new new ctypes.ArrayType(ctypes.jschar, 255);
    //GetClassName(hwnd, buf, 255);
    //ans.push([buf.readString(), hwnd])
    if (i <= 3) {
     return true; //i think this (returning true) keeps the enum going
    } else {
      return false;
    }
  /*
    if (buf.readString() == 'TMainForm') {
        var PID = new DWORD;
        GetWindowThreadProcessId(hwnd, PID.address());
        var PName = ProcessFileName(PID.address().contents);
        if (PName.toLowerCase() == 'pdownloadmanager.exe') {
            LPARAM.ptr(lParam).contents = hwnd;
            result = false;
        }
    }
    return result; // i think this `return result` breaks the enum
  */
}

SearchPD_ptr = EnumWindowsProc.ptr(SearchPD);
var wnd = LPARAM(0);
EnumWindows(SearchPD_ptr, ctypes.cast(wnd.address(), LPARAM));