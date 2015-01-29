var Cc = Components.classes;
var Cu = Components.utils;
var Cr = Components.results;
var Ci = Components.interfaces;

Cu.import("resource://gre/modules/ctypes.jsm");

// Source:
// http://msdn.microsoft.com/en-us/library/aa383751.aspx
var HWND = ctypes.voidptr_t;
var HRESULT = ctypes.long;
var ULONG = ctypes.unsigned_long;
var WORD = ctypes.unsigned_short;
var DWORD = ctypes.unsigned_long;
var WCHAR = ctypes.jschar;
var LPWSTR = new ctypes.PointerType(WCHAR);
var LPCWSTR = LPWSTR;
var LPOLESTR = LPWSTR;
var LPCOLESTR = LPOLESTR;
var BOOL = ctypes.int;

// Source:
// http://msdn.microsoft.com/en-us/library/windows/desktop/aa378137%28v=vs.85%29.aspx
var S_OK = new HRESULT(0);
var S_FALSE = new HRESULT(1);

// Source:
// http://msdn.microsoft.com/en-us/library/ff718266%28v=prot.10%29.aspx
var GUID =
        ctypes.StructType("GUID",
              [
                {"Data1": ctypes.unsigned_long},
                {"Data2": ctypes.unsigned_short},
                {"Data3": ctypes.unsigned_short},
                {"Data4": ctypes.char.array(8)}
              ]);
// Source:
// http://msdn.microsoft.com/en-us/library/cc237652%28v=prot.13%29.aspx
var IID = GUID;
// Source:
// http://msdn.microsoft.com/en-us/library/cc237816%28v=prot.13%29.aspx
var REFIID = new ctypes.PointerType(IID);

// Source:
// ???
var CLSID = GUID;
var REFCLSID = new ctypes.PointerType(CLSID);


let IShellLinkWVtbl = new ctypes.StructType("IShellLinkWVtbl");

var IShellLinkW = new ctypes.StructType("IshellLinkW",
    [
      {
        "lpVtbl": IShellLinkWVtbl.ptr
      }
    ]);
var IShellLinkWPtr = new ctypes.PointerType(IShellLinkW);

IShellLinkWVtbl.define(
    [
      {
        "QueryInterface": ctypes.FunctionType(ctypes.stdcall_abi,
                                              HRESULT,
                                              [
                                                IShellLinkW.ptr,
                                                REFIID,
                                                ctypes.voidptr_t
                                              ]).ptr
      },
      {
        "AddRef": ctypes.FunctionType(ctypes.stdcall_abi,
                                      ULONG,
                                      [
                                        IShellLinkW.ptr
                                      ]).ptr
      },
      {
        "Release": ctypes.FunctionType(ctypes.stdcall_abi,
                                       ULONG,
                                       [
                                         IShellLinkW.ptr
                                       ]).ptr
      },
      {
        "GetPath": ctypes.FunctionType(ctypes.stdcall_abi,
                                       HRESULT,
                                       [
                                         IShellLinkW.ptr,
                                         LPWSTR,
                                         ctypes.voidptr_t, // WIN32_FIND_DATAW
                                         DWORD
                                       ]).ptr
      },
      {
        "GetIDList": ctypes.FunctionType(ctypes.stdcall_abi,
                                         HRESULT,
                                         [
                                           IShellLinkW.ptr,
                                           // PIDLIST_ABSOLUTE*
                                           ctypes.voidptr_t.ptr
                                         ]).ptr
      },
      {
        "SetIDList": ctypes.FunctionType(ctypes.stdcall_abi,
                                         HRESULT,
                                         [
                                           IShellLinkW.ptr,
                                           // PCIDLIST_ABSOLUTE
                                           ctypes.voidptr_t
                                         ]).ptr
      },
      {
        "GetDescription": ctypes.FunctionType(ctypes.stdcall_abi,
                                              HRESULT,
                                              [
                                                IShellLinkW.ptr,
                                                ctypes.voidptr_t,
                                                ctypes.int
                                              ]).ptr
      },
      {
        "SetDescription": ctypes.FunctionType(ctypes.stdcall_abi,
                                              HRESULT,
                                              [
                                                IShellLinkW.ptr,
                                                LPCWSTR
                                              ]).ptr
      },
      {
        "GetWorkingDirectory": ctypes.FunctionType(ctypes.stdcall_abi,
                                                   HRESULT,
                                                   [
                                                     IShellLinkW.ptr,
                                                     LPWSTR,
                                                     ctypes.int
                                                   ]).ptr
      },
      {
        "SetWorkingDirectory": ctypes.FunctionType(ctypes.stdcall_abi,
                                                   HRESULT,
                                                   [
                                                     IShellLinkW.ptr,
                                                     LPCWSTR
                                                   ]).ptr
      },
      {
        "GetArguments": ctypes.FunctionType(ctypes.stdcall_abi,
                                            HRESULT,
                                            [
                                              IShellLinkW.ptr,
                                              LPWSTR,
                                              ctypes.int
                                            ]).ptr
      },
      {
        "SetArguments": ctypes.FunctionType(ctypes.stdcall_abi,
                                            HRESULT,
                                            [
                                              IShellLinkW.ptr,
                                              LPCWSTR
                                            ]).ptr
      },
      {
        "GetHotKey": ctypes.FunctionType(ctypes.stdcall_abi,
                                         HRESULT,
                                         [
                                           IShellLinkW.ptr,
                                           WORD.ptr
                                         ]).ptr
      },
      {
        "SetHotKey": ctypes.FunctionType(ctypes.stdcall_abi,
                                         HRESULT,
                                         [
                                           IShellLinkW.ptr,
                                           WORD
                                         ]).ptr
      },
      {
        "GetShowCmd": ctypes.FunctionType(ctypes.stdcall_abi,
                                          HRESULT,
                                          [
                                            IShellLinkW.ptr,
                                            ctypes.int.ptr
                                          ]).ptr
      },
      {
        "SetShowCmd": ctypes.FunctionType(ctypes.stdcall_abi,
                                          HRESULT,
                                          [
                                            IShellLinkW.ptr,
                                            ctypes.int
                                          ]).ptr
      },
      {
        "GetIconLocation": ctypes.FunctionType(ctypes.stdcall_abi,
                                               HRESULT,
                                               [
                                                 IShellLinkW.ptr,
                                                 LPWSTR,
                                                 ctypes.int,
                                                 ctypes.int.ptr
                                               ]).ptr
      },
      {
        "SetIconLocation": ctypes.FunctionType(ctypes.stdcall_abi,
                                               HRESULT,
                                               [
                                                 IShellLinkW.ptr,
                                                 LPCWSTR,
                                                 ctypes.int
                                               ]).ptr
      },
      {
        "SetRelativePath": ctypes.FunctionType(ctypes.stdcall_abi,
                                               HRESULT,
                                               [
                                                 IShellLinkW.ptr,
                                                 LPCWSTR,
                                                 DWORD
                                               ]).ptr
      },
      {
        "Resolve": ctypes.FunctionType(ctypes.stdcall_abi,
                                       HRESULT,
                                       [
                                         IShellLinkW.ptr,
                                         HWND,
                                         DWORD
                                       ]).ptr
      },
      {
        "SetPath": ctypes.FunctionType(ctypes.stdcall_abi,
                                       HRESULT,
                                       [
                                         IShellLinkW.ptr,
                                         LPCWSTR
                                       ]).ptr
      },
    ]);

let IPersistFileVtbl = new ctypes.StructType("IPersistFileVtbl");

var IPersistFile = new ctypes.StructType("IPersistFile",
    [
      {
        "lpVtbl": IPersistFileVtbl.ptr
      }
    ]);
var IPersistFilePtr = new ctypes.PointerType(IPersistFile);

IPersistFileVtbl.define(
    [
      {
        "QueryInterface": ctypes.FunctionType(ctypes.stdcall_abi,
                                              HRESULT,
                                              [
                                                IPersistFile.ptr,
                                                REFIID,
                                                ctypes.voidptr_t
                                              ]).ptr
      },
      {
        "AddRef": ctypes.FunctionType(ctypes.stdcall_abi,
                                      ULONG,
                                      [
                                        IPersistFile.ptr
                                      ]).ptr
      },
      {
        "Release": ctypes.FunctionType(ctypes.stdcall_abi,
                                       ULONG,
                                       [
                                         IPersistFile.ptr
                                       ]).ptr
      },
      {
        "GetClassID": ctypes.FunctionType(ctypes.stdcall_abi,
                                          HRESULT,
                                          [
                                            IPersistFile.ptr,
                                            CLSID.ptr
                                          ]).ptr
      },
      {
        "IsDirty": ctypes.FunctionType(ctypes.stdcall_abi,
                                       HRESULT,
                                       [
                                         IPersistFile.ptr,
                                       ]).ptr
      },
      {
        "Load": ctypes.FunctionType(ctypes.stdcall_abi,
                                    HRESULT,
                                    [
                                      IPersistFile.ptr,
                                      LPCOLESTR,
                                      DWORD
                                    ]).ptr
      },
      {
        "Save": ctypes.FunctionType(ctypes.stdcall_abi,
                                    HRESULT,
                                    [
                                      IPersistFile.ptr,
                                      LPCOLESTR,
                                      BOOL
                                    ]).ptr
      },
      {
        "SaveCompleted": ctypes.FunctionType(ctypes.stdcall_abi,
                                             HRESULT,
                                             [
                                               IPersistFile.ptr,
                                               LPCOLESTR
                                             ]).ptr
      },
      {
        "GetCurFile": ctypes.FunctionType(ctypes.stdcall_abi,
                                          HRESULT,
                                          [
                                            IPersistFile.ptr,
                                            LPOLESTR.ptr
                                          ]).ptr
      }
  ]);


function log(message) {
  dump(message + "\n");
}

function checkHRESULT(hr, funcName) {
  if(hr < 0) {
    throw "HRESULT " + hr + " returned from function " + funcName;
  }
}

function setShortcut(shortcutFile,
                     targetFile,
                     workingDir,
                     args,
                     description,
                     iconFile,
                     iconIndex) {
  if(!shortcutFile
  ||(!targetFile && !shortcutFile.exists())) {
    throw Cr.NS_ERROR_INVALID_ARG;
  }

  let ole32;
  let CoUninitialize;
  let shouldUninitialize;
  let shellLink;
  let shellLinkPtr;
  let persistFile;
  let persistFilePtr;
  try {
    ole32 = ctypes.open("Ole32");
    CoUninitialize = ole32.declare("CoUninitialize",
                                   ctypes.winapi_abi,
                                   ctypes.void_t);
    let CoInitializeEx = ole32.declare("CoInitializeEx",
                                       ctypes.winapi_abi,
                                       HRESULT,
                                       ctypes.voidptr_t,
                                       DWORD);
    let CoCreateInstance = ole32.declare("CoCreateInstance",
                                         ctypes.winapi_abi,
                                         HRESULT,
                                         REFCLSID,
                                         ctypes.voidptr_t, // LPUNKNOWN
                                         DWORD,
                                         REFIID,
                                         ctypes.voidptr_t);
    let CLSIDFromString = ole32.declare("CLSIDFromString",
                                        ctypes.winapi_abi,
                                        HRESULT,
                                        LPCOLESTR,
                                        GUID.ptr);

    let hr_CoInitializeEx = HRESULT(CoInitializeEx(null,
                                    0x2)); // COINIT_APARTMENTTHREADED
    console.log('hr_CoInitializeEx:', hr_CoInitializeEx, hr_CoInitializeEx.toString(), uneval(hr_CoInitializeEx));
    if(S_OK.toString() == hr_CoInitializeEx.toString()
    || S_FALSE.toString() == hr_CoInitializeEx.toString()) {
      shouldUninitialize = true;
    } else {
      throw("Unexpected return value from CoInitializeEx: " + hr_CoInitializeEx);
    }

    let CLSID_ShellLink = new GUID();
    hr = CLSIDFromString("{00021401-0000-0000-C000-000000000046}",
                         CLSID_ShellLink.address());
    checkHRESULT(hr, "CLSIDFromString (CLSID_ShellLink)");

    let IID_IShellLink = new GUID();
    hr = CLSIDFromString("{000214F9-0000-0000-C000-000000000046}",
                         IID_IShellLink.address());
    checkHRESULT(hr, "CLSIDFromString (IID_ShellLink)");

    shellLinkPtr = new IShellLinkWPtr();
    hr = CoCreateInstance(CLSID_ShellLink.address(),
                          null,
                          0x1, // CLSCTX_INPROC_SERVER
                          IID_IShellLink.address(),
                          shellLinkPtr.address());
    checkHRESULT(hr, "CoCreateInstance");
    shellLink = shellLinkPtr.contents.lpVtbl.contents;

    let IID_IPersistFile = new GUID();
    hr = CLSIDFromString("{0000010b-0000-0000-C000-000000000046}",
                         IID_IPersistFile.address());
    checkHRESULT(hr, "CLSIDFromString (IID_IPersistFile)");

    persistFilePtr = new IPersistFilePtr();
    hr = shellLink.QueryInterface(shellLinkPtr,
                                  IID_IPersistFile.address(),
                                  persistFilePtr.address());
    checkHRESULT(hr, "QueryInterface (IShellLink->IPersistFile)");
    persistFile = persistFilePtr.contents.lpVtbl.contents;
console.log('h')
    if(shortcutFile.exists()) {
      hr = persistFile.Load(persistFilePtr,
                            shortcutFile.path,
                            0);
    console.info('hr:', hr, hr.toString(), uneval(hr));
      checkHRESULT(hr, "Load");
    }
console.log('h1')
    if(targetFile) {
      hr = shellLink.SetPath(shellLinkPtr,
                             targetFile.path);
    console.info('hr:', hr, hr.toString(), uneval(hr));
      checkHRESULT(hr, "SetPath");
    }
console.log('h2')
    if(workingDir) {
      hr = shellLink.SetWorkingDirectory(shellLinkPtr,
                                         workingDir.path);
      checkHRESULT(hr, "SetWorkingDirectory");
    }

    if(args) {
      hr = shellLink.SetArguments(shellLinkPtr,
                                  args);
    console.info('hr:', hr, hr.toString(), uneval(hr));
      checkHRESULT(hr, "SetArguments");
    }
console.log('h3')
    if(description) {
      hr = shellLink.SetDescription(shellLinkPtr,
                                    description);
    console.info('hr:', hr, hr.toString(), uneval(hr));
      checkHRESULT(hr, "SetDescription");
    }
console.log('h4')
    if(iconFile) {
      hr = shellLink.SetIconLocation(shellLinkPtr,
                                     iconFile.path, iconIndex? iconIndex : 0);
    console.info('hr:', hr, hr.toString(), uneval(hr));
      checkHRESULT(hr, "SetIconLocation");
    }
console.log('h5')
    hr = persistFile.Save(persistFilePtr,
                          shortcutFile.path,
                          -1);
    console.info('hr:', hr, hr.toString(), uneval(hr));
    checkHRESULT(hr, "Save");
console.log('h6')
  } catch(e) {
    Cu.reportError("Failure creating/updating shortcut: " + e);
    throw Cr.NS_ERROR_FAILURE;
  } finally {
    if(persistFile) {
      try {
        persistFile.Release(persistFilePtr);
      } catch(e) {
        Cu.reportError("Failure releasing persistFile: " + e);
      }
    }

    if(shellLink) {
      try {
        shellLink.Release(shellLinkPtr);
      } catch(e) {
        Cu.reportError("Failure releasing shellLink: " + e);
      }
    }

    if(shouldUninitialize) {
      try {
        CoUninitialize();
      } catch(e) {
        Cu.reportError("Failure calling CoUninitialize: " + e);
      }
    }

    if(ole32) {
      try {
        ole32.close();
      } catch(e) {
        Cu.reportError("Failure closing ole32: " + e);
      }
    }
  }
}

setShortcut(FileUtils.getFile('Desk', ['jsctypes.lnk']), FileUtils.getFile('XREExeF', []), null, '-no-remote -P', 'my desc', FileUtils.getFile('Desk', ['ppbeta.ico']));
