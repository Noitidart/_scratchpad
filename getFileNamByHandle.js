Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  user32: ctypes.open('user32.dll'),
  kernel32: ctypes.open('kernel32.dll'),
  psapi: ctypes.open('psapi.dll')
}

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa364955%28v=vs.85%29.aspx
DWORD WINAPI GetFileSize(
  _In_       HANDLE hFile,
  _Out_opt_  LPDWORD lpFileSizeHigh
);
*/
var GetFileSize = lib.kernel32.declare('GetFileSize', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
  ctypes.unsigned_long, // HANDLE
  ctypes.uint32_t.ptr // LPDWORD
);


/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa379560%28v=vs.85%29.aspx
typedef struct _SECURITY_ATTRIBUTES {
  DWORD  nLength;
  LPVOID lpSecurityDescriptor;
  BOOL   bInheritHandle;
} SECURITY_ATTRIBUTES, *PSECURITY_ATTRIBUTES, *LPSECURITY_ATTRIBUTES;
*/
var SECURITY_ATTRIBUTES = new ctypes.StructType('SECURITY_ATTRIBUTES', [
  {'Length': ctypes.uint32_t}, //DWORD
  {'lpSecurityDescriptor': ctypes.voidptr_t}, //LPVOID
  {'bInheritHandle': ctypes.bool} //BOOL 
]);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa364955%28v=vs.85%29.aspx
HANDLE WINAPI CreateFileMapping(
  _In_      HANDLE hFile,
  _In_opt_  LPSECURITY_ATTRIBUTES lpAttributes,
  _In_      DWORD flProtect,
  _In_      DWORD dwMaximumSizeHigh,
  _In_      DWORD dwMaximumSizeLow,
  _In_opt_  LPCTSTR lpName
);
*/
var CreateFileMapping = lib.kernel32.declare('CreateFileMappingW', ctypes.winapi_abi, ctypes.unsigned_long, //HANDLE
  ctypes.unsigned_long, //HANDLE
  SECURITY_ATTRIBUTES, //lpAttributes
  ctypes.uint32_t, //DWORD
  ctypes.uint32_t, //DWORD                    
  ctypes.uint32_t, //DWORD
  ctypes.jschar.ptr //LPCTSTR
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa366761%28v=vs.85%29.aspx
LPVOID WINAPI MapViewOfFile(
  _In_  HANDLE hFileMappingObject,
  _In_  DWORD dwDesiredAccess,
  _In_  DWORD dwFileOffsetHigh,
  _In_  DWORD dwFileOffsetLow,
  _In_  SIZE_T dwNumberOfBytesToMap
);
*/
var MapViewOfFile = lib.kernel32.declare('MapViewOfFile', ctypes.winapi_abi, ctypes.voidptr_t, //LPVOID
  ctypes.unsigned_long, //HANDLE
  ctypes.uint32_t, //DWORD
  ctypes.uint32_t, //DWORD
  ctypes.uint32_t, //DWORD
  ctypes.size_t //SIZE_T
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms683195%28v=vs.85%29.aspx
DWORD WINAPI GetMappedFileName(
  _In_   HANDLE hProcess,
  _In_   LPVOID lpv,
  _Out_  LPTSTR lpFilename,
  _In_   DWORD nSize
);
*/
try {
  var GetMappedFileName = lib.kernel32.declare('GetMappedFileNameW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
    ctypes.unsigned_long, // HANDLE
    ctypes.jschar.ptr, // LPTSTR
    ctypes.uint32_t //DWORD
  );
} catch(ex) {
  //on win7 its in kernel32 but on win7 v1 its psapi, also in vista, exp etc its psapi
  var GetMappedFileName = lib.psapi.declare('GetMappedFileNameW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
    ctypes.unsigned_long, // HANDLE
    ctypes.jschar.ptr, // LPTSTR
    ctypes.uint32_t //DWORD
  );
}

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms683179%28v=vs.85%29.aspx
HANDLE WINAPI GetCurrentProcess(void);
*/
var GetCurrentProcess = lib.kernel32.declare('GetCurrentProcess', ctypes.winapi_abi, ctypes.unsigned_long //HANDLE
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa366882%28v=vs.85%29.aspx
BOOL WINAPI UnmapViewOfFile(
  _In_  LPCVOID lpBaseAddress
);
*/
var UnmapViewOfFile = lib.kernel32.declare('UnmapViewOfFile', ctypes.winapi_abi, ctypes.bool, //BOOL
  ctypes.voidptr_t //LPCVOID
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms724211%28v=vs.85%29.aspx
BOOL WINAPI CloseHandle(
  _In_  HANDLE hObject
);
*/
var CloseHandle = lib.kernel32.declare('CloseHandle', ctypes.winapi_abi, ctypes.bool, //BOOL
  ctypes.unsigned_long //HANDLE
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms684320%28v=vs.85%29.aspx
HANDLE WINAPI OpenProcess(
  _In_  DWORD dwDesiredAccess,
  _In_  BOOL bInheritHandle,
  _In_  DWORD dwProcessId
);
*/
var OpenProcess = lib.kernel32.declare('OpenProcess', ctypes.winapi_abi, ctypes.unsigned_long, //HANDLE
  ctypes.uint32_t, //DWORD
  ctypes.bool, //BOOL
  ctypes.uint32_t //DWORD
);


/* constants */ 
var PAGE_READONLY = 0x02;
var FILE_MAP_READ = 0x04;
var MAX_PATH = 260;

//https://github.com/kanzure/brlcad/blob/05952aafa27ee9df17cd900f5d8f8217ed2194af/src/libbu/fchmod.c#L50
//http://msdn.microsoft.com/en-us/library/windows/desktop/aa366789%28v=vs.85%29.aspx
function getFileNameFromHandle(hFile, hProcess) {
  //hFile is ctypes.unsigned_long
  //hProcess is handle of process that has hFile opened
  
  var bSuccess = false; //ctypes.bool
  var pszFileName = ctypes.jschar.array(MAX_PATH+1); //TCHAR
  
  var dwFileSizeHi = new ctypes.uint32_t; //DWRD ctypes.uint32_t
  var dwFileSizLo = GetFileSize(handleFile, dwFileSizeHi.address()); //DWORD ctypes.uint32_t
  
  if (dwFileSizeLo == 0 && dwFileSizeHi == 0) {
     console.warn('cannot map a file with a length of zero')
     return false;
  }
  
  var hFileMap = CreateFileMapping(hFile, null, PAGE_READONLY, 0, 1, null);
  
  if (hFileMap) {
    var pMem = MapViewOfFile(hFileMap, FILE_MAP_READ, 0, 0, 1);
    if (pMem) {
      var rez = GetMappedFileName(hProcess, pMem, pszFilename, MAX_PATH)
      if (rez) {
        // Translate path with device name to drive letters.
        //i didnt implement this stuff
      }
    }
    CloseHandle(hFileMap);
  }
}

for (var l in lib) {
  lib[l].close();
}