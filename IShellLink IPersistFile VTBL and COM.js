Cu.import('resource://gre/modules/ctypes.jsm')

var wintypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.int;
	this.BOOLEAN = ctypes.char; // http://blogs.msdn.com/b/oldnewthing/archive/2004/12/22/329884.aspx // not used in this jsctypes code but just putting it here as i may need in future search as i have the documentation around this (the blog) in my mind right now and commented it here
	this.DWORD = ctypes.unsigned_long;
	this.HRESULT = ctypes.long;
	this.HWND = ctypes.voidptr_t;
	this.INT = ctypes.int;
	this.LPUNKNOWN = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm
	this.LPVOID = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm
	this.PCIDLIST_ABSOLUTE = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L115
	this.PCWSTR = new ctypes.PointerType(ctypes.jschar); // https://github.com/FunkMonkey/Loomo/blob/06a5881a4f520ede092059a4115bf117568b914f/Loomo/chrome/content/modules/Utils/COM/COM.jsm#L35
	this.PIDLIST_ABSOLUTE = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L106
	this.UINT = ctypes.unsigned_int;
	this.ULONG = ctypes.unsigned_long;
	this.VARIANT_BOOL = ctypes.short; //http://msdn.microsoft.com/en-us/library/cc235510.aspx // http://blogs.msdn.com/b/oldnewthing/archive/2004/12/22/329884.aspx
	this.VARTYPE = ctypes.unsigned_short;
	this.VOID = ctypes.void_t;
	this.VOIDPTR = ctypes.voidptr_t
	this.WCHAR = ctypes.jschar;
	this.WIN32_FIND_DATA = ctypes.voidptr_t;
	this.WINOLEAPI = ctypes.voidptr_t; // i guessed on this one
	this.WORD = ctypes.unsigned_short;
	
	// ADVANCED TYPES (ones that are based on the basic types)
	this.LPTSTR = new ctypes.PointerType(this.WCHAR);
	this.LPCTSTR = this.LPTSTR;
	this.LPWSTR = new ctypes.PointerType(this.WCHAR);
	this.LPCWSTR = this.LPWSTR;
	this.LPOLESTR = this.LPWSTR;
	this.LPCOLESTR = this.LPOLESTR;
	 
	// BASIC STRUCTURES
	this.GUID = ctypes.StructType('GUID', [ // http://msdn.microsoft.com/en-us/library/ff718266%28v=prot.10%29.aspx
		{ 'Data1': ctypes.unsigned_long },
		{ 'Data2': ctypes.unsigned_short },
		{ 'Data3': ctypes.unsigned_short },
		{ 'Data4': ctypes.char.array(8) }
	]);
	
	// ADVANCED STRUCTURES
	this.IID = this.GUID; // http://msdn.microsoft.com/en-us/library/cc237652%28v=prot.13%29.aspx
	this.REFIID = new ctypes.PointerType(this.IID); // http://msdn.microsoft.com/en-us/library/cc237816%28v=prot.13%29.aspx
	
	this.CLSID = this.GUID; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L52
	this.REFCLSID = new ctypes.PointerType(this.CLSID); // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L53

	// VTABLE's
	//start - shell link, which i think is needed for all COM due to the `hr = shellLink.QueryInterface(shellLinkPtr, IID_IPropertyStore.address(), propertyStorePtr.address());`
	var IShellLinkWVtbl = new ctypes.StructType('IShellLinkWVtbl');

	const IShellLinkW = new ctypes.StructType('IShellLinkW', [{
		'lpVtbl': IShellLinkWVtbl.ptr
	}]);
	this.IShellLinkWPtr = new ctypes.PointerType(IShellLinkW);

	IShellLinkWVtbl.define(
		[{
			'QueryInterface': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.REFIID,
					ostypes.VOIDPTR
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, {
			'GetArguments': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPTSTR,	// pszArgs
					ctypes.INT		// cchMaxPath
				]).ptr
		}, {
			'GetDescription': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPTSTR	// pszName
					ostypes.INT		// cchMaxName
				]).ptr
		}, {
			'GetHotKey': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.WORD.ptr	// *pwHotkey
				]).ptr
		}, {
			'GetIconLocation': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPTSTR,		// pszIconPath
					ostypes.INT,		// cchIconPath
					ostpyes.INT.ptr		// *piIcon
				]).ptr
		}, {
			'GetIDList': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.PIDLIST_ABSOLUTE.ptr	// *ppidl
				]).ptr
		}, {
			'GetPath': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPTSTR,					// pszFile
					ostypes.INT,					// cchMaxPath
					ostypes.WIN32_FIND_DATA.ptr,	// *pfd
					ostypes.DWORD					// fFlags
				]).ptr
		}, {
			'GetShowCmd': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.INT.ptr		// *piShowCmd
				]).ptr
		}, {
			'GetWorkingDirectory': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPTSTR,		// pszDir
					ostypes.INT			// cchMaxPath
				]).ptr
		}, {
			'Resolve': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.HWND,	// hwnd
					ostypes.DWORD	// fFlags
				]).ptr
		}, {
			'SetArguments': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCTSTR		// pszArgs
				]).ptr
		}, {
			'SetDescription': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCTSTR		// pszName
				]).ptr
		}, {
			'SetHotKey': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					WORD	// wHotkey
				]).ptr
		}, {
			'SetIconLocation': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCTSTR,	// pszIconPath
					ostypes.INT			// iIcon
				]).ptr
		}, {
			'SetIDList': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.PCIDLIST_ABSOLUTE	// pidl
				]).ptr
		}, {
			'SetPath': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCTSTR		// pszFile
				]).ptr
		}, {
			'SetRelativePath': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCTSTR,	// pszPathRel
					ostypes.DWORD		// dwReserved
				]).ptr
		}, {
			'SetShowCmd': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.INT		// iShowCmd
				]).ptr
		}, {
			'SetWorkingDirectory': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.LPCWSTR
				]).ptr
		} ]
	);
	//end - shell link, which i think is needed for all COM

	// start - IPersistFile
	var IPersistFileVtbl = new ctypes.StructType('IPersistFileVtbl');

	var IPersistFile = new ctypes.StructType('IPersistFile',[{
			'lpVtbl': IPersistFileVtbl.ptr
		}]
	);
	this.IPersistFilePtr = new ctypes.PointerType(IPersistFile);

	IPersistFileVtbl.define(
		[{ //start inherit from IUnknown
			'QueryInterface': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IShellLinkW.ptr,
					ostypes.REFIID,
					ostypes.VOIDPTR
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, { //end inherit from IUnknown //start inherit from IPersist
			'GetClassID': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
					ostypes.CLSID.ptr	// *pClassID
				]).ptr
		}, { //end inherit from IPersist
			'GetCurFile': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
					ostypes.LPOLESTR.ptr	// *ppszFileName
				]).ptr
		}, {
			'IsDirty': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
				]).ptr
		}, {
			'Load': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
					ostypes.LPCOLESTR,	// pszFileName
					ostypes.DWORD		// dwMode
				]).ptr
		}, {
			'Save': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
					ostypes.LPCOLESTR,	// pszFileName
					ostypes.BOOL		// fRemember
				]).ptr
		}, {
			'SaveCompleted': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPersistFile.ptr,
					ostypes.LPCOLESTR	// pszFileName
				]).ptr
		}
	]);
	// end - IPersistFile

	// CONSTANTS
	this.COINIT_APARTMENTTHREADED = 0x2; //https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm
	this.CLSCTX_INPROC_SERVER = 0x1;
	this.GA_ROOT = 2;
	this.S_OK = new this.HRESULT(0); // http://msdn.microsoft.com/en-us/library/windows/desktop/aa378137%28v=vs.85%29.aspx
	this.S_FALSE = new this.HRESULT(1); // http://msdn.microsoft.com/en-us/library/windows/desktop/aa378137%28v=vs.85%29.aspx
	this.VARIANT_FALSE = this.VARIANT_BOOL(0); //http://blogs.msdn.com/b/oldnewthing/archive/2004/12/22/329884.aspx
	this.VARIANT_TRUE = this.VARIANT_BOOL(-1); //http://blogs.msdn.com/b/oldnewthing/archive/2004/12/22/329884.aspx // im not doing new this.VARIANT_BOOL becuase as we see in this shortcut js-ctypes they simply do HRESULT(value) ( https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L389 )
	this.VT_BOOL = 0x000B; // 11
	this.VT_LPWSTR = 0x001F; // 31
}
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
	CLSIDFromString: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms680589%28v=vs.85%29.aspx
		 * HRESULT CLSIDFromString(
		 *   __in_ LPCOLESTR lpsz,
		 *   __out_ LPCLSID pclsid
		 * );
		 */
		return _lib('Ole32.dll').declare('CLSIDFromString', ctypes.winapi_abi,
			ostypes.HRESULT,	// return
			ostypes.LPCOLESTR,	// lpsz
			ostypes.GUID.ptr	// pclsid
		); 
	},
	CoCreateInstance: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms686615%28v=vs.85%29.aspx
		 * HRESULT CoCreateInstance(
		 *   __in_   REFCLSID rclsid,
		 *   __in_   LPUNKNOWN pUnkOuter,
		 *   __in_   DWORD dwClsContext,
		 *   __in_   REFIID riid,
		 *   __out_  LPVOID *ppv
		 * );
		 */
		return _lib('Ole32.dll').declare('CoCreateInstance', ctypes.winapi_abi,
			ostypes.HRESULT,	// return
			ostypes.REFCLSID,	// rclsid
			ostypes.LPUNKNOWN,	// pUnkOuter
			ostypes.DWORD,		// dwClsContext
			ostypes.REFIID,		// riid
			ostypes.LPVOID		// *ppv
		);
	},
	CoInitializeEx: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms695279%28v=vs.85%29.aspx
		 * HRESULT CoInitializeEx(
		 *   __in_opt_  LPVOID pvReserved,
		 *   __in_      DWORD dwCoInit
		 * );
		 */
		return _lib('Ole32.dll').declare('CoInitializeEx', ctypes.winapi_abi,
			ostypes.HRESULT,	// result
			ostypes.LPVOID,		// pvReserved
			ostypes.DWORD		// dwCoInit
		);
	},
	CoTaskMemFree: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms680722%28v=vs.85%29.aspx
		 * void CoTaskMemFree(
		 *   __in_opt_  LPVOID pv
		 * );
		 */
		return _lib('Ole32.dll').declare('CoTaskMemFree', ctypes.winapi_abi,
			ostypes.LPVOID	// pv
		);
	},
	CoUninitialize: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms688715%28v=vs.85%29.aspx
		 * void CoUninitialize(void);
		 */
		return _lib('Ole32.dll').declare('CoUninitialize', ctypes.winapi_abi,
			ostypes.VOID	// return
		);
	},
	SHStrDup: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/bb759924%28v=vs.85%29.aspx
		* HRESULT SHStrDup(
		* __in_ LPCTSTR pszSource,
		* __out_ LPTSTR *ppwsz
		* );
		*/
		return _lib('Shlwapi.dll').declare('SHStrDupW', ctypes.winapi_abi,
			ostypes.HRESULT,	// return
			ostypes.LPCTSTR,	// pszSource	// old val from old Gist of mine RelunchCommand@yajd `ctypes.voidptr_t` and the notes from then: // can possibly also make this ctypes.char.ptr // im trying to pass PCWSTR here, i am making it as `ctypes.jschar.array()('blah blah').address()`
			ostypes.LPTSTR.ptr	// *ppwsz	 	// old val from old Gist of mine RelunchCommand@yajd `ctypes.voidptr_t` and the notes from then: // can possibly also make this ctypes.char.ptr
		); 
	}
}
// end - predefine your declares here

// start - helper functions
function checkHRESULT(hr, funcName) {
	if(hr < 0) {
		throw 'HRESULT ' + hr + ' returned from function ' + funcName;
	}
}
// end - helper functions

function shutdown() {
	// do in here what you want to do before shutdown
	
	if(persistFile) {
		try {
			persistFile.Release(persistFilePtr);
		} catch(e) {
			console.error("Failure releasing persistFile: ", e);
		}
	}

	if(shellLink) {
		try {
			shellLink.Release(shellLinkPtr);
		} catch(e) {
			console.error("Failure releasing shellLink: ", e);
		}
	}
	
	if (shouldUninitialize) {
		try {
			_dec('CoUninitialize')(); // return void
		} catch(e) {
			console.error("Failure calling CoUninitialize: ", e);
		}
	}
	
	for (var l in lib) {
		try {
			lib[l].close();
		} catch (ex) {
			throw new Error('Failure closing "' + l + '": ' + ex);
		}
	}
}

// main globals
var shouldUninitialize;
var shellLink;
var shellLinkPtr;
var persistFile;
var persistFilePtr;

function main() {
	//do code here

	// start - looks like something i would run in _dec or just in main

	try {
		var hr = ostypes.HRESULT(CoInitializeEx(null, ostypes.COINIT_APARTMENTTHREADED));
		if(S_OK.toString() == hr.toString() || S_FALSE.toString() == hr.toString()) {
			shouldUninitialize = true;
		} else {
			throw('Unexpected return value from CoInitializeEx: ' + hr);
		}
		

		var CLSID_ShellLink = new GUID();
		var hr = CLSIDFromString('{00021401-0000-0000-C000-000000000046}', CLSID_ShellLink.address());
		checkHRESULT(hr, 'CLSIDFromString (CLSID_ShellLink)');
		
		var IID_IShellLink = new GUID();
		hr = CLSIDFromString('{000214F9-0000-0000-C000-000000000046}', IID_IShellLink.address());
		checkHRESULT(hr, 'CLSIDFromString (IID_ShellLink)');

		shellLinkPtr = new IShellLinkWPtr();
		var hr = CoCreateInstance(CLSID_ShellLink.address(), null, ostypes.CLSCTX_INPROC_SERVER, IID_IShellLink.address(), shellLinkPtr.address());
		checkHRESULT(hr, 'CoCreateInstance');
		shellLink = shellLinkPtr.contents.lpVtbl.contents;

		var IID_IPersistFile = new GUID();
		var hr = CLSIDFromString('{0000010b-0000-0000-C000-000000000046}', IID_IPersistFile.address());
		checkHRESULT(hr, 'CLSIDFromString (IID_IPersistFile)');

		persistFilePtr = new IPersistFilePtr();
		var hr = shellLink.QueryInterface(shellLinkPtr, IID_IPersistFile.address(), persistFilePtr.address());
		checkHRESULT(hr, 'QueryInterface (IShellLink->IPersistFile)');
		persistFile = persistFilePtr.contents.lpVtbl.contents;
		
		
		var shortcutFile = null;
		var targetFile = null;
		var workingDir = null; // The working directory is optional unless the target requires a working directory. For example, if an application creates a Shell link to a Microsoft Word document that uses a template residing in a different directory, the application would use this method to set the working directory.
		var args = null;
		var description = null;
		var iconFile = null;
		var iconIndex = null;
		
		if(shortcutFile.exists()) {
			var hr = persistFile.Load(persistFilePtr, shortcutFile.path, 0);
			checkHRESULT(hr, "Load");
		}

		if(targetFile) {
			var hr = shellLink.SetPath(shellLinkPtr, targetFile.path);
			checkHRESULT(hr, "SetPath");
		}

		if(workingDir) {
			var hr = shellLink.SetWorkingDirectory(shellLinkPtr, workingDir.path);
			checkHRESULT(hr, "SetWorkingDirectory");
		}

		if(args) {
			var hr = shellLink.SetArguments(shellLinkPtr, args);
			checkHRESULT(hr, "SetArguments");
		}

		if(description) {
			var hr = shellLink.SetDescription(shellLinkPtr, description);
			checkHRESULT(hr, "SetDescription");
		}

		if(iconFile) {
			var hr = shellLink.SetIconLocation(shellLinkPtr, iconFile.path, iconIndex? iconIndex : 0);
			checkHRESULT(hr, "SetIconLocation");
		}

		var hr = persistFile.Save(persistFilePtr, shortcutFile.path, -1);
		checkHRESULT(hr, "Save");
		
	} catch(ex) {
		throw ex;
	} finally {
		if (pps) {
			try {
				pps.Release(ppsPtr);
			} catch (ex) {
				console.error('Failure releasing pps: ', ex);
			}
		}
	}
	
}

// start - globals for my main stuff

// end - globals

try {
	main();
} catch(ex) {
	throw ex;
} finally {
	shutdown();
}