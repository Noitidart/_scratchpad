Cu.import('resource://gre/modules/ctypes.jsm')

var wintypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.int;
	this.DWORD = ctypes.unsigned_long;
	this.HRESULT = ctypes.long;
	this.HWND = ctypes.voidptr_t;
	this.INT = ctypes.INT;
	this.PCIDLIST_ABSOLUTE = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L115
	this.PIDLIST_ABSOLUTE = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L106
	this.ULONG = ctypes.unsigned_long;
	this.VARTYPE = ctypes.unsigned_short;
	this.VOIDPTR = ctypes.voidptr_t
	this.WCHAR = ctypes.jschar;
	this.WIN32_FIND_DATA = ctypes.voidptr_t;
	this.WORD = ctypes.unsigned_short;
	
	// ADVANCED TYPES (ones that are based on the basic types)
	this.LPTSTR = new ctypes.PointerType(WCHAR);
	this.LPCTSTR = LPTSTR;
	this.LPWSTR = new ctypes.PointerType(WCHAR);
	this.LPCWSTR = LPWSTR;
	this.LPOLESTR = LPWSTR;
	this.LPCOLESTR = LPOLESTR;
	 
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
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/bb773381%28v=vs.85%29.aspx
	* typedef struct {
	*   GUID  fmtid;
	*   DWORD pid;
	* } PROPERTYKEY;
	*/
	this.PROPERTYKEY = ctypes.StructType('PROPERTYKEY', [
		{ 'fmtid': this.GUID },
		{ 'pid': this.DWORD }
	]);
	this.REFPROPERTYKEY = new ctypes.PointerType(this.PROPERTYKEY);	
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/bb773381%28v=vs.85%29.aspx
	* typedef struct PROPVARIANT {
	*   VARTYPE vt;
	*   WORD    wReserved1;
	*   WORD    wReserved2;
	*   WORD    wReserved3;
	*   union {
	*     CHAR              cVal;
	*     UCHAR             bVal;
	*     SHORT             iVal;
	*     USHORT            uiVal;
	*     LONG              lVal;
	*     ULONG             ulVal;
	*     INT               intVal;
	*     UINT              uintVal;
	*     LARGE_INTEGER     hVal;
	*     ULARGE_INTEGER    uhVal;
	*     FLOAT             fltVal;
	*     DOUBLE            dblVal;
	*     VARIANT_BOOL      boolVal;
	*     SCODE             scode;
	*     CY                cyVal;
	*     DATE              date;
	*     FILETIME          filetime;
	*     CLSID             *puuid;
	*     CLIPDATA          *pclipdata;
	*     BSTR              bstrVal;
	*     BSTRBLOB          bstrblobVal;
	*     BLOB              blob;
	*     LPSTR             pszVal;
	*     LPWSTR            pwszVal;
	*     IUnknown          *punkVal;
	*     IDispatch         *pdispVal;
	*     IStream           *pStream;
	*     IStorage          *pStorage;
	*     LPVERSIONEDSTREAM pVersionedStream;
	*     LPSAFEARRAY       parray;
	*     CAC               cac;
	*     CAUB              caub;
	*     CAI               cai;
	*     CAUI              caui;
	*     CAL               cal;
	*     CAUL              caul;
	*     CAH               cah;
	*     CAUH              cauh;
	*     CAFLT             caflt;
	*     CADBL             cadbl;
	*     CABOOL            cabool;
	*     CASCODE           cascode;
	*     CACY              cacy;
	*     CADATE            cadate;
	*     CAFILETIME        cafiletime;
	*     CACLSID           cauuid;
	*     CACLIPDATA        caclipdata;
	*     CABSTR            cabstr;
	*     CABSTRBLOB        cabstrblob;
	*     CALPSTR           calpstr;
	*     CALPWSTR          calpwstr;
	*     CAPROPVARIANT     capropvar;
	*     CHAR              *pcVal;
	*     UCHAR             *pbVal;
	*     SHORT             *piVal;
	*     USHORT            *puiVal;
	*     LONG              *plVal;
	*     ULONG             *pulVal;
	*     INT               *pintVal;
	*     UINT              *puintVal;
	*     FLOAT             *pfltVal;
	*     DOUBLE            *pdblVal;
	*     VARIANT_BOOL      *pboolVal;
	*     DECIMAL           *pdecVal;
	*     SCODE             *pscode;
	*     CY                *pcyVal;
	*     DATE              *pdate;
	*     BSTR              *pbstrVal;
	*     IUnknown          **ppunkVal;
	*     IDispatch         **ppdispVal;
	*     LPSAFEARRAY       *pparray;
	*     PROPVARIANT       *pvarVal;
	*   };
	* } PROPVARIANT;
	*/
	this.PROPVARIANT = ctypes.StructType('PROPVARIANT', [
		{'vt': this.VARTYPE},
		{'wReserved1': this.WORD},
		{'wReserved2': this.WORD},
		{'wReserved3': this.WORD},
		// union not supported by js-ctypes
		// https://bugzilla.mozilla.org/show_bug.cgi?id=535378 "You can always
		// typecast pointers, at least as long as you know which type is the biggest"
		{'unionDevShouldSetThis': this.VOIDPTR }
	]);
	this.REFPROPVARIANT = new ctypes.PointerType(this.PROPVARIANT);
	
	// CONSTANTS
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
			case 'x11':
				try {
					lib[path] = ctypes.open('libX11.so.6');
				} catch (e) {
					try {
						var libName = ctypes.libraryName('X11');
					} catch (e) {
						console.error('Integration Level 1: Could not get libX11 name; not activating', 'e:' + e);
						throw new Error('Integration Level 1: Could not get libX11 name; not activating, e:' + e);
					}

					try {
						lib[path] = ctypes.open(libName);
					} catch (e) {
						console.error('Integration Level 2: Could not get libX11 name; not activating', 'e:' + e);
						throw new Error('Integration Level 2: Could not get libX11 name; not activating, e:' + e);
					}
				}
				break;
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
	SystemParametersInfo: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms724947%28v=vs.85%29.aspx
		 * BOOL WINAPI SystemParametersInfo(
		 *   __in_     UINT uiAction,
		 *   __in_     UINT uiParam,
		 *   __inout_  PVOID pvParam,
		 *   __in_     UINT fWinIni
		 * );
		 */
		return _lib('user32.dll').declare('SystemParametersInfoW', ctypes.winapi_abi,
			ostypes.BOOL,	// return
			ostypes.UINT,	// uiAction
			ostypes.UINT,	// uiParam
			ostypes.PVOID,	// pvParam
			ostypes.UINT	// fWinIni
		);
	}
	CLSIDFromString: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms680589%28v=vs.85%29.aspx
		 * HRESULT CLSIDFromString(
		 *   __in_ LPCOLESTR lpsz,
		 *   __out_ LPCLSID pclsid
		 * );
		*/
		var CLSIDFromString = _lib('Ole32.dll').declare('CLSIDFromString', ctypes.winapi_abi,
			ostypes.HRESULT,	// return
			ostypes.LPCOLESTR,	// lpsz
			ostypes.GUID.ptr	// pclsid
		); 
	}
}
// end - predefine your declares here
function checkHRESULT(hr, funcName) {
	if(hr < 0) {
		throw 'HRESULT ' + hr + ' returned from function ' + funcName;
	}
}
// start - helper functions

// end - helper functions

function shutdown() {
	// do in here what you want to do before shutdown
	
	for (var l in lib) {
		lib[l].close();
	}
}

function main() {
	//do code here
	
	//start - shell link, which i think is needed for all COM due to the `hr = shellLink.QueryInterface(shellLinkPtr, IID_IPropertyStore.address(), propertyStorePtr.address());`
	var IShellLinkWVtbl = new ctypes.StructType('IShellLinkWVtbl');

	const IShellLinkW = new ctypes.StructType('IshellLinkW', [{
		'lpVtbl': IShellLinkWVtbl.ptr
	}]);
	const IShellLinkWPtr = new ctypes.PointerType(IShellLinkW);

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
	
	
	
	var IPropertyStoreVtbl = new ctypes.StructType('IPropertyStoreVtbl');

	var IPropertyStore = new ctypes.StructType('IPropertyStore', [{
		'lpVtbl': IPropertyStoreVtbl.ptr
	}]);
	var IPropertyStorePtr = new ctypes.PointerType(IPropertyStore);

	IPropertyStoreVtbl.define(
		[{
			'QueryInterface': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr,
					ostypes.REFIID,
					ostypes.VOIDPTR
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IPropertyStore.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.ULONG, [
					IPropertyStore.ptr
				]).ptr
		}, {
			'Commit': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr
				]).ptr
		}, {
			'GetAt': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr,
					ostypes.DWORD,			// iProp
					ostypes.PROPERTYKEY.ptr	//*pkey
				]).ptr
		}, {
			'GetCount': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr,
					ostypes.DWORD.ptr	// *cProps
				]).ptr
		}, {
			'GetValue': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr,
					ostypes.REFPROPERTYKEY,		// key
					ostypes.PROPVARIANT.ptr		// *pv
				]).ptr
		}, {
			'SetValue': ctypes.FunctionType(ctypes.stdcall_abi,
				ostypes.HRESULT, [
					IPropertyStore.ptr,
					ostypes.REFPROPERTYKEY,		// key
					ostypes.REFPROPVARIANT		// propvar
				]).ptr
		}]
	);

	
	
	// start - looks like something i would run in _dec or just in main
    var IID_IPropertyStore = new ostypes.GUID();
	var hr;
    hr = CLSIDFromString('{886d8eeb-8cf2-4446-8d02-cdba1dbdcf99}', IID_IPropertyStore.address()); // IID_IPersistFile was on the MSDN page (http://msdn.microsoft.com/en-us/library/windows/desktop/ms687223%28v=vs.85%29.aspx) under Requirements however IID_IPropertyStore was not on its MSDN page (http://msdn.microsoft.com/en-us/library/windows/desktop/bb761474%28v=vs.85%29.aspx) so I got this from github
	console.info('hr:', hr, hr.toString(), uneval(hr));
    checkHRESULT(hr, 'CLSIDFromString (IID_IPropertyStore)');

    propertyStorePtr = new IPropertyStorePtr();
    hr = shellLink.QueryInterface(shellLinkPtr, IID_IPropertyStore.address(), propertyStorePtr.address());
	console.info('hr:', hr, hr.toString(), uneval(hr));
    checkHRESULT(hr, 'QueryInterface (IShellLink->IPersistFile)');
    propertyStore = propertyStorePtr.contents.lpVtbl.contents;
	// end - looks like something i would run in _dec or just in main
	
	
}

try {
	main();
} catch(ex) {
	throw ex;
} finally {
	shutdown();
}