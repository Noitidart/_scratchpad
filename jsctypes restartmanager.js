Cu.import('resource://gre/modules/ctypes.jsm');
var rstrtmgr = ctypes.open('Rstrtmgr.dll');

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373668%28v=vs.85%29.aspx
* DWORD WINAPI RmStartSession(
*   __out_       DWORD *pSessionHandle,
*   __reserved_  DWORD dwSessionFlags,
*   __out_       WCHAR strSessionKey[ ]
* );
*/
var RmStartSession = rstrtmgr.declare('RmStartSession', ctypes.winapi_abi, ctypes.unsigned_long, // DWORD
    ctypes.unsigned_long.ptr, // DWORD
    ctypes.unsigned_long, // DWORD
    ctypes.jschar.ptr // WCHAR
);


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
var RmRegisterResources = rstrtmgr.declare('RmRegisterResources', ctypes.winapi_abi, ctypes.unsigned_long, // DWORD
    ctypes.unsigned_long, // DWORD
    ctypes.unsigned_int, // UINT
    ctypes.jschar.ptr, // LPCWSTR
    ctypes.unsigned_int, // UINT
    ctypes.voidptr_t, // RM_UNIQUE_PROCESS
    ctypes.unsigned_int, // UINT
    ctypes.jschar.ptr // LPCWSTR
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
var RmGetList = rstrtmgr.declare('RmGetList', ctypes.winapi_abi, ctypes.unsigned_long, // DWORD
    ctypes.unsigned_long, // DWORD
    ctypes.unsigned_int, // UINT
    ctypes.unsigned_int, // UINT
    ctypes.voidptr_t, // RM_PROCESS_INFO
    ctypes.unsigned_long.ptr // LPDWORD
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa373659%28v=vs.85%29.aspx
* DWORD WINAPI RmEndSession(
*   __out_       DWORD *pSessionHandle,
*   __reserved_  DWORD dwSessionFlags,
*   __out_       WCHAR strSessionKey[ ]
* );
*/
var RmEndSession = rstrtmgr.declare('RmEndSession', ctypes.winapi_abi, ctypes.unsigned_long, // DWORD
    ctypes.unsigned_long // DWORD
);
var me = Services.ww.activeWindow;

var dwSession = ctypes.unsigned_long(0);
var rez = RmStartSession(dwSession.ptr, 0, );

rstrtmgr.close();