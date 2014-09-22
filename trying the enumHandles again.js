Cu.import("resource://gre/modules/ctypes.jsm"); 
var lib_ntdll = ctypes.open("ntdll.dll");
var lib_kernel32 = ctypes.open("kernel32.dll");

var STATUS_BUFFER_TOO_SMALL = 0xC0000023>>0;
var STATUS_INFO_LENGTH_MISMATCH = 0xC0000004>>0;
var SystemHandleInformation = 16;

var UNICODE_STRING = new ctypes.StructType("UNICODE_STRING", [
    {'Length': ctypes.unsigned_short}, //USHORT
    {'MaximumLength': ctypes.unsigned_short}, //USHORT
    {'Buffer': ctypes.jschar.ptr}
]); //PWSTR  

//https://github.com/tjguk/winsys/blob/5f11b308171382046ff0f67ef3129e47e9fee06c/random/file_handles.py#L100
var SYSTEM_HANDLE_TABLE_ENTRY_INFO = new ctypes.StructType('SYSTEM_HANDLE_TABLE_ENTRY_INFO', [ //typedef struct _TagHANDLEINFO
    {'UniqueProcessId': ctypes.unsigned_long}, //USHORT dwPid; //UniqueProcessId
    {'CreatorBackTraceIndex': ctypes.unsigned_long}, //USHORT CreatorBackTraceIndex; //CreatorBackTraceIndex
    {'ObjectTypeIndex': ctypes.unsigned_long}, //BYTE ObjType; //ObjectTypeIndex UCHAR
    {'HandleAttributes': ctypes.unsigned_long}, //BYTE HandleAttributes; //im not sure if byte should be unsigned_long, maybe unsigned_char //HandleAttributes UCHAR
    {'HandleValue': ctypes.unsigned_long}, //USHORT HndlOffset; //HandleValue USHORT
    {'Object': ctypes.unsigned_long}, //DWORD dwKeObject; //Object PVOID
    {'GrantedAccess': ctypes.unsigned_long} //ULONG GrantedAccess; //GrantedAccess ULONG
]); //HANDLEINFO, PHANDLEINFO;


var SYSTEM_HANDLE_INFORMATION = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION', [
    {'NumberOfHandles': ctypes.unsigned_long},
    {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO, 70000)}
]);

var NtQuerySystemInformation = lib_ntdll.declare("NtQuerySystemInformation", ctypes.winapi_abi, ctypes.long, // return //NTSTATUS 
    ctypes.int, // SystemInformationClass //SYSTEM_INFORMATION_CLASS
    ctypes.void_t.ptr, // SystemInformation //PVOID 
    ctypes.unsigned_long, // SystemInformationLength //ULONG 
    ctypes.unsigned_long.ptr
); // ReturnLength //PULONG 

/* http://msdn.microsoft.com/en-us/library/ms633499%28v=vs.85%29.aspx
* HWND WINAPI FindWindow(
* __in_opt LPCTSTR lpClassName,
* __in_opt LPCTSTR lpWindowName
* );
*/
// NOT SUPPORTED BY WINXP so just doing this to test and then later will figure out how to get handle to path name then look in here
var GetFinalPathNameByHandle = lib_kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
    ctypes.unsigned_short, // HANDLE
    ctypes.void_t.ptr, // LPTSTR
    ctypes.uint32_t, // DWORD
    ctypes.uint32_t // DWORD
);

function enumHandles() {
    var res = {};
    var _enumBufSize = new ctypes.unsigned_long(0x4000);
    var buffer = ctypes.char.array(_enumBufSize.value)();

    while (true) {
        var status = NtQuerySystemInformation(SystemHandleInformation, buffer, _enumBufSize, _enumBufSize.address());
        if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
            buffer = ctypes.char.array(_enumBufSize.value)();
        } else break;
    }

    if (status < 0) return null;
    
    var proc = ctypes.cast(buffer.address(), SYSTEM_HANDLE_INFORMATION.ptr).contents;

    var NumberOfHandles = proc.NumberOfHandles.toString();
    console.log('NumberOfHandles:', NumberOfHandles);

    var Handles = ctypes.cast(proc.Handles, SYSTEM_HANDLE_TABLE_ENTRY_INFO.array(proc.NumberOfHandles).ptr).contents;
    console.log('Handles:', Handles);
    
    for (var i=0; i<NumberOfHandles; i++) {
        /*method 1*/
        var pid = Handles.addressOfElement(i).contents; //this just crashes it, but if i remove the `.UniqueProcessId` it loops through all no problem
        
        /*method 2*/
        //var infoAtI = ctypes.cast(Handles.addressOfElement(i), SYSTEM_HANDLE_TABLE_ENTRY_INFO.ptr).contents;
        //console.log('infoAtI:', infoAtI);
        //var UniqueProcessId = ctypes.cast(infoAtI.addressOfField('UniqueProcessId'), ctypes.unsigned_long.ptr); //add `.contents` to this line crashes it
        //console.log('UniqueProcessId:', UniqueProcessId); //uncommenting this line crashes it
        break;
    }
    return res;
}

var allHandles = enumHandles();
console.log('enumHandles:', Object.keys(allHandles).length, allHandles);

lib_ntdll.close();
lib_kernel32.close();