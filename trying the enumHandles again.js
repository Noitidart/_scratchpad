Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
    ntdll: ctypes.open('ntdll.dll'),
    kernel32: ctypes.open('kernel32.dll'),
}

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
    {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO, 1)}
]);

var NtQuerySystemInformation = lib.ntdll.declare("NtQuerySystemInformation", ctypes.winapi_abi, ctypes.long, // return //NTSTATUS 
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
var GetFinalPathNameByHandle = lib.kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
    ctypes.unsigned_short, // HANDLE
    ctypes.void_t.ptr, // LPTSTR
    ctypes.uint32_t, // DWORD
    ctypes.uint32_t // DWORD
);

function enumHandles() {
    var res = {};
    /*
    var _enumBufSize = new ctypes.unsigned_long(0x4000);
    var buffer = ctypes.char.array(_enumBufSize.value)();
    */
    
    var buffer = new SYSTEM_HANDLE_INFORMATION(); //ctypes.char.array(_enumBufSize.value)();
    var _enumBufSize = new ctypes.unsigned_long(buffer.constructor.size); //size when 1 element == 32. when 2 element == 60, 3 == 88// this is 32 - 4 / 4 == 7 fields. 60-4/4 == 14 fields
    console.log('buffer:', buffer)
    
    //var numFields = (32 - 4) / 7 / 4;
    
    //while (true) {
        var status = NtQuerySystemInformation(SystemHandleInformation, buffer.address(), _enumBufSize, _enumBufSize.address());
        //if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
        //    buffer = ctypes.char.array(_enumBufSize.value)();
        //} else break;
    //}
    console.log('status:', status.toString(), 'STATUS_BUFFER_TOO_SMALL:', status == STATUS_BUFFER_TOO_SMALL, 'STATUS_INFO_LENGTH_MISMATCH:', status == STATUS_INFO_LENGTH_MISMATCH);
    console.log('_enumBufSize:', _enumBufSize.value.toString());
    console.log('NumberOfHandles:', buffer.NumberOfHandles.toString());
    
    ////////// rep it
    SYSTEM_HANDLE_INFORMATION = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION', [
        {'NumberOfHandles': ctypes.unsigned_long},
        {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO, buffer.NumberOfHandles)}
    ]);
    
    var buffer = new SYSTEM_HANDLE_INFORMATION(); //ctypes.char.array(_enumBufSize.value)();
    var _enumBufSize = new ctypes.unsigned_long(buffer.constructor.size); //size when 1 element == 32. when 2 element == 60, 3 == 88// this is 32 - 4 / 4 == 7 fields. 60-4/4 == 14 fields
    console.log('buffer:', buffer)
    
    //var numFields = (32 - 4) / 7 / 4;
    
    //while (true) {
        var status = NtQuerySystemInformation(SystemHandleInformation, buffer.address(), _enumBufSize, _enumBufSize.address());
        //if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
        //    buffer = ctypes.char.array(_enumBufSize.value)();
        //} else break;
    //}
    console.log('status:', status.toString(), 'STATUS_BUFFER_TOO_SMALL:', status == STATUS_BUFFER_TOO_SMALL, 'STATUS_INFO_LENGTH_MISMATCH:', status == STATUS_INFO_LENGTH_MISMATCH);
    console.log('_enumBufSize:', _enumBufSize.value.toString());
    console.log('NumberOfHandles:', buffer.NumberOfHandles.toString());
    
    ///end rep
    
    if (status != 0) {
        console.error('failed getting handles, numbero of hadles must have changed between the two reps in order to fail and get here, status:', status.toString());
        return {};
    } else {
        console.info('succesfully got handles');
        console.log('Handles:', buffer.Handles);
        
        console.log('Handles[0]:', uneval(buffer.Handles[0]));
        console.log('Handles[1]:', uneval(buffer.Handles[1]));
        
        for (var i=0; i<buffer.NumberOfHandles; i++) {
            var UniqueProcessId = buffer.Handles[i].UniqueProcessId.toString();
            /*
            if (UniqueProcessId == 5020) {
                res
            }
            */
        }
    }    

    return res;
}

console.time('enumHandles');
var allHandles = enumHandles();
console.timeEnd('enumHandles');
console.log('enumHandles:', Object.keys(allHandles).length, allHandles);

for (var l in lib) {
  lib[l].close();
}