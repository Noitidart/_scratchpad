Cu.import('resource://gre/modules/ctypes.jsm');

var wintypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.bool;
	this.BYTE = ctypes.char;
	this.DWORD = ctypes.uint32_t; //this.DWORD = ctypes.unsigned_long;
	this.INT = ctypes.int;
	this.PVOID = ctypes.voidptr_t;
	this.RM_APP_TYPE = ctypes.unsigned_int;
	this.ULONG = ctypes.unsigned_long;
	this.UINT = ctypes.unsigned_int;
	this.USHORT = ctypes.unsigned_short;
	this.WCHAR = ctypes.jschar;
	
	// ADVANCED TYPES
	this.LPDWORD = this.DWORD.ptr;
	
	this.PCWSTR = new ctypes.PointerType(this.WCHAR);
	this.LPCWSTR = this.PCWSTR;
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms724284%28v=vs.85%29.aspx
	 * typedef struct _FILETIME {
	 *   DWORD dwLowDateTime;
	 *   DWORD dwHighDateTime;
	 * } FILETIME, *PFILETIME;
	 */
	this.FILETIME = ctypes.StructType('_FILETIME', [
	  { 'dwLowDateTime': this.DWORD },
	  { 'dwHighDateTime': this.DWORD }
	]);
	this.PFILETIME = this.FILETIME.ptr;
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373677%28v=vs.85%29.aspx
	 * typedef struct {
	 *   DWORD    dwProcessId;
	 *   FILETIME ProcessStartTime;
	 * } RM_UNIQUE_PROCESS, *PRM_UNIQUE_PROCESS;
	*/
	this.RM_UNIQUE_PROCESS = ctypes.StructType('RM_UNIQUE_PROCESS', [
	  { 'dwProcessId': this.DWORD },
	  { 'ProcessStartTime': this.FILETIME }
	]);
	this.PRM_UNIQUE_PROCESS = this.RM_UNIQUE_PROCESS.ptr;
	
	this.CCH_RM_MAX_APP_NAME = 255;
	this.CCH_RM_MAX_SVC_NAME = 63;
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373674%28v=vs.85%29.aspx
	 * typedef struct {
	 *   RM_UNIQUE_PROCESS Process;
	 *   WCHAR             strAppName[CCH_RM_MAX_APP_NAME+1];
	 *   WCHAR             strServiceShortName[CCH_RM_MAX_SVC_NAME+1];
	 *   RM_APP_TYPE       ApplicationType;
	 *   ULONG             AppStatus;
	 *   DWORD             TSSessionId;
	 *   BOOL              bRestartable;
	 * } RM_PROCESS_INFO;
	 */
	this.RM_PROCESS_INFO = ctypes.StructType('RM_PROCESS_INFO', [
	  { 'Process': this.RM_UNIQUE_PROCESS },
	  { 'strAppName': this.WCHAR.array(this.CCH_RM_MAX_APP_NAME + 1) }, // WCHAR of size [CCH_RM_MAX_APP_NAME+1]
	  { 'strServiceShortName': this.WCHAR.array(this.CCH_RM_MAX_SVC_NAME + 1) }, // WCHAR of size [CCH_RM_MAX_SVC_NAME+1]
	  { 'ApplicationType': this.RM_APP_TYPE }, // integer of RM_APP_TYPE
	  { 'AppStatus': this.ULONG }, // ULONG
	  { 'TSSessionId': this.DWORD }, // DWORD
	  { 'bRestartable': this.BOOL } // BOOL
	]);

	/* http://msdn.microsoft.com/en-us/library/ff718266.aspx
	 * typedef struct {
	 *   unsigned long Data1;
	 *   unsigned short Data2;
	 *   unsigned short Data3;
	 *   byte Data4[8];
	 * } GUID, UUID, *PGUID;
	 */
	this.GUID = ctypes.StructType('GUID', [
	  { 'Data1': this.ULONG },
	  { 'Data2': this.USHORT },
	  { 'Data3': this.USHORT },
	  { 'Data4': this.BYTE.array(8) }
	]);
	this.PGUID = this.GUID.ptr;
	
	// CONSTANTS
	this.NULL = ctypes.cast(ctypes.uint64_t(0x0), ctypes.voidptr_t);
	this.ERROR_SUCCESS = 0;
	this.ERROR_MORE_DATA = 234;
	this.RM_SESSION_KEY_LEN = this.GUID.size; //https://github.com/wine-mirror/wine/blob/c87901d3f8cebfb7d28b42718c1c78035730d6ce/include/restartmanager.h#L26
	this.CCH_RM_SESSION_KEY = this.RM_SESSION_KEY_LEN * 2; //https://github.com/wine-mirror/wine/blob/c87901d3f8cebfb7d28b42718c1c78035730d6ce/include/restartmanager.h#L27
	//console.log('CCH_RM_SESSION_KEY:', CCH_RM_SESSION_KEY)

	/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373670%28v=vs.85%29.aspx
	 * typedef enum  { 
	 *   RmUnknownApp   = 0,
	 *   RmMainWindow   = 1,
	 *   RmOtherWindow  = 2,
	 *   RmService      = 3,
	 *   RmExplorer     = 4,
	 *   RmConsole      = 5,
	 *   RmCritical     = 1000
	 * } RM_APP_TYPE;
	 */
	this.RmUnknownApp = 0;
	this.RmMainWindow = 1;
	this.RmOtherWindow = 2;
	this.RmService = 3;
	this.RmExplorer = 4;
	this.RmConsole = 5;
	this.RmCritical = 1000;
	
};
var ostypes = new wintypesInit();

// start - skeleton, shouldn't have to edit
var lib = {};
function _lib(path) {
	//ensures path is in lib, if its in lib then its open, if its not then it adds it to lib and opens it. returns lib
	//path is path to open library
	//returns lib so can use straight away

	if (!(path in lib)) {
		//need to open the library
		//default it opens the path, but some things are special like libc in mac is different then linux or like x11 needs to be located based on linux version
		switch (path) {
			default:
				try {
					lib[path] = ctypes.open(path);
				} catch (e) {
					console.error('Integration Level 1: Could not get open path:', path, 'e:' + e);
					throw new Error('Integration Level 1: Could not get open path:"' + path + '" e: "' + e + '"');
				}
		}
	}
	return lib[path];
}

var dec = {};
function _dec(declaration) { // it means ensureDeclared and return declare. if its not declared it declares it. else it returns the previously declared.
	if (!(declaration in dec)) {
		dec[declaration] = preDec[declaration](); //if declaration is not in preDec then dev messed up
	}
	return dec[declaration];
}
// end - skeleton, shouldn't have to edit

// start - predefine your declares here
var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev // do it alphabateized by key so its ez to look through
	RmStartSession: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373668%28v=vs.85%29.aspx
		 * DWORD WINAPI RmStartSession(
		 *   __out_       DWORD *pSessionHandle,
		 *   __reserved_  DWORD dwSessionFlags,
		 *   __out_       WCHAR strSessionKey[ ]
		 * );
		 */
		return _lib('Rstrtmgr.dll').declare('RmStartSession', ctypes.winapi_abi,
			ostypes.DWORD,		// return
			ostypes.DWORD.ptr,	// *pSessionHandle
			ostypes.DWORD,		// dwSessionFlags
			ostypes.WCHAR.ptr	// strSessionKey[ ] // ctypes.int16_t.ptr
		);
	},
	RmRegisterResources: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373663%28v=vs.85%29.aspx
		 * DWORD WINAPI RmRegisterResources(
		 *   __in_      DWORD dwSessionHandle,
		 *   __in_      UINT nFiles,
		 *   __in_opt_  LPCWSTR rgsFilenames[ ],
		 *   __in_      UINT nApplications,
		 *   __in_opt_  RM_UNIQUE_PROCESS rgApplications[ ],
		 *   __in_      UINT nServices,
		 *   __in_opt_  LPCWSTR rgsServiceNames[ ]
		 * );
		 */
		return _lib('Rstrtmgr.dll').declare('RmRegisterResources', ctypes.winapi_abi,
			ostypes.DWORD,					// return
			ostypes.DWORD,					// dwSessionHandle
			ostypes.UINT,					// nFiles
			ostypes.LPCWSTR.ptr,			// rgsFilenames[ ]
			ostypes.UINT,					// nApplications
			ostypes.RM_UNIQUE_PROCESS.ptr,	// rgApplications[ ]
			ostypes.UINT,					// nServices
			ostypes.LPCWSTR.ptr				// rgsServiceNames[ ]
		);
	},
	RmGetList: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373661%28v=vs.85%29.aspx
		 * DWORD WINAPI RmGetList(
		 *   __in_         DWORD dwSessionHandle,
		 *   __out_        UINT *pnProcInfoNeeded,
		 *   __inout_      UINT *pnProcInfo,
		 *   __inout_opt_  RM_PROCESS_INFO rgAffectedApps[ ],
		 *   __out_        LPDWORD lpdwRebootReasons
		 * );
		 */
		return _lib('Rstrtmgr.dll').declare('RmGetList', ctypes.winapi_abi,
			ostypes.DWORD, 					// return
			ostypes.DWORD,					// dwSessionHandle
			ostypes.UINT.ptr,				// *pnProcInfoNeeded
			ostypes.UINT.ptr,				// *pnProcInfo
			ostypes.RM_PROCESS_INFO.ptr,	// rgAffectedApps[ ]
			ostypes.LPDWORD					// lpdwRebootReasons
		);
	},
	RmEndSession: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373659%28v=vs.85%29.aspx
		 * DWORD WINAPI RmEndSession(
		 *   __in_       DWORD dwSessionHandle
		 * );
		 */
		return _lib('Rstrtmgr.dll').declare('RmEndSession', ctypes.winapi_abi,
			ostypes.DWORD,	// return
			ostypes.DWORD	// dwSessionHandle
		);
	}
}
// end - predefine your declares here

// start - helper functions
function memset(array, val, size) {
	/* http://stackoverflow.com/questions/24466228/memset-has-no-dll-so-how-ctype-it
	 * Note that size is the number of array elements to set, not the number of bytes.
	 */
	for (var i = 0; i < size; ++i) {
		array[i] = val;
	}
}
// end - helper functions

function shutdown() {
	
	// END SESSION
	if (dwSession) {
		var rez_RmEndSession = _dec('RmEndSession')(dwSession);
		console.info('rez_RmEndSession:', rez_RmEndSession, rez_RmEndSession.toString(), uneval(rez_RmEndSession));
		if (rez_RmEndSession != ostypes.ERROR_SUCCESS) {
			console.error('RmEndSession Failed with error code:', rez_RmEndSession);
			return;
		}
	}
	
	for (var l in lib) {
		lib[l].close();
	}
}

var dwSession;
function main() {
	//do code here
	// START SESSION
	dwSession = new ostypes.DWORD();
	
	/* Three methods to accomplish szSessionKey
	 * 1) var szSessionKey = new ctypes.ArrayType(ctypes.int16_t, CCH_RM_SESSION_KEY + 1)();
	 * 2) var szSessionKeyType = ctypes.ArrayType(ctypes.int16_t); //buffer type bufType
	 *    var szSessionKey = new szSessionKeyType(CCH_RM_SESSION_KEY + 1); //buffer
	 * 3) var szSessionKey = ctypes.int16_t.array(CCH_RM_SESSION_KEY + 1)(); //this is a buffer //im using this way right now
	 */
	var szSessionKey = ostypes.WCHAR.array(ostypes.CCH_RM_SESSION_KEY + 1)(); //this is a buffer
	console.info('INIT szSessionKey:', szSessionKey, szSessionKey.toString(), uneval(szSessionKey));
	
	memset(szSessionKey, '0', ostypes.CCH_RM_SESSION_KEY ); // remove + 1 as we want null terminated // can do memset(szSessionKey, ostypes.WCHAR('0'), ostypes.CCH_RM_SESSION_KEY + 1); // js-ctypes initializes at 0 filled: ctypes.char16_t.array(33)(["\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00", "\x00"])"
	console.info('PRE szSessionKey:', szSessionKey, szSessionKey.toString(), uneval(szSessionKey));
	
	var rez_RmStartSession = _dec('RmStartSession')(dwSession.address(), 0, szSessionKey);
	console.info('rez_RmStartSession:', rez_RmStartSession, rez_RmStartSession.toString(), uneval(rez_RmStartSession));
	console.info('POST szSessionKey:', szSessionKey, szSessionKey.toString(), uneval(szSessionKey));
	
	if (rez_RmStartSession != ostypes.ERROR_SUCCESS) {
		console.error('RmEndSession Failed with error code:', rez_RmStartSession);
		return;
	}
	console.info('dwSession:', dwSession, dwSession.toString(), uneval(dwSession));
	
	// REGISTER RESOURCES
	var jsStr_pszFilepath1 = OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock'); //path to file name
	var pszFilepath1 = ostypes.WCHAR.array()(jsStr_pszFilepath1); //creates null terminated c string, null terminated string is required for RmRegisterResources
	console.info('pszFilepath1:', pszFilepath1, pszFilepath1.toString(), uneval(pszFilepath1));
	
	var jsArr = [pszFilepath1];
	var pszFilepathsArr = ostypes.PCWSTR.array(/*no need, but can have it*//*jsArr.length*/)(jsArr); // when 2 it is: [ctypes.char16_t.ptr(ctypes.UInt64("0x0")), ctypes.char16_t.ptr(ctypes.UInt64("0x0"))]
	console.info('pszFilepathsArr:', pszFilepathsArr, pszFilepathsArr.toString(), uneval(pszFilepathsArr));
	
	var rez_RmRegisterResources = _dec('RmRegisterResources')(dwSession, jsArr.length, pszFilepathsArr, 0, null, 0, null);
	console.info('rez_RmRegisterResources:', rez_RmRegisterResources, rez_RmRegisterResources.toString(), uneval(rez_RmRegisterResources));
	
	if (rez_RmRegisterResources != ostypes.ERROR_SUCCESS) {
		console.error('RmRegisterResources Failed with error code:', rez_RmRegisterResources);
		return;
	}

	var nProcInfoNeeded = ostypes.UINT(0); // 0 to fetch
	var rgpi = null;
	var nProcInfo = ostypes.UINT(0); // this here is us telling how many array elements to fill, we initially provide null as rgpi so it has to be 0, otherwise it will probably crash asit will try to fill this number into null. after RmGetlist, it gets set to how many were actually filled
	var dwReason = ostypes.DWORD(0);
	
	console.info('INIT nProcInfoNeeded:', nProcInfoNeeded, nProcInfoNeeded.toString());
	console.info('INIT nProcInfo:', nProcInfo, nProcInfo.toString());
	
	var rez_RmGetList_Query = _dec('RmGetList')(dwSession, nProcInfoNeeded.address(), nProcInfo.address(), rgpi, dwReason.address());
	console.info('rez_RmGetList_Query:', rez_RmGetList_Query, rez_RmGetList_Query.toString(), uneval(rez_RmGetList_Query));	
	if (rez_RmGetList_Query == ostypes.ERROR_SUCCESS) {
		console.log('RmGetList succeeded but there are no processes on this so return, rez_RmGetList_Query:', rez_RmGetList_Query);
		return;
	} else if (rez_RmGetList_Query != ostypes.ERROR_MORE_DATA) {
		console.error('RmGetList failed, rez_RmGetList_Query:', rez_RmGetList_Query);
		return;		
	}
	
	console.info('POST nProcInfoNeeded:', nProcInfoNeeded, nProcInfoNeeded.toString());
	console.info('POST nProcInfo:', nProcInfo, nProcInfo.toString());
	console.info('POST dwReason:', dwReason, dwReason.toString());
	
	rgpi = ostypes.RM_PROCESS_INFO.array(nProcInfoNeeded.value)(); //alrady ptr so dont need to pass rgpi.ptr to RmGetList
	nProcInfo = ostypes.UINT(rgpi.length);
	
	console.info('RE-INIT nProcInfo:', nProcInfo, nProcInfo.toString());
	
	var rez_RmGetList_Fetch = _dec('RmGetList')(dwSession, nProcInfoNeeded.address(), nProcInfo.address(), rgpi, dwReason.address());
	console.info('rez_RmGetList_Fetch:', rez_RmGetList_Fetch, rez_RmGetList_Fetch.toString(), uneval(rez_RmGetList_Fetch));	
	
	if (rez_RmGetList_Fetch == ostypes.ERROR_MORE_DATA) {
		console.warn('RmGetList succeeded but found more/new processes using this file so you can opt to run RmGetList again with increased rgpi length and nProcInfo, rez_RmGetList_Fetch:', rez_RmGetList_Fetch);
	} else if (rez_RmGetList_Fetch != ostypes.ERROR_SUCCESS) {
		// i should be weary though, say 10 processes were using the file on RmGetList_Query, but on this run none of those are any longer using it, then nProcInfoNeeded will be less than what it was before
		console.error('RmGetList failed, rez_RmGetList_Fetch:', rez_RmGetList_Fetch);
		return;
	}
	
	if (rez_RmGetList_Fetch != ostypes.ERROR_SUCCESS) {
		if (rez_RmGetList_Fetch == ostypes.ERROR_MORE_DATA) {
			console.warn('RmGetList found that since last RmGetList there is now new/more processes available, so you can opt to run again');
		} else {
			console.error('RmGetList Failed with error code:', rez_RmGetList_Fetch);
			return;
		}
	}
	
	console.info('FINAL nProcInfoNeeded:', nProcInfoNeeded, nProcInfoNeeded.toString());
	console.info('FINAL nProcInfo:', nProcInfo, nProcInfo.toString());
	console.info('FINAL dwReason:', dwReason, dwReason.toString());
	console.info('FINAL rgpi:', rgpi, rgpi.toString());
	
	// END SESSION
	// moved to shutdown
}

try {
	main();
} catch(ex) {
	console.error('main() caught:', ex);
} finally {
	shutdown();
}