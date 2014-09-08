Cu.import('resource://gre/modules/ctypes.jsm');

var lib = {
    user32: ctypes.open('user32.dll'),
    ntdll: ctypes.open('ntdll.dll'),
    kernel32: ctypes.open('kernel32.dll')
}


/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633522%28v=vs.85%29.aspx
* DWORD WINAPI GetWindowThreadProcessId(
* __in_ HWND hWnd,
* __out_opt_ LPDWORD lpdwProcessId
* );
*/
var GetWindowThreadProcessId = lib.user32.declare('GetWindowThreadProcessId', ctypes.winapi_abi, ctypes.unsigned_long, //DWORD
  ctypes.voidptr_t, //HWND
  ctypes.uint32_t.ptr //LPDWORD
);

var STATUS_BUFFER_TOO_SMALL = 0xC0000023>>0;
var STATUS_INFO_LENGTH_MISMATCH = 0xC0000004>>0;
var SystemHandleInformation = 16;

var UNICODE_STRING = new ctypes.StructType("UNICODE_STRING", [
{'Length': ctypes.unsigned_short}, //USHORT
{'MaximumLength': ctypes.unsigned_short}, //USHORT
{'Buffer': ctypes.jschar.ptr} ]); //PWSTR  

//https://github.com/tjguk/winsys/blob/5f11b308171382046ff0f67ef3129e47e9fee06c/random/file_handles.py#L100
var SYSTEM_HANDLE_TABLE_ENTRY_INFO = new ctypes.StructType('SYSTEM_HANDLE_TABLE_ENTRY_INFO', [ //typedef struct _TagHANDLEINFO
{'UniqueProcessId': ctypes.unsigned_short}, //USHORT dwPid; //UniqueProcessId
{'CreatorBackTraceIndex': ctypes.unsigned_short}, //USHORT CreatorBackTraceIndex; //CreatorBackTraceIndex
{'ObjectTypeIndex': ctypes.unsigned_long}, //BYTE ObjType; //ObjectTypeIndex UCHAR
{'HandleAttributes': ctypes.unsigned_long}, //BYTE HandleAttributes; //im not sure if byte should be unsigned_long, maybe unsigned_char //HandleAttributes UCHAR
{'HandleValue': ctypes.unsigned_short}, //USHORT HndlOffset; //HandleValue USHORT
{'Object': ctypes.void_t.ptr}, //DWORD dwKeObject; //Object PVOID
{'GrantedAccess': ctypes.unsigned_long} //ULONG GrantedAccess; //GrantedAccess ULONG
]); //HANDLEINFO, PHANDLEINFO;


var arrSizeGosh = 40000;
var SYSTEM_HANDLE_INFORMATION = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION', [
{'NumberOfHandles': ctypes.unsigned_long},
{'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO, arrSizeGosh)}
]);

var NtQuerySystemInformation = lib.ntdll.declare("NtQuerySystemInformation",
ctypes.winapi_abi,
ctypes.long, // return //NTSTATUS 
ctypes.int, // SystemInformationClass //SYSTEM_INFORMATION_CLASS
ctypes.void_t.ptr, // SystemInformation //PVOID 
ctypes.unsigned_long, // SystemInformationLength //ULONG 
ctypes.unsigned_long.ptr); // ReturnLength //PULONG 

/* http://msdn.microsoft.com/en-us/library/ms633499%28v=vs.85%29.aspx
* HWND WINAPI FindWindow(
* __in_opt LPCTSTR lpClassName,
* __in_opt LPCTSTR lpWindowName
* );
*/
// NOT SUPPORTED BY WINXP so just doing this to test and then later will figure out how to get handle to path name then look in here
var GetFinalPathNameByHandle = lib.kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
ctypes.unsigned_short, // HANDLE
ctypes.void_t.ptr, // LPTSTR
ctypes.uint32_t, // DWORD
ctypes.uint32_t // DWORD
);



function enumHandlesOfPid(thePID) {
    var res = {};
    var _enumBufSize = new ctypes.unsigned_long(0x4000);
    var buffer = ctypes.char.array(_enumBufSize.value)();

    while (true) {
        var status = NtQuerySystemInformation(SystemHandleInformation, buffer,
            _enumBufSize, _enumBufSize.address());
        if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
            buffer = ctypes.char.array(_enumBufSize.value)();
        } else break;
    }

    if (status < 0) return null;
    var proc = ctypes.cast(buffer.addressOfElement(0), SYSTEM_HANDLE_INFORMATION.ptr).contents;
    console.log(proc.address().contents.NumberOfHandles.toString())
    
    var numHandles = proc.NumberOfHandles.toString();
    for (var i=0; i<numHandles; i++) {
        if (i == arrSizeGosh-1) { //because i max the array at 5000
            break;
        }
        //console.log('handleVal:', handleVal, 'pid:', pid);
        
        var pid = proc.Handles[i].UniqueProcessId.toString();
        
        //if (proc.Handles[i].UniqueProcessId != thePID) {
        if (pid != thePID) {
            continue;
        }

         //var pid = proc.Handles[i].UniqueProcessId.toString();
        var handleVal = proc.Handles[i].HandleValue.toString();
        res[handleVal] = 0;
      
    }
    
    
    return Object.keys(res);
}

function pidOfThisFF() {
    var aDOMWindow = Services.wm.getMostRecentWindow(null);
    var baseWindow = aDOMWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                                .getInterface(Ci.nsIWebNavigation)
                                .QueryInterface(Ci.nsIDocShellTreeItem)
                                .treeOwner
                                .QueryInterface(Ci.nsIInterfaceRequestor)
                                .nsIBaseWindow;

    var nativeHandle = baseWindow.nativeHandle;
    var handle = ctypes.voidptr_t(ctypes.UInt64(nativeHandle));

    var PID = new ctypes.uint32_t; //DWORD
    GetWindowThreadProcessId(handle, PID.address());

    //can now do `console.log(PID.value)` OR `console.log(PID.address().contents)`
    return PID.value;
}

var myPid = pidOfThisFF().toString();
console.log('myPid:', myPid);

var allHandlesOfThisFF = enumHandlesOfPid(myPid);
console.log('enumHandles:', allHandlesOfThisFF);


for (var l in lib) {
  lib[l].close();
}