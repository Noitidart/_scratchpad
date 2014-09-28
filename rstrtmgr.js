Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  rstrtmgr: ctypes.open('Rstrtmgr.dll')
}

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373670%28v=vs.85%29.aspx
typedef enum  { 
  RmUnknownApp   = 0,
  RmMainWindow   = 1,
  RmOtherWindow  = 2,
  RmService      = 3,
  RmExplorer     = 4,
  RmConsole      = 5,
  RmCritical     = 1000
} RM_APP_TYPE;
*/
var RM_APP_TYPE = {
  RmUnknownApp: 0,
  RmMainWindow: 1,
  RmOtherWindow: 2,
  RmService: 3,
  RmExplorer: 4,
  RmConsole: 5,
  RmCritical: 1000
};

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms724284%28v=vs.85%29.aspx
typedef struct _FILETIME {
  DWORD dwLowDateTime;
  DWORD dwHighDateTime;
} FILETIME, *PFILETIME;
*/
var struct_FILETIME = ctypes.StructType('_FILETIME', [
  {'dwLowDateTime': ctypes.uint32_t}, // DWORD
  {'dwHighDateTime': ctypes.uint32_t} // DWORD
]);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373677%28v=vs.85%29.aspx
typedef struct {
  DWORD    dwProcessId;
  FILETIME ProcessStartTime;
} RM_UNIQUE_PROCESS, *PRM_UNIQUE_PROCESS;
*/
var struct_RM_UNIQUE_PROCESS = ctypes.StructType('RM_UNIQUE_PROCESS', [
  {'dwProcessId': ctypes.uint32_t}, // DWORD
  {'ProcessStartTime': struct_FILETIME}
]);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373674%28v=vs.85%29.aspx
typedef struct {
  RM_UNIQUE_PROCESS Process;
  WCHAR             strAppName[CCH_RM_MAX_APP_NAME+1];
  WCHAR             strServiceShortName[CCH_RM_MAX_SVC_NAME+1];
  RM_APP_TYPE       ApplicationType;
  ULONG             AppStatus;
  DWORD             TSSessionId;
  BOOL              bRestartable;
} RM_PROCESS_INFO;
*/
var struct_RM_PROCESS_INFO = ctypes.StructType('RM_PROCESS_INFO', [
  {'Process': struct_RM_UNIQUE_PROCESS},
  {'strAppName': ctypes.unsigned_short}, // WCHAR of size [CCH_RM_MAX_APP_NAME+1]
  {'strServiceShortName': ctypes.unsigned_short}, // WCHAR of size [CCH_RM_MAX_SVC_NAME+1]
  {'ApplicationType': ctypes.int}, // integer of RM_APP_TYPE
  {'AppStatus': ctypes.unsigned_long}, // ULONG
  {'TSSessionId': ctypes.uint32_t}, // DWORD
  {'bRestartable': ctypes.bool} // BOOL
]);

/* http://msdn.microsoft.com/en-us/library/ff718266.aspx
* typedef struct {
*   unsigned long Data1;
*   unsigned short Data2;
*   unsigned short Data3;
*   byte Data4[8];
* } GUID, UUID, *PGUID;
*/
var struct_GUID = ctypes.StructType('GUID', [
  {'Data1': ctypes.unsigned_long},
  {'Data2': ctypes.unsigned_short},
  {'Data3': ctypes.unsigned_short},
  {'Data4': ctypes.char.array(8)}
]);

var RM_SESSION_KEY_LEN = struct_GUID.size; //https://github.com/wine-mirror/wine/blob/c87901d3f8cebfb7d28b42718c1c78035730d6ce/include/restartmanager.h#L26
var CCH_RM_SESSION_KEY = RM_SESSION_KEY_LEN * 2; //https://github.com/wine-mirror/wine/blob/c87901d3f8cebfb7d28b42718c1c78035730d6ce/include/restartmanager.h#L27
//console.log('CCH_RM_SESSION_KEY:', CCH_RM_SESSION_KEY)

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373668%28v=vs.85%29.aspx
* DWORD WINAPI RmStartSession(
*   __out_       DWORD *pSessionHandle,
*   __reserved_  DWORD dwSessionFlags,
*   __out_       WCHAR strSessionKey[ ]
* );
*/
var RmStartSession = lib.rstrtmgr.declare('RmStartSession', ctypes.winapi_abi, ctypes.uint32_t, // DWORD
    ctypes.uint32_t.ptr, // DWORD
    ctypes.uint32_t, // DWORD
    ctypes.int16_t.ptr // WCHAR
);

var jscharPtr = new ctypes.PointerType(ctypes.jschar);
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
var RmRegisterResources = lib.rstrtmgr.declare('RmRegisterResources', ctypes.winapi_abi, ctypes.uint32_t, // DWORD
    ctypes.uint32_t, // DWORD
    ctypes.unsigned_int, // UINT
    ctypes.char.ptr.array(), // LPCWSTR
    ctypes.unsigned_int, // UINT
    struct_RM_UNIQUE_PROCESS.ptr.array(), // RM_UNIQUE_PROCESS
    ctypes.unsigned_int, // UINT
    ctypes.char.ptr.array() // LPCWSTR
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373661%28v=vs.85%29.aspx
* DWORD WINAPI RmGetList(
*   __in_         DWORD dwSessionHandle,
*   __out_        UINT *pnProcInfoNeeded,
*   __inout_      UINT *pnProcInfo,
*   __inout_opt_  RM_PROCESS_INFO rgAffectedApps[ ],
*   __out_        LPDWORD lpdwRebootReasons
* );
*/
var RmGetList = lib.rstrtmgr.declare('RmGetList', ctypes.winapi_abi, ctypes.uint32_t, // DWORD
    ctypes.uint32_t, // DWORD
    ctypes.unsigned_int.ptr, // UINT
    ctypes.unsigned_int.ptr, // UINT
    struct_RM_PROCESS_INFO.ptr.array(), // RM_PROCESS_INFO rgAffectedApps[ ]
    ctypes.uint32_t.ptr // LPDWORD
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373659%28v=vs.85%29.aspx
* DWORD WINAPI RmEndSession(
*   __out_       DWORD *pSessionHandle,
*   __reserved_  DWORD dwSessionFlags,
*   __out_       WCHAR strSessionKey[ ]
* );
*/
var RmEndSession = lib.rstrtmgr.declare('RmEndSession', ctypes.winapi_abi, ctypes.uint32_t, // DWORD
    ctypes.uint32_t // DWORD
);

/* http://stackoverflow.com/questions/24466228/memset-has-no-dll-so-how-ctype-it
 * Note that size is the number of array elements to set, not the number of bytes.
 */
function memset(array, val, size) {
 for (var i = 0; i < size; ++i) {
   array[i] = val;
 }
}

var dwSession = new ctypes.uint32_t; //DWORD
/* Three methods to accomplish szSessionKey
 * 1) var szSessionKey = new ctypes.ArrayType(ctypes.int16_t, CCH_RM_SESSION_KEY + 1)();
 * 2) var szSessionKeyType = ctypes.ArrayType(ctypes.int16_t); //buffer type bufType
 *    var szSessionKey = new szSessionKeyType(CCH_RM_SESSION_KEY + 1); //buffer
 * 3) var szSessionKey = ctypes.int16_t.array(CCH_RM_SESSION_KEY + 1)(); //this is a buffer //im using this way right now
 */
var szSessionKey = ctypes.int16_t.array(CCH_RM_SESSION_KEY + 1)(); //this is a buffer
var dwError = RmStartSession(dwSession.address(), 0, szSessionKey);
//console.log(uneval(szSessionKey))

var ERROR_SUCCESS = 0; //https://github.com/zonio/mozilla-3e/blob/2363e3cd0a1ce2d870fad75eaa95a1fe75878766/modules/resolv.jsm#L446

if (dwError == ERROR_SUCCESS) {
  //var pszFile = argv[1]; // PCWSTR == new ctypes.PointerType(ctypes.jschar) //https://github.com/FunkMonkey/Loomo/blob/06a5881a4f520ede092059a4115bf117568b914f/Loomo/chrome/content/modules/Utils/COM/COM.jsm#L35
  /* This is WRONG way to make PCWSTR
   * var pszFile = new ctypes.PointerType(ctypes.jschar);
   * pszFile.contents = OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock');
   * var pszFile = ctypes.jschar.array()(OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock')); // PCWSTR
   * console.log('pszFile.contents:', pszFile);
   */
  
  //var rgsFilenamesType = ctypes.ArrayType(ctypes.char.ptr);
  //var rgsFilenames = new rgsFilenamesType(1);
  //rgsFilenames[0] = OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock');
  ////var rgsFilenames = ctypes.jschar.array()(1);
  ////memset(rgsFilenames, OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock'), rgsFilenames.length);
  
  //let strings = [OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock')].map(s => ctypes.char.array()(s));
  //let a = ctypes.char.ptr.array(strings.length);
  //strings.forEach((s, i) => { a[i] = s; });
  
  /* same thing as rgsFilenames and rgsFilenamesNonCData i just adapted that below from here
  let strings = [OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock')].map(s => ctypes.char.array()(s));
  let a = ctypes.char.ptr.array(strings.length)();
  strings.forEach((s, i) => { a[i] = s; });
  console.log('a:', a);
  */
  
  let rgsFilenamesNonCData = [OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock')].map(s => ctypes.char.array()(s));
  console.log(OS.Path.join(OS.Constants.Path.profileDir, 'parent.lock'))
  let rgsFilenames = ctypes.char.ptr.array(rgsFilenamesNonCData.length)();
  rgsFilenamesNonCData.forEach((s, i) => { rgsFilenames[i] = s; });
  
  console.log('rgsFilenames:', rgsFilenames);
  
  let rgsServiceNamesStrings = [].map(s => ctypes.char.array()(s));
  let rgsServiceNames = ctypes.char.ptr.array(rgsServiceNamesStrings.length)();
  rgsServiceNamesStrings.forEach((s, i) => { rgsServiceNames[i] = s; });
  
  
  /*just showing how i create custom struct array, it seems to work
  let rgApplicationsNonCData = struct_RM_UNIQUE_PROCESS.array(2)();
  rgApplicationsNonCData[0].dwProcessId = 111;
  rgApplicationsNonCData[0].ProcessStartTime = new struct_FILETIME();
    rgApplicationsNonCData[0].ProcessStartTime.dwLowDateTime = 222;
    rgApplicationsNonCData[0].ProcessStartTime.dwHighDateTime = 333;
  
  rgApplicationsNonCData[1].dwProcessId = 444;
  rgApplicationsNonCData[1].ProcessStartTime = new struct_FILETIME();
    rgApplicationsNonCData[1].ProcessStartTime.dwLowDateTime = 555;
    rgApplicationsNonCData[1].ProcessStartTime.dwHighDateTime = 666;
  
  console.log('rgApplications:', rgApplicationsNonCData); //console logging these look exactly the same
  
  let rgApplications = struct_RM_UNIQUE_PROCESS.ptr.array(rgApplicationsNonCData.length)();
  console.log('rgApplications:', rgApplications);  //console logging these look exactly the same
  */
  
  let rgApplicationsNonCData = struct_RM_UNIQUE_PROCESS.array(0)();
  let rgApplications = struct_RM_UNIQUE_PROCESS.ptr.array(rgApplicationsNonCData.length)();
  
  dwError = RmRegisterResources(dwSession, rgsFilenames.length, rgsFilenames, rgApplications.length, rgApplications, rgsServiceNames.length, rgsServiceNames); // using rgApplicationsNonCData will throw `Exception: expected type pointer, got RM_UNIQUE_PROCESS.array(2)([{"dwProcessId": 111, "ProcessStartTime": {"dwLowDateTime": 222, "dwHighDateTime": 333}}, {"dwProcessId": 444, "ProcessStartTime": {"dwLowDateTime": 555, "dwHighDateTime": 666}}])` very nice! and using `rgApplications` will not throw any error
  if (dwError == ERROR_SUCCESS) {
    var nProcInfoNeeded = new ctypes.unsigned_int; // UINT
    var nProcInfo = ctypes.unsigned_int(10); //new ctypes.unsigned_int; // UINT
    //var rgpi = struct_RM_PROCESS_INFO.ptr.array(10)();
      let rgpiNonCData = struct_RM_PROCESS_INFO.array(10)();
      let rgpi = struct_RM_PROCESS_INFO.ptr.array(rgApplicationsNonCData.length)();
    var dwReason = new ctypes.uint32_t; // LPDWORD

    //dwError = RmGetList(dwSession, null, 0, null, null); //Now the fun begins. Getting the list of affected processes is normally a two-step affair. First, you ask for the number of affected processes (by passing 0 as the nProcInfo), then allocate some memory and call a second time to get the data.
    //console.log('RmGetList returned:', dwError);
    
    dwError = RmGetList(dwSession, nProcInfoNeeded.address(), nProcInfo.address(), rgpi, dwReason.address());
    if (dwError == ERROR_SUCCESS) {
      console.log('RmGetList returned %d infos (%d needed)');
      console.log('RmGetList returned d infos (d needed)', nProcInfo, nProcInfoNeeded);
      /*
      for (var i = 0; i<nProcInfo; i++) {
        console.log('%d.ApplicationType = %d\n', i, rgpi[i].ApplicationType);
        console.log('%d.strAppName = %ls\n', i, rgpi[i].strAppName);
        console.log('%d.Process.dwProcessId = %d\n', i, rgpi[i].Process.dwProcessId);
        //can now get most recent window of dwProcessId or do whatever i want
      }
      */
    } else {
      console.error('RmGetList, dwError was not ERROR_SUCCESS', 'dwError', dwError); //make sure to continue to RmEndSession
    }
  } else {
    console.error('RmRegisterResources, dwError was not ERROR_SUCCESS', 'dwError', dwError); //make sure to continue to RmEndSession
  }
  
  var rez = RmEndSession(dwSession);
  console.log('RmEndSession rez:', rez);
} else {
  console.error('RmStartSession, dwError was not ERROR_SUCCESS', 'dwError', dwError.toString()); //no need to do RmEndSession here
}

for (var l in lib) {
  lib[l].close();
}