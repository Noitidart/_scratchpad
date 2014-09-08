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
{'UniqueProcessId': ctypes.uint32_t}, //USHORT dwPid; //UniqueProcessId
{'CreatorBackTraceIndex': ctypes.uint32_t}, //USHORT CreatorBackTraceIndex; //CreatorBackTraceIndex
{'ObjectTypeIndex': ctypes.uint32_t}, //BYTE ObjType; //ObjectTypeIndex UCHAR
{'HandleAttributes': ctypes.uint32_t}, //BYTE HandleAttributes; //im not sure if byte should be unsigned_long, maybe unsigned_char //HandleAttributes UCHAR
{'HandleValue': ctypes.uint32_t}, //USHORT HndlOffset; //HandleValue USHORT
{'Object': ctypes.uint32_t}, //DWORD dwKeObject; //Object PVOID
{'GrantedAccess': ctypes.uint32_t} //ULONG GrantedAccess; //GrantedAccess ULONG
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
        //var sub2 = ctypes.cast(buffer.addressOfElement(0), SYSTEM_HANDLE_INFORMATION.ptr).contents;
      console.log('heeeeere:', (buffer.addressOfElement(1).contents.addressOfElement(i)));
		break;
        var pid = proc.Handles[i].UniqueProcessId.toString();
        
        //if (proc.Handles[i].UniqueProcessId != thePID) {
        if (pid != thePID) {
            continue;
        }

         //var pid = proc.Handles[i].UniqueProcessId.toString();
        var handleVal = proc.Handles[i].HandleValue.toString();
		//var objVal = proc.Handles[i].Object.toString();
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


function cValConv(v) {
	if (v == null) return null;
	if (typeof v == "number") return v;
	if (v instanceof ctypes.jschar.ptr || v instanceof ctypes.char.ptr)
		return v.isNull() ? "" : v.readString();
	if (v instanceof UNICODE_STRING)
		return v.Buffer.isNull() ? "" : v.Buffer.readString();
	if (v instanceof ctypes.UInt64 || v instanceof ctypes.Int64)
		return parseInt(v);
	var constr = v.constructor.toString();
	if (constr.match(/\*$/)) return v.toString().match(/0x[0-9a-f]+/i)[0];
	if (constr.match(/(char|jschar)\[\d+\]$/)) return v.readString();
	if (constr.match(/\[\d+\]$/) && typeof v.length != 'undefined') {
		var arr = [];
		for (var i = 0; i < v.length; i++) arr[i] = cValConv(v[i]);
		return arr;
	}
	var obj = {},
		prop = null;
	for (prop in v) obj[prop] = cValConv(v[prop]);
	if (prop != null) return obj;
	return v.toString();
}


var myPid = pidOfThisFF().toString();
console.log('myPid:', myPid);

var allHandlesOfThisFF = enumHandlesOfPid(myPid);
console.log('enumHandles:', allHandlesOfThisFF);


// NOT SUPPORTED BY WINXP
var GetFinalPathNameByHandle = lib.kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
ctypes.uint32_t, // HANDLE
ctypes.jschar.ptr, // LPTSTR
ctypes.uint32_t, // DWORD
ctypes.uint32_t // DWORD
);
//SYSTEM_HANDLE_TABLE_ENTRY_INFO(6588, 786435, 82138464, 3, 6588, 1048604, 225155216)"
var bufType = ctypes.ArrayType(ctypes.jschar);
var buffer = new bufType(256);
//var ret = GetFinalPathNameByHandle(524291, buffer, buffer.length, 0);
//Services.ww.activeWindow.alert('ret:' + ret + '\n' + 'buffer:' + buffer.readString()) //always just a " " no idea why

for (var i=0; i<allHandlesOfThisFF.length; i++) {
  console.log(GetFinalPathNameByHandle(parseInt(allHandlesOfThisFF[i]), buffer, buffer.length, 0));
}

for (var l in lib) {
  lib[l].close();
}