Cu.import("resource://gre/modules/ctypes.jsm"); 
var lib_ntdll = ctypes.open("ntdll.dll");
var lib_kernel32 = ctypes.open("kernel32.dll");

var _pPID = null;
var STATUS_BUFFER_TOO_SMALL = 0xC0000023>>0;
var STATUS_INFO_LENGTH_MISMATCH = 0xC0000004>>0;
var SystemProcessInformation = 5;
var SystemBasicInformation = 0;
var SystemProcessorPerformanceInformation = 8;
var SYSTEM_IDLE_PROCESS_ID = 0;

var UNICODE_STRING = new ctypes.StructType("UNICODE_STRING", [
{'Length': ctypes.unsigned_short},
{'MaximumLength': ctypes.unsigned_short},
{'Buffer': ctypes.jschar.ptr} ]);

var SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION = new ctypes.StructType("SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION", [
{'IdleTime': ctypes.long_long},
{'KernelTime': ctypes.long_long},
{'UserTime': ctypes.long_long},
{'DpcTime': ctypes.long_long},
{'InterruptTime': ctypes.long_long},
{'InterruptCount': ctypes.unsigned_long} ]);

var SYSTEM_PROCESS_INFORMATION = new ctypes.StructType("SYSTEM_PROCESS_INFORMATION", [
{'NextEntryOffset': ctypes.unsigned_long},
{'NumberOfThreads': ctypes.unsigned_long},
{'WorkingSetPrivateSize': ctypes.long_long},
{'HardFaultCount': ctypes.unsigned_long},
{'NumberOfThreadsHighWatermark': ctypes.unsigned_long},
{'CycleTime': ctypes.unsigned_long_long},
{'CreateTime': ctypes.long_long},
{'UserTime': ctypes.long_long},
{'KernelTime': ctypes.long_long},
{'ImageName': UNICODE_STRING},
{'BasePriority': ctypes.long},
{'UniqueProcessId': ctypes.unsigned_long},
{'InheritedFromUniqueProcessId': ctypes.unsigned_long},
{'HandleCount': ctypes.unsigned_long},
{'SessionId': ctypes.unsigned_long},
{'UniqueProcessKey': ctypes.unsigned_long},
{'PeakVirtualSize': ctypes.size_t},
{'VirtualSize': ctypes.size_t},
{'PageFaultCount': ctypes.unsigned_long},
{'PeakWorkingSetSize': ctypes.size_t},
{'WorkingSetSize': ctypes.size_t},
{'QuotaPeakPagedPoolUsage': ctypes.size_t},
{'QuotaPagedPoolUsage': ctypes.size_t},
{'QuotaPeakNonPagedPoolUsage': ctypes.size_t},
{'QuotaNonPagedPoolUsage': ctypes.size_t},
{'PagefileUsage': ctypes.size_t},
{'PeakPagefileUsage': ctypes.size_t},
{'PrivatePageCount': ctypes.size_t},
{'ReadOperationCount': ctypes.long_long},
{'WriteOperationCount': ctypes.long_long},
{'OtherOperationCount': ctypes.long_long},
{'ReadTransferCount': ctypes.long_long},
{'WriteTransferCount': ctypes.long_long},
{'OtherTransferCount': ctypes.long_long} ]);

var SYSTEM_BASIC_INFORMATION = new ctypes.StructType("SYSTEM_BASIC_INFORMATION", [
{'Reserved': ctypes.unsigned_long},
{'TimerResolution': ctypes.unsigned_long},
{'PageSize': ctypes.unsigned_long},
{'NumberOfPhysicalPages': ctypes.unsigned_long},
{'LowestPhysicalPageNumber': ctypes.unsigned_long},
{'HighestPhysicalPageNumber': ctypes.unsigned_long},
{'AllocationGranularity': ctypes.unsigned_long},
{'MinimumUserModeAddress': ctypes.unsigned_long.ptr},
{'MaximumUserModeAddress': ctypes.unsigned_long.ptr},
{'ActiveProcessorsAffinityMask': ctypes.unsigned_long.ptr},
{'NumberOfProcessors': ctypes.char} ]);

var NtQuerySystemInformation = lib_ntdll.declare("NtQuerySystemInformation",
ctypes.winapi_abi,
ctypes.long, // return
ctypes.int, // SystemInformationClass
ctypes.void_t.ptr, // SystemInformation
ctypes.unsigned_long, // SystemInformationLength
ctypes.unsigned_long.ptr); // ReturnLength


var GetCurrentProcessId = lib_kernel32.declare("GetCurrentProcessId",
ctypes.winapi_abi,
ctypes.uint32_t); // return
function enumProcesses() {
	var res = {};
	var _enumBufSize = new ctypes.unsigned_long(0x4000);
	var buffer = ctypes.char.array(_enumBufSize.value)();

	while (true) {
		var status = NtQuerySystemInformation(SystemProcessInformation, buffer,
			_enumBufSize, _enumBufSize.address());
		if (status == STATUS_BUFFER_TOO_SMALL || status == STATUS_INFO_LENGTH_MISMATCH) {
			buffer = ctypes.char.array(_enumBufSize.value)();
		} else break;
	}

	if (status < 0) return null;
	var i = 0;
	var time = new Date().getTime();
	var processor = getProcessorCounters();
	while (true) {
		var proc = ctypes.cast(buffer.addressOfElement(i), SYSTEM_PROCESS_INFORMATION.ptr).contents;
		pid = cValConv(proc.UniqueProcessId);
		var pinfo = cValConv(proc);
		pinfo.IOCount = pinfo.ReadOperationCount + pinfo.WriteOperationCount + pinfo.OtherOperationCount;
		pinfo.IOTransfer = pinfo.ReadTransferCount + pinfo.WriteTransferCount + pinfo.OtherTransferCount;
		if (pid == SYSTEM_IDLE_PROCESS_ID)
			pinfo.KernelTime = processor.IdleTime;
		pinfo.CPUTime = pinfo.UserTime + pinfo.KernelTime;
		pinfo.CurrentProcess = (curPID() == pid) || (pinfo.InheritedFromUniqueProcessId == curPID());
		pinfo.Uptime = (time - (pinfo.CreateTime - 116444736000000000) / 10000).toFixed();
		res[pid] = pinfo;
		if (proc.NextEntryOffset == 0) break;
		i += parseInt(proc.NextEntryOffset);
	}
	var pi = cValConv(new SYSTEM_PROCESS_INFORMATION());
	pi.CPUTime = pi.KernelTime = (processor.InterruptTime + processor.DpcTime);
	pi.IOCount = pi.IOTransfer = pi.Uptime = 0;
	pi.CurrentProcess = false;
	pi.UniqueProcessId = -1;
	pi.ImageName = "Interrupts";
	res[-1] = pi;
	_devPrefixes = null;
	return res;
}

function getProcessorCounters() {
	var res = {};
	var numProcessors = getBasicInfo().NumberOfProcessors;
	var buffer = SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION.array(numProcessors)();
	var status = NtQuerySystemInformation(SystemProcessorPerformanceInformation, buffer,
		SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION.size * numProcessors, null);
	if (status < 0) return null;
	for (var pn in buffer[0]) {
		res[pn] = 0;
		for (var i = 0; i < numProcessors; i++)
			res[pn] += parseInt(buffer[i][pn]);
	}
	return res;
}

function getBasicInfo() {
	var sysInfo = new SYSTEM_BASIC_INFORMATION();
	var status = NtQuerySystemInformation(SystemBasicInformation, sysInfo.address(),
		SYSTEM_BASIC_INFORMATION.size, null);
	if (status < 0) return null;
	return cValConv(sysInfo);
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

function curPID() {
	if (!_pPID) _pPID = GetCurrentProcessId();
	return _pPID;
}

console.log('enumProcesses:', enumProcesses());

lib_ntdll.close();
lib_kernel32.close();