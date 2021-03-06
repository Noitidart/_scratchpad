Cu.import('resource://gre/modules/ctypes.jsm')
Cu.import('resource://gre/modules/osfile.jsm')

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

	var IShellLinkW = new ctypes.StructType('IShellLinkW', [{
		'lpVtbl': IShellLinkWVtbl.ptr
	}]);
	this.IShellLinkWPtr = new ctypes.PointerType(IShellLinkW);

	IShellLinkWVtbl.define(
		[{ //start inherit from IUnknown
			'QueryInterface': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.REFIID,	// riid
					this.VOIDPTR	// **ppvObject
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IShellLinkW.ptr
				]).ptr
		}, { //end inherit from IUnknown //start IShellLinkW
			'GetPath': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPTSTR,				// pszFile
					this.INT,					// cchMaxPath
					this.WIN32_FIND_DATA.ptr,	// *pfd
					this.DWORD					// fFlags
				]).ptr
		}, {
			'GetIDList': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.PIDLIST_ABSOLUTE.ptr	// *ppidl
				]).ptr
		}, {
			'SetIDList': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.PCIDLIST_ABSOLUTE	// pidl
				]).ptr
		}, {
			'GetDescription': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPTSTR,	// pszName
					this.INT		// cchMaxName
				]).ptr
		}, {
			'SetDescription': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR		// pszName
				]).ptr
		}, {
			'GetWorkingDirectory': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPTSTR,		// pszDir
					this.INT			// cchMaxPath
				]).ptr
		}, {
			'SetWorkingDirectory': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR
				]).ptr
		}, {
			'GetArguments': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPTSTR,	// pszArgs
					this.INT		// cchMaxPath
				]).ptr
		}, {
			'SetArguments': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR		// pszArgs
				]).ptr
		}, {
			'GetHotKey': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.WORD.ptr	// *pwHotkey
				]).ptr
		}, {
			'SetHotKey': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.WORD	// wHotkey
				]).ptr
		}, {
			'GetShowCmd': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.INT.ptr		// *piShowCmd
				]).ptr
		}, {
			'SetShowCmd': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.INT		// iShowCmd
				]).ptr
		}, {
			'GetIconLocation': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPTSTR,	// pszIconPath
					this.INT,		// cchIconPath
					this.INT.ptr	// *piIcon
				]).ptr
		}, {
			'SetIconLocation': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR,	// pszIconPath
					this.INT		// iIcon
				]).ptr
		}, {
			'SetRelativePath': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR,	// pszPathRel
					this.DWORD		// dwReserved
				]).ptr
		}, {
			'Resolve': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.HWND,	// hwnd
					this.DWORD	// fFlags
				]).ptr
		}, {
			'SetPath': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IShellLinkW.ptr,
					this.LPCTSTR	// pszFile
				]).ptr
		}]
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
				this.HRESULT, [
					IPersistFile.ptr,
					this.REFIID,	// riid
					this.VOIDPTR	// **ppvObject
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IPersistFile.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IPersistFile.ptr
				]).ptr
		}, { //end inherit from IUnknown //start inherit from IPersist
			'GetClassID': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
					this.CLSID.ptr	// *pClassID
				]).ptr
		}, { //end inherit from IPersist // start IPersistFile
			'IsDirty': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
				]).ptr
		}, {
			'Load': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
					this.LPCOLESTR,	// pszFileName
					this.DWORD		// dwMode
				]).ptr
		}, {
			'Save': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
					this.LPCOLESTR,	// pszFileName
					this.BOOL		// fRemember
				]).ptr
		}, {
			'SaveCompleted': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
					this.LPCOLESTR	// pszFileName
				]).ptr
		}, {
			'GetCurFile': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPersistFile.ptr,
					this.LPOLESTR.ptr	// *ppszFileName
				]).ptr
		}
	]);
	// end - IPersistFile

	// CONSTANTS
	this.COINIT_APARTMENTTHREADED = 0x2; //https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm
	this.CLSCTX_INPROC_SERVER = 0x1;
	this.S_OK = new this.HRESULT(0); // http://msdn.microsoft.com/en-us/library/windows/desktop/aa378137%28v=vs.85%29.aspx
	this.S_FALSE = new this.HRESULT(1); // http://msdn.microsoft.com/en-us/library/windows/desktop/aa378137%28v=vs.85%29.aspx
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
	CoUninitialize: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms688715%28v=vs.85%29.aspx
		 * void CoUninitialize(void);
		 */
		return _lib('Ole32.dll').declare('CoUninitialize', ctypes.winapi_abi,
			ostypes.VOID	// return
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

var cancelFinally;
// main globals
var shouldUninitialize;
var shellLink;
var shellLinkPtr;
var persistFile;
var persistFilePtr;

function main() {
	//do code here

	var hr_CoInitializeEx = ostypes.HRESULT(_dec('CoInitializeEx')(null, ostypes.COINIT_APARTMENTTHREADED));
	console.info('hr_CoInitializeEx:', hr_CoInitializeEx, hr_CoInitializeEx.toString(), uneval(hr_CoInitializeEx));
	if(ostypes.S_OK.toString() == hr_CoInitializeEx.toString() || ostypes.S_FALSE.toString() == hr_CoInitializeEx.toString()) {
		shouldUninitialize = true;
	} else {
		throw('Unexpected return value from CoInitializeEx: ' + hr);
	}
	
	var CLSID_ShellLink = new ostypes.GUID();
	var hr_CLSID_ShellLink = _dec('CLSIDFromString')('{00021401-0000-0000-C000-000000000046}', CLSID_ShellLink.address());
	console.info('hr_CLSID_ShellLink:', hr_CLSID_ShellLink, hr_CLSID_ShellLink.toString(), uneval(hr_CLSID_ShellLink));
	checkHRESULT(hr_CLSID_ShellLink, 'CLSIDFromString (CLSID_ShellLink)');
	console.info('CLSID_ShellLink:', CLSID_ShellLink, CLSID_ShellLink.toString(), uneval(CLSID_ShellLink));
	
	var IID_IShellLink = new ostypes.GUID();
	hr_IID_IShellLink = _dec('CLSIDFromString')('{000214F9-0000-0000-C000-000000000046}', IID_IShellLink.address());
	console.info('hr_IID_IShellLink:', hr_IID_IShellLink, hr_IID_IShellLink.toString(), uneval(hr_IID_IShellLink));
	checkHRESULT(hr_IID_IShellLink, 'CLSIDFromString (IID_ShellLink)');
	console.info('IID_IShellLink:', IID_IShellLink, IID_IShellLink.toString(), uneval(IID_IShellLink));

	shellLinkPtr = new ostypes.IShellLinkWPtr();
	var hr_CoCreateInstance = _dec('CoCreateInstance')(CLSID_ShellLink.address(), null, ostypes.CLSCTX_INPROC_SERVER, IID_IShellLink.address(), shellLinkPtr.address());
	console.info('hr_CoCreateInstance:', hr_CoCreateInstance, hr_CoCreateInstance.toString(), uneval(hr_CoCreateInstance));
	checkHRESULT(hr_CoCreateInstance, 'CoCreateInstance');
	shellLink = shellLinkPtr.contents.lpVtbl.contents;

	var IID_IPersistFile = new ostypes.GUID();
	var hr_IID_IPersistFile =_dec('CLSIDFromString')('{0000010b-0000-0000-C000-000000000046}', IID_IPersistFile.address());
	console.info('hr_IID_IPersistFile:', hr_IID_IPersistFile, hr_IID_IPersistFile.toString(), uneval(hr_IID_IPersistFile));
	checkHRESULT(hr_IID_IPersistFile, 'CLSIDFromString (IID_IPersistFile)');
	console.info('IID_IPersistFile:', IID_IPersistFile, IID_IPersistFile.toString(), uneval(IID_IPersistFile));
	
	persistFilePtr = new ostypes.IPersistFilePtr();
	var hr_shellLinkQI = shellLink.QueryInterface(shellLinkPtr, IID_IPersistFile.address(), persistFilePtr.address());
	console.info('hr_shellLinkQI:', hr_shellLinkQI, hr_shellLinkQI.toString(), uneval(hr_shellLinkQI));
	checkHRESULT(hr_shellLinkQI, 'QueryInterface (IShellLink->IPersistFile)');
	persistFile = persistFilePtr.contents.lpVtbl.contents;
	
	var shortcutFile = OS.Path.join(OS.Constants.Path.desktopDir, 'jsctypes.lnk'); // string path, must end in .lnk
	var targetFile = FileUtils.getFile('XREExeF', []).path; // string path
	var workingDir = null; // string path // from MSDN: The working directory is optional unless the target requires a working directory. For example, if an application creates a Shell link to a Microsoft Word document that uses a template residing in a different directory, the application would use this method to set the working directory.
	var args = '-P -no-remote'; // command line arguments // string
	var description = 'my sc via jsctypes'; // string
	var iconFile = OS.Path.join(OS.Constants.Path.desktopDir, 'ppbeta.ico'); // string path
	var iconIndex = null; // integer
	
	cancelFinally = true;
	
	//will overwrite existing
	var promise_checkExists = OS.File.exists(shortcutFile);
	promise_checkExists.then(
		function(aVal) {
			console.log('Fullfilled - promise_checkExists - ', aVal);

			if (aVal) {
				//exists
				var hr_Load = persistFile.Load(persistFilePtr, shortcutFile, 0);
				console.info('hr_Load:', hr_Load, hr_Load.toString(), uneval(hr_Load));
				checkHRESULT(hr_Load, 'Load');
			}

			if(targetFile) {
				var hr_SetPath = shellLink.SetPath(shellLinkPtr, targetFile);
				console.info('hr_SetPath:', hr_SetPath, hr_SetPath.toString(), uneval(hr_SetPath));
				checkHRESULT(hr_SetPath, 'SetPath');
			}

			if(workingDir) {
				var hr_SetWorkingDirectory = shellLink.SetWorkingDirectory(shellLinkPtr, workingDir);
				console.info('hr_SetWorkingDirectory:', hr_SetWorkingDirectory, hr_SetWorkingDirectory.toString(), uneval(hr_SetWorkingDirectory));
				checkHRESULT(hr, 'SetWorkingDirectory');
			}

			if(args) {
				var hr_SetArguments = shellLink.SetArguments(shellLinkPtr, args);
				console.info('hr_SetArguments:', hr_SetArguments, hr_SetArguments.toString(), uneval(hr_SetArguments));
				checkHRESULT(hr_SetArguments, 'SetArguments');
			}

			if(description) {
				var hr_SetDescription = shellLink.SetDescription(shellLinkPtr, description);
				console.info('hr_SetDescription:', hr_SetDescription, hr_SetDescription.toString(), uneval(hr_SetDescription));
				checkHRESULT(hr_SetDescription, 'SetDescription');
			}

			if(iconFile) {
				var hr_SetIconLocation = shellLink.SetIconLocation(shellLinkPtr, iconFile, iconIndex? iconIndex : 0);
				console.info('hr_SetIconLocation:', hr_SetIconLocation, hr_SetIconLocation.toString(), uneval(hr_SetIconLocation));
				checkHRESULT(hr_SetIconLocation, 'SetIconLocation');
			}

			var hr_Save = persistFile.Save(persistFilePtr, shortcutFile, -1);
			console.info('hr_Save:', hr_Save, hr_Save.toString(), uneval(hr_Save));
			checkHRESULT(hr_Save, 'Save');
			
			console.log('Shortcut succesfully created');
			
			shutdown();
			
		},
		function(aReason) {
			var refObj = {name:'promise_checkExists', aReason:aReason};
			console.error('Rejected - promise_checkExists - ', refObj);
			//throw refObj; //dont throw as this is reject of final promise
			shutdown();
		}
	).catch(
		function(aCaught) {
			console.error('Caught - promise_checkExists - ', aCaught);
			// throw aCaught;
			shutdown();
		}
	);
	
}

// start - globals for my main stuff

// end - globals

try {
	main();
} catch(ex) {
	throw ex;
} finally {
	if (!cancelFinally) {
		shutdown();
	}
}