Cu.import("resource://gre/modules/ctypes.jsm");
Cu.import('resource://gre/modules/osfile.jsm');
var lib = {
    kernel32: ctypes.open('kernel32.dll')
}

var _FilePath = OS.Path.join(OS.Constants.Path.desktopDir, 'rawr.txt'); //will create this file on desktop
console.log(_FilePath)

//var INVALID_HANDLE_VALUE = ctypes.voidptr_t(-1);
var GENERIC_READ = 0x80000000;
var GENERIC_WRITE = 0x40000000;
var OPEN_EXISTING = 3;
var CREATE_ALWAYS = 2;
var FILE_ATTRIBUTE_NORMAL = 0x80; //128
var FILE_FLAG_OVERLAPPED = 0x40000000;
var OPEN_ALWAYS = 4;
var FILE_SHARE_READ = 0x00000001;
var FILE_SHARE_WRITE = 0x00000002;
var FILE_SHARE_DELETE = 0x00000004;

var INVALID_HANDLE_VALUE = new ctypes.Int64(-1);
var FSCTL_SET_SPARSE = 0x900c4;
var FSCTL_SET_ZERO_DATA = 0x980c8;
var FILE_BEGIN = 0;

let CreateFile = lib.kernel32.declare("CreateFileW", ctypes.winapi_abi, ctypes.voidptr_t, // return type: handle to the file
  ctypes.jschar.ptr, // in: lpFileName
  ctypes.uint32_t,   // in: dwDesiredAccess
  ctypes.uint32_t,   // in: dwShareMode
  ctypes.voidptr_t,  // in, optional: lpSecurityAttributes (note that
                     // we're cheating here by not declaring a
                     // SECURITY_ATTRIBUTES structure -- that's because
                     // we're going to pass in null anyway)
  ctypes.uint32_t,   // in: dwCreationDisposition
  ctypes.uint32_t,   // in: dwFlagsAndAttributes
  ctypes.voidptr_t   // in, optional: hTemplateFile
);

let CloseHandle = lib.kernel32.declare( "CloseHandle", ctypes.winapi_abi, ctypes.int32_t, //bool  // return type: 1 indicates success, 0 failure
  ctypes.voidptr_t // in: hObject
);


let hFile = CreateFile(_FilePath, 0, 0, null, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, null);
let hFileInt = ctypes.cast(hFile, ctypes.intptr_t);
console.log('hFileInt:', hFileInt.toString())
if (ctypes.Int64.compare(hFileInt.value, INVALID_HANDLE_VALUE) == 0) {
  throw new Error("CreateFile failed for " + _FilePath + ", error " + ctypes.winLastError);
}
CloseHandle(hFile);

for (var l in lib) {
  lib[l].close();
}