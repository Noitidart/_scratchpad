Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
    ntdll: ctypes.open('ntdll.dll'),
    kernel32: ctypes.open('kernel32.dll'),
}

//HANDLE WINAPI GetCurrentProcess(void);
var GetCurrentProcess = lib.kernel32.declare("GetCurrentProcess", ctypes.winapi_abi, ctypes.voidptr_t);

//DWORD WINAPI GetCurrentProcessId(void);
var GetCurrentProcessId = lib.kernel32.declare("GetCurrentProcessId", ctypes.winapi_abi, ctypes.uint32_t);

var currentProcessID = GetCurrentProcessId();
console.log('currentProcessID:', currentProcessID);


var OpenProcess = lib.kernel32.declare("OpenProcess",
ctypes.winapi_abi,
ctypes.voidptr_t, // return // HANDLE
ctypes.uint32_t, // dwDesiredAccess
ctypes.bool, // bInheritHandle
ctypes.uint32_t); // dwProcessId

var PROCESS_DUP_HANDLE = 0x0040;
var PROCESS_QUERY_INFORMATION = 0x0400;
var MAXIMUM_ALLOWED = 0x02000000;

var currentProcessHandle = GetCurrentProcess();
console.log('currentProcessHandle:', currentProcessHandle);

//var currentProcessHandle = OpenProcess(PROCESS_DUP_HANDLE, false, currentProcessID);
//console.log('currentProcessHandle:', currentProcessHandle);

var CloseHandle = lib.kernel32.declare( "CloseHandle", ctypes.winapi_abi, ctypes.int32_t, //bool // return type: 1 indicates success, 0 failure
    ctypes.voidptr_t // in: hObject
);

 /*
BOOL WINAPI DuplicateHandle(
__in HANDLE hSourceProcessHandle,
__in HANDLE hSourceHandle,
__in HANDLE hTargetProcessHandle,
__out LPHANDLE lpTargetHandle,
__in DWORD dwDesiredAccess,
__in BOOL bInheritHandle,
__in DWORD dwOptions
);
*/
var DuplicateHandle = lib.kernel32.declare("DuplicateHandle",
ctypes.winapi_abi,
ctypes.bool,
ctypes.voidptr_t,
ctypes.voidptr_t,
ctypes.voidptr_t,
ctypes.voidptr_t.ptr,
ctypes.uint32_t,
ctypes.bool,
ctypes.uint32_t
);

var DUPLICATE_SAME_ACCESS = 0x00000002;

var STATUS_BUFFER_TOO_SMALL = 0xC0000023>>0;
var STATUS_INFO_LENGTH_MISMATCH = 0xC0000004>>0;
var SystemHandleInformation = 16;
var SystemExtendedHandleInformation = 64;

var UNICODE_STRING = new ctypes.StructType("UNICODE_STRING", [
    {'Length': ctypes.unsigned_short}, //USHORT
    {'MaximumLength': ctypes.unsigned_short}, //USHORT
    {'Buffer': ctypes.jschar.ptr}
]); //PWSTR  

/* D:\SONY VAIO\Documents and Settings\SONY VAIO\My Documents\_Downloads\EnTeHandle\myntdll.h L#60
 * typedef struct _TagHANDLEINFO
{
	USHORT dwPid;
	USHORT CreatorBackTraceIndex;
	BYTE   ObjType;
	BYTE   HandleAttributes;
	USHORT HndlOffset;
	DWORD dwKeObject;
	ULONG GrantedAccess;
}HANDLEINFO, PHANDLEINFO;
 */
//https://github.com/tjguk/winsys/blob/5f11b308171382046ff0f67ef3129e47e9fee06c/random/file_handles.py#L100
var SYSTEM_HANDLE_TABLE_ENTRY_INFO = new ctypes.StructType('SYSTEM_HANDLE_TABLE_ENTRY_INFO', [ //typedef struct _TagHANDLEINFO
    {'UniqueProcessId': ctypes.unsigned_short}, //USHORT dwPid; //UniqueProcessId
    {'CreatorBackTraceIndex': ctypes.unsigned_short}, //USHORT CreatorBackTraceIndex; //CreatorBackTraceIndex
    {'ObjectTypeIndex': ctypes.unsigned_char}, //BYTE ObjType; //ObjectTypeIndex UCHAR
    {'HandleAttributes': ctypes.unsigned_char}, //BYTE HandleAttributes; //im not sure if byte should be unsigned_long, maybe unsigned_char //HandleAttributes UCHAR
    {'HandleValue': ctypes.unsigned_short}, //USHORT HndlOffset; //HandleValue USHORT
    {'Object': ctypes.voidptr_t}, //DWORD dwKeObject; //Object PVOID
    {'GrantedAccess': ctypes.unsigned_long} //ULONG GrantedAccess; //GrantedAccess ULONG
]); //HANDLEINFO, PHANDLEINFO;

var HANDLE_TYPE_FILE = 3; //https://github.com/jmalak/open-watcom/blob/44578857e167ef4b13f2c866fc9887b47925dccd/bld/clib/handleio/c/filerdu.c#L60

var SYSTEM_HANDLE_INFORMATION = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION', [
    {'NumberOfHandles': ctypes.unsigned_long},
    {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO, 1)}
]);

//http://processhacker.sourceforge.net/doc/struct___s_y_s_t_e_m___h_a_n_d_l_e___t_a_b_l_e___e_n_t_r_y___i_n_f_o___e_x.html
var SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX = new ctypes.StructType('SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX', [ //typedef struct _TagHANDLEINFO
    {'Object': ctypes.voidptr_t},
    {'UniqueProcessId': ctypes.unsigned_long},
    {'HandleValue': ctypes.unsigned_long},
    {'GrantedAccess': ctypes.unsigned_long},
    {'CreatorBackTraceIndex': ctypes.unsigned_short},
    {'HandleAttributes': ctypes.unsigned_long},
    {'Reserved': ctypes.unsigned_long}
]);

var SYSTEM_HANDLE_INFORMATION_EX = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION_EX', [
    {'NumberOfHandles': ctypes.unsigned_long},
    {'Reserved': ctypes.unsigned_long},
    {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX, 1)}
]);

var NtQuerySystemInformation = lib.ntdll.declare("NtQuerySystemInformation", ctypes.winapi_abi, ctypes.long, // return //NTSTATUS 
    ctypes.int, // SystemInformationClass //SYSTEM_INFORMATION_CLASS
    ctypes.void_t.ptr, // SystemInformation //PVOID 
    ctypes.unsigned_long, // SystemInformationLength //ULONG 
    ctypes.unsigned_long.ptr
); // ReturnLength //PULONG 

/* http://msdn.microsoft.com/en-us/library/windows/hardware/ff545817%28v=vs.85%29.aspx
 * typedef struct _FILE_NAME_INFORMATION {
 * ULONG FileNameLength;
 * WCHAR FileName[1];
 * } FILE_NAME_INFORMATION, *PFILE_NAME_INFORMATION;
 */
var struct_FILE_NAME_INFORMATION = ctypes.StructType('_FILE_NAME_INFORMATION', [
    {'FileNameLength': ctypes.unsigned_long},
    {'FileName': ctypes.ArrayType(ctypes.jschar, OS.Constants.Win.MAX_PATH)}
]);

/* http://msdn.microsoft.com/en-us/library/windows/hardware/ff550671%28v=vs.85%29.aspx
 * typedef struct _IO_STATUS_BLOCK {
 *   union {
 *     NTSTATUS Status;
 *     PVOID    Pointer;
 *   };
 *   ULONG_PTR Information;
 * } IO_STATUS_BLOCK, *PIO_STATUS_BLOCK;;
 */
var struct_IO_STATUS_BLOCK = ctypes.StructType('_IO_STATUS_BLOCK', [
    {'Status': ctypes.long}, // NTSTATUS //union not supported, but i know im going to be using Status so forget the `PVOID Pointer` the doc page says Re: `PVOID Pointer`: "Reserved. For internal use only."
    {'Information': ctypes.unsigned_long.ptr}
]); //IO_STATUS_BLOCK, *PIO_STATUS_BLOCK;

var FileNameInformation = 9; //https://github.com/dezelin/kBuild/blob/1046ac4032f3b455d251067f46083435ce18d9ad/src/kmk/w32/tstFileInfo.c#L40 //http://msdn.microsoft.com/en-us/library/cc232099.aspx //constant for 5th arg of NtQueryInformationFile: `__in_   FILE_INFORMATION_CLASS FileInformationClass`

/* http://msdn.microsoft.com/en-us/library/windows/hardware/ff556646%28v=vs.85%29.aspx --> http://msdn.microsoft.com/en-us/library/windows/hardware/ff567052%28v=vs.85%29.aspx
 * NTSTATUS ZwQueryInformationFile(
 * __in_   HANDLE FileHandle,
 * __out_  PIO_STATUS_BLOCK IoStatusBlock
 * __out_  PVOID FileInformation,
 * __in_   ULONG Length,
 * __in_   FILE_INFORMATION_CLASS FileInformationClass
 * );
 */
var NtQueryInformationFile = lib.ntdll.declare('NtQueryInformationFile', ctypes.winapi_abi, ctypes.long, // return //NTSTATUS 
    ctypes.voidptr_t, // HANDLE //i made ushort just cuz thats what handle_entry_info has for HandleValue
    struct_IO_STATUS_BLOCK.ptr, // IO_STATUS_BLOCK
    ctypes.void_t.ptr, // PVOID //copied style of NtQuerySystemInformation for second arg where they can pass in any structure //but everyone else makes PVOID ctypes.voidptr_t like this: `ctypes.voidptr_t, // PVOID`
    ctypes.unsigned_long, // ULONG
    ctypes.uint32_t // dword based on here https://github.com/fabioz/PyDev.Debugger/blob/bec51edbfedc46a299490d56ab266689dcc89778/pydevd_attach_to_process/winappdbg/win32/ntdll.py#L517 // im guessing its an int //copied style of NtQuerySystemInformation for second arg where they can pass in any structure //but everyone else makes PVOID ctypes.voidptr_t like this: `ctypes.voidptr_t, // PVOID`
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa364962%28v=vs.85%29.aspx
* DWORD WINAPI GetFinalPathNameByHandle(
* __in_   HANDLE hFile,
* __out_  LPTSTR lpszFilePath,
* __in_   DWORD cchFilePath,
* __in_   DWORD dwFlags
* );
*/
// NOT SUPPORTED BY WINXP so just doing this to test and then later will figure out how to get handle to path name then look in here
/*
var GetFinalPathNameByHandle = lib.kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
    ctypes.voidptr_t, // HANDLE //i made ushort just cuz thats what handle_entry_info has for HandleValue
    ctypes.void_t.ptr, // LPTSTR
    ctypes.uint32_t, // DWORD
    ctypes.uint32_t // DWORD
);
*/

function enumHandles() {
    
    //return {};
    var res = {};
    
    var system_handle_info_ex = SYSTEM_HANDLE_INFORMATION_EX(); //ctypes.char.array(_enumBufSize.value)();
    var _enumBufSize = new ctypes.unsigned_long(system_handle_info_ex.constructor.size); //size when 1 element == 32. when 2 element == 60, 3 == 88// this is 32 - 4 / 4 == 7 fields. 60-4/4 == 14 fields
    //console.log('system_handle_info:', system_handle_info)
    
    //var numFields = (32 - 4) / 7 / 4;
    
    //while (true) {
        var status = NtQuerySystemInformation(SystemExtendedHandleInformation, system_handle_info_ex.address(), _enumBufSize, _enumBufSize.address());
        //if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
        //    system_handle_info = ctypes.char.array(_enumBufSize.value)();
        //} else break;
    //}
    //console.log('status:', status.toString(), 'STATUS_BUFFER_TOO_SMALL:', status == STATUS_BUFFER_TOO_SMALL, 'STATUS_INFO_LENGTH_MISMATCH:', status == STATUS_INFO_LENGTH_MISMATCH);
    //console.log('_enumBufSize:', _enumBufSize.value.toString());
    //console.log('system_handle_info_ex.NumberOfHandles:', system_handle_info_ex.NumberOfHandles.toString())
    var parsedNum = parseInt(system_handle_info_ex.NumberOfHandles); //this should at least avoid that error when system_handle_info.NumberOfHandles changes to larger on os but when i created the array it was less so it will throw `invalid index` //this also seriously speeds up the for loop. it went from average of 250ms to 130ms
    console.log('NumberOfHandles:', parsedNum);
    
    ////////// rep it
    SYSTEM_HANDLE_INFORMATION_EX = new ctypes.StructType('SYSTEM_HANDLE_INFORMATION_EX', [
        {'NumberOfHandles': ctypes.unsigned_long},
        {'Reserved': ctypes.unsigned_long},
        {'Handles': ctypes.ArrayType(SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX, parsedNum)}
    ]);
    
    var system_handle_info_ex = SYSTEM_HANDLE_INFORMATION_EX(); //ctypes.char.array(_enumBufSize.value)();
    var _enumBufSize = new ctypes.unsigned_long(system_handle_info_ex.constructor.size); //size when 1 element == 32. when 2 element == 60, 3 == 88// this is 32 - 4 / 4 == 7 fields. 60-4/4 == 14 fields
    //console.log('system_handle_info:', system_handle_info)
    
    //var numFields = (32 - 4) / 7 / 4;
    
    //while (true) {
        var status = NtQuerySystemInformation(SystemExtendedHandleInformation, system_handle_info_ex.address(), _enumBufSize, _enumBufSize.address());
        //if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
        //    system_handle_info = ctypes.char.array(_enumBufSize.value)();
        //} else break;
    //}
    //console.log('status:', status.toString(), 'STATUS_BUFFER_TOO_SMALL:', status == STATUS_BUFFER_TOO_SMALL, 'STATUS_INFO_LENGTH_MISMATCH:', status == STATUS_INFO_LENGTH_MISMATCH);
    //console.log('_enumBufSize:', _enumBufSize.value.toString());
    //console.log('NumberOfHandles:', system_handle_info.NumberOfHandles.toString());
    
    ///end rep
    
    if (status != 0) {
        console.warn('even more handles available now but not liekly the parent.lock as in like absolutely 0% chance they are the parent.lock, numbero of hadles must have changed between the two reps in order to fail and get here, status:', status.toString());
    }
    var isb;
    var fni;
        
        for (var i=0; i<parsedNum; i++) {
            try {
                var UniqueProcessId = system_handle_info_ex.Handles[i].UniqueProcessId.toString();
            } catch (ex) {
                if (ex.message == 'invalid index') {
                    console.warn('i:', i, 'ex:', ex);
                    console.warn('this usually happens towards end when i think NumberOfHandles changes, so I think maybe I should test if system_handle_info.NumberOfHandles > str value of NumberOfHandles at start, then quit', 'system_handle_info.NumberOfHandles:', system_handle_info.NumberOfHandles.toString()); //cuz handles arre changing by about 100 every second or so it seems //so keep in mind the handles can also reduce so i can have handles that no longer exist by time loop is up, this is becuase loop takes couple hundred ms //and also because the system_handle_info values are live they change as handles change
                    break;
                } else {
                    console.error('i:', i, 'ex:', ex);
                    throw ex;
                }
               //throw ex;
            }
            //verified that number of processes matches task manager by not targeting specific UniqueProcessId
            if (UniqueProcessId in pidsToCollectHandlesFor) {
                    if (system_handle_info_ex.Handles[i].UniqueProcessId != currentProcessID) {
                        //need to duplicate handle
                        var useHandle = ctypes.voidptr_t();
                        var duped = DuplicateHandle(pidsToCollectHandlesFor[UniqueProcessId], ctypes.voidptr_t(system_handle_info_ex.Handles[i].HandleValue), currentProcessHandle, useHandle.address(), 0, false, DUPLICATE_SAME_ACCESS);
                        if (!duped) {
                            continue;
                            //console.warn('failed to dupe handle of id:', UniqueProcessId, 'winLastError:', ctypes.winLastError, 'useHandle:', useHandle.toString());
                            //break;
                        } else {
                            //console.log('suc dup, useHandle:', useHandle);
                        }
                    } else {
                       var useHandle = ctypes.voidptr_t(system_handle_info_ex.Handles[i].HandleValue);
                    }
                    //var gfpnbh_bufType = ctypes.ArrayType(ctypes.jschar);
                    //var gfpnbh_buffer = new gfpnbh_bufType(1024);
                    //GetFinalPathNameByHandle(useHandle, gfpnbh_buffer, gfpnbh_buffer.length, 0);
                    isb = struct_IO_STATUS_BLOCK();
                    fni = struct_FILE_NAME_INFORMATION();
                    var rez = NtQueryInformationFile(useHandle, isb.address(), fni.address(), fni.addressOfField('FileName').contents.constructor.size, FileNameInformation);
                //console.log('gfpnbh_buffer:', gfpnbh_buffer.readString());
                if (rez == -2147483643) {
                    console.warn('status buffer overlfow');
                    //increase size of buffer `fni.addressOfField('FileName').length` to `fni.FileNameLength / 2` //cant do this as of now as the second field is hardcoded in the structure as length of 260
                    //var rez = NtQueryInformationFile(system_handle_info.Handles[i].HandleValue, isb.address(), fni.address(), fni.addressOfField('FileName').contents.constructor.size, FileNameInformation);
                }
                if (rez == 0) { //-2147483643 == STATUS_BUFFER_OVERFLOW
                    //ok now re-NtQueryInfoFile to get the accurate handle name with duped handle
                    //console.log('rez0:', fni.FileName.readString());

                    
                    if (!(UniqueProcessId in res)) {
                        res[UniqueProcessId] = [];
                    }
                    //gfpnbh //res[UniqueProcessId][GrantedAccess].push(gfpnbh_buffer.readString());
                    //res[UniqueProcessId].push(fni.FileName.readString() + ' | ' + gfpnbh_buffer.readString());
                    res[UniqueProcessId].push(fni.FileName.readString());
                }
                if (duped) {
                    duped = false;
                   var rezClose = CloseHandle(useHandle);
                    if (rezClose) {
                       //console.log('closed');
                    } else {
                        console.warn('FAILED TO CLOSE')
                    }
                } else {
                    //console.log(' no need close')
                }
            }
        }
    
    
    return res;
}

console.time('enumHandles');
//pidsToCollectHandlesFor is a list of pids we want with the opened process handle. if specific own pid then no need for specifing value on it of opened handle
var pidsToCollectHandlesFor = {
    '7680': 0, //pid of firefox that you are not running this code from
    '12512': 0
}
for (var p in pidsToCollectHandlesFor) {
    if (p != currentProcessID) {
        ctypes.winLastError = 0;
       pidsToCollectHandlesFor[p] = OpenProcess(PROCESS_DUP_HANDLE | PROCESS_QUERY_INFORMATION, false, parseInt(p));
        if (ctypes.winLastError > 0) {
            console.error('error opening process for pid:', p);
            pidsToCollectHandlesFor[p] = 0; //so it skips on closing
        }
    }
}
//console.log('ctypes.winLastError:', ctypes.winLastError);
var allHandles = enumHandles();
for (var p in pidsToCollectHandlesFor) {
    if (pidsToCollectHandlesFor[p] !== 0) { //if (p != currentProcessID) { //changed to check if not !== 0 so this way it will close the ones that opened. and any that failed will obviously be 0 so it wont close that
       var rez = CloseHandle(pidsToCollectHandlesFor[p]);
        if (!rez) {
            console.error('failed closing handle for pid:', p);
        } else {
            console.log('suc close on pid:', p);
        }
    }
}
console.timeEnd('enumHandles');
console.log('enumHandles:', Object.keys(allHandles).length, allHandles);

for (var l in lib) {
  lib[l].close();
}