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
// def long
var LONG = ctypes.long;

// def bool
var BOOL = ctypes.bool;

// def int
var INT = ctypes.int;

// def word
var WORD = ctypes.unsigned_short;

// def dword
var DWORD = ctypes.unsigned_long;

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

// def ulong_ptr
var ULONG_PTR = is64bit ? ctypes.uint64_t : ctypes.unsigned_long;

// structures
var MOUSEINPUT = ctypes.StructType('tagMOUSEINPUT', [
    { 'dx': LONG },
    { 'dy': LONG },
    { 'mouseData': DWORD },
    { 'dwFlags': DWORD },
    { 'time': ULONG_PTR },
    { 'dwExtraInfo': DWORD }
]);

var KEYBDINPUT = ctypes.StructType('tagKEYBDINPUT', [
    { 'wVk': WORD },
    { 'wScan': WORD },
    { 'dwFlags': DWORD },
    { 'time': DWORD },
    { 'dwExtraInfo': ULONG_PTR },
    { 'padding0': ctypes.uint8_t.array((MOUSEINPUT.size) - (WORD.size + WORD.size + DWORD.size + DWORD.size + ULONG_PTR.size) ) } // i need dum1 and dum2 due to: http://stackoverflow.com/questions/27972667/what-are-these-extra-parameters-when-calling-sendinput-via-win32api#comment44338874_27972900
]);

var INPUT = ctypes.StructType('tagINPUT', [
    { 'type': DWORD },
    { 'ki': KEYBDINPUT } // union, pick which one you want, we want keyboard input
]);

// constatns
var INPUT_KEYBOARD = 1;
var KEYEVENTF_EXTENDEDKEY = 0x0001;
var KEYEVENTF_KEYUP = 0x0002;
var KEYEVENTF_UNICODE = 0x0004;
var KEYEVENTF_SCANCODE = 0x0008;

var LPINPUT = INPUT.ptr; // pointer to first element of array of INPUTs

var SendInput = user32.declare('SendInput', ctypes.winapi_abi, UINT, UINT, LPINPUT, INT);

var keybdPadding = ctypes.uint8_t.array(KEYBDINPUT.fields[5].padding0.size)();
var js_pInputs = [
    INPUT(INPUT_KEYBOARD, KEYBDINPUT(0x54, 0, 0, 0, 0, keybdPadding)), // vk codes: https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731%28v=vs.85%29.aspx
    //INPUT(INPUT_KEYBOARD, KEYBDINPUT(0x54, 0, KEYEVENTF_KEYUP, 0, 0, keybdPadding)) // im not sure if we need to send a key up, it works though, this types a lower case t
];

var pInputs = INPUT.array()(js_pInputs);

console.info(pInputs.length, pInputs.toString(), INPUT.size)

var rez_SI = SendInput(pInputs.length, pInputs[0].address(), INPUT.size);
console.log('rez_SI:', rez_SI.toString());

if (parseInt(rez_SI.toString()) != pInputs.length) {
    console.error('not all key events were sent, win api error:', ctypes.winLastError);
}

user32.close();