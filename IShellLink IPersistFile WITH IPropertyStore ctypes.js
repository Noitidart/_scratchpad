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
	this.LPOLESTR = this.LPWSTR;
	this.LPCOLESTR = this.LPOLESTR;
	
	this.PCWSTR = new ctypes.PointerType(this.WCHAR);
	this.LPCWSTR = this.PCWSTR;
	
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
	this.PROPERTYKEY = new ctypes.StructType('PROPERTYKEY', [
		{ 'fmtid': this.GUID },
		{ 'pid': this.DWORD }
	]);
	this.REFPROPERTYKEY = new ctypes.PointerType(this.PROPERTYKEY);	// note: if you use any REF... (like this.REFPROPERTYKEY) as an arg to a declare, that arg expects a ptr. this is basically like
	
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
	this.PROPVARIANT = new ctypes.StructType('PROPVARIANT', [
		{'vt': this.VARTYPE},		// constants for this are available at MSDN: http://msdn.microsoft.com/en-us/library/windows/desktop/aa380072%28v=vs.85%29.aspx
		{'wReserved1': this.WORD},
		{'wReserved2': this.WORD},
		{'wReserved3': this.WORD},
		// union not supported by js-ctypes
		// https://bugzilla.mozilla.org/show_bug.cgi?id=535378 "You can always
		// typecast pointers, at least as long as you know which type is the biggest"
		//note: important: pick one of the below and comment out the others: (because js-ctypes doesnt support union)
		{ 'pwszVal': this.LPWSTR } // for InitPropVariantFromString // when using this see notes on MSDN doc page chat of PROPVARIANT ( http://msdn.microsoft.com/en-us/library/windows/desktop/aa380072%28v=vs.85%29.aspx )this guy says: "VT_LPWSTR must be allocated with CoTaskMemAlloc :: (Presumably this also applies to VT_LPSTR) VT_LPWSTR is described as being a string pointer with no information on how it is allocated. You might then assume that the PROPVARIANT doesn't own the string and just has a pointer to it, but you'd be wrong. In fact, the string stored in a VT_LPWSTR PROPVARIANT must be allocated using CoTaskMemAlloc and be freed using CoTaskMemFree. Evidence for this: Look at what the inline InitPropVariantFromString function does: It sets a VT_LPWSTR using SHStrDupW, which in turn allocates the string using CoTaskMemAlloc. Knowing that, it's obvious that PropVariantClear is expected to free the string using CoTaskMemFree. I can't find this explicitly documented anywhere, which is a shame, but step through this code in a debugger and you can confirm that the string is freed by PropVariantClear: ```#include <Propvarutil.h>	int wmain(int argc, TCHAR *lpszArgv[])	{	PROPVARIANT pv;	InitPropVariantFromString(L"Moo", &pv);	::PropVariantClear(&pv);	}```  If  you put some other kind of string pointer into a VT_LPWSTR PROPVARIANT your program is probably going to crash."
		//{ 'boolVal:', this.VARIANT_BOOL } // for use with InitPropVariantFromBoolean
	]);
	this.REFPROPVARIANT = new ctypes.PointerType(this.PROPVARIANT);
	
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

	// start - IPropertyStory
	var IPropertyStoreVtbl = new ctypes.StructType('IPropertyStoreVtbl');
	var IPropertyStore = new ctypes.StructType('IPropertyStore', [{
		'lpVtbl': IPropertyStoreVtbl.ptr
	}]);
	this.IPropertyStorePtr = new ctypes.PointerType(IPropertyStore);

	IPropertyStoreVtbl.define(
		[{ //start inherit from IUnknown
			'QueryInterface': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr,
					this.REFIID,	// riid
					this.VOIDPTR	// **ppvObject
				]).ptr
		}, {
			'AddRef': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IPropertyStore.ptr
				]).ptr
		}, {
			'Release': ctypes.FunctionType(ctypes.stdcall_abi,
				this.ULONG, [
					IPropertyStore.ptr
				]).ptr
		}, { //end inherit from IUnknown //start IPropertyStore
			'GetCount': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr,
					this.DWORD.ptr	// *cProps
				]).ptr
		}, {
			'GetAt': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr,
					this.DWORD,				// iProp
					this.PROPERTYKEY.ptr	//*pkey
				]).ptr
		}, {
			'GetValue': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr,
					this.REFPROPERTYKEY,	// key
					this.PROPVARIANT.ptr	// *pv
				]).ptr
		}, {
			'SetValue': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr,
					this.REFPROPERTYKEY,	// key
					this.REFPROPVARIANT		// propvar
				]).ptr
		}, {
			'Commit': ctypes.FunctionType(ctypes.stdcall_abi,
				this.HRESULT, [
					IPropertyStore.ptr
				]).ptr
		}]
	);
	// end - IPropertyStory
	
	// CONSTANTS
	this.COINIT_APARTMENTTHREADED = 0x2; //https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm
	this.CLSCTX_INPROC_SERVER = 0x1;
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
	CoUninitialize: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms688715%28v=vs.85%29.aspx
		 * void CoUninitialize(void);
		 */
		return _lib('Ole32.dll').declare('CoUninitialize', ctypes.winapi_abi,
			ostypes.VOID	// return
		);
	},
	PropVariantClear: function() {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/aa380073%28v=vs.85%29.aspx
		 * WINOLEAPI PropVariantClear(
		 * __in_ PROPVARIANT *pvar
		 * );
		 */
		return _lib('Ole32.dll').declare('PropVariantClear', ctypes.winapi_abi,
			ostypes.WINOLEAPI,			// return
			ostypes.PROPVARIANT.ptr		// *pvar
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

/* http://msdn.microsoft.com/en-us/library/windows/desktop/bb762305%28v=vs.85%29.aspx
 * NOTE1: I have to write my own InitPropVariantFromString because its not in a dll its defined in a header
 * NOTE2: When using this see notes on MSDN doc page chat of PROPVARIANT ( http://msdn.microsoft.com/en-us/library/windows/desktop/aa380072%28v=vs.85%29.aspx )this guy says: "VT_LPWSTR must be allocated with CoTaskMemAlloc :: (Presumably this also applies to VT_LPSTR) VT_LPWSTR is described as being a string pointer with no information on how it is allocated. You might then assume that the PROPVARIANT doesn't own the string and just has a pointer to it, but you'd be wrong. In fact, the string stored in a VT_LPWSTR PROPVARIANT must be allocated using CoTaskMemAlloc and be freed using CoTaskMemFree. Evidence for this: Look at what the inline InitPropVariantFromString function does: It sets a VT_LPWSTR using SHStrDupW, which in turn allocates the string using CoTaskMemAlloc. Knowing that, it's obvious that PropVariantClear is expected to free the string using CoTaskMemFree. I can't find this explicitly documented anywhere, which is a shame, but step through this code in a debugger and you can confirm that the string is freed by PropVariantClear: ```#include <Propvarutil.h>	int wmain(int argc, TCHAR *lpszArgv[])	{	PROPVARIANT pv;	InitPropVariantFromString(L"Moo", &pv);	::PropVariantClear(&pv);	}```  If  you put some other kind of string pointer into a VT_LPWSTR PROPVARIANT your program is probably going to crash."
 * HRESULT InitPropVariantFromString(
 *   __in_   PCWSTR psz,
 *   __out_  PROPVARIANT *ppropvar
 * );
 */
function InitPropVariantFromString(psz/*ostypes.PCWSTR*/, ppropvar/*ostypes.PROPVARIANT.ptr*/) {
	//console.log('propvarPtr.contents.pwszVal', propvarPtr.contents.pwszVal, propvarPtr.contents.pwszVal.toSource(), uneval(propvarPtr.contents.pwszVal));
	//console.log('propvarPtr', propvarPtr);
	// console.log('propvarPtr.contents.pwszVal', propvarPtr.contents.pwszVal);
	// console.log('propvarPtr.contents.pwszVal.address()', propvarPtr.contents.pwszVal.address());
	
	var hr_SHStrDup = _dec('SHStrDup')(psz, ppropvar.contents.pwszVal.address()); //note in PROPVARIANT defintion `pwszVal` is defined as `LPWSTR` and `SHStrDup` expects second arg as `LPTSTR.ptr` but both `LPTSTR` and `LPWSTR` are defined the same with `ctypes.jschar` so this should be no problem
	console.info('hr_SHStrDup:', hr_SHStrDup, hr_SHStrDup.toString(), uneval(hr_SHStrDup));
	
	// console.log('propvarPtr.contents.pwszVal', propvarPtr.contents.pwszVal);
	checkHRESULT(hr_SHStrDup, 'InitPropVariantFromString -> hr_SHStrDup'); // this will throw if HRESULT is bad

	ppropvar.contents.vt = ostypes.VT_LPWSTR;

	return hr_SHStrDup;
}

// from: http://blogs.msdn.com/b/oldnewthing/archive/2011/06/01/10170113.aspx
function IPropertyStore_SetValue(vtblPpsPtr, pps/*IPropertyStore*/, pkey/*ostypes.REFPROPERTYKEY*/, pszValue/*ostypes.PCWSTR*/) { // i introduced vtblPpsPtr as i need it for js-ctypes
	// returns hr of SetValue, but if hr of it failed it will throw, so i dont have to check the return value
	
	var ppropvar = ostypes.PROPVARIANT();

	var hr_InitPropVariantFromString = InitPropVariantFromString(pszValue, ppropvar.address());
	checkHRESULT(hr_InitPropVariantFromString, 'failed InitPropVariantFromString'); //this will throw if HRESULT is bad

	console.info('pps.SetValue', pps.SetValue);
	var hr_SetValue = pps.SetValue(vtblPpsPtr, pkey, ppropvar.address());
	checkHRESULT(hr_SetValue, 'IPropertyStore_SetValue');
	
	var rez_PropVariantClear = _dec('PropVariantClear')(ppropvar.address());
	console.info('rez_PropVariantClear:', rez_PropVariantClear, rez_PropVariantClear.toString(), uneval(rez_PropVariantClear));

	return hr_SetValue;
}

function IPropertyStore_GetValue(vtblPpsPtr, pps/*IPropertyStore*/, pkey/*ostypes.REFPROPERTYKEY*/, ppropvar /*ostypes.PROPVARIANT*/ /* OR NULL if you want jsstr returned */) {
	// currently setup for String propvariants only, meaning  key pwszVal is populated
	// returns hr of GetValue if a ostypes.PROPVARIANT() is supplied as ppropvar arg
	// returns jsstr if ppropvar arg is not supplied (creates a temp propvariant and clears it for function use)
	
	var ret_js = false;
	if (!ppropvar) {
		ppropvar = ostypes.PROPVARIANT();
		ret_js = true;
	}
	
	console.info('pps.GetValue', pps.GetValue);
	var hr_GetValue = pps.GetValue(vtblPpsPtr, pkey, ppropvar.address());
	checkHRESULT(hr_GetValue, 'IPropertyStore_GetValue');
	
	console.info('ppropvar:', ppropvar, ppropvar.toString(), uneval(ppropvar));
	
	if (ret_js) {
		console.info('ppropvar.pwszVal:', ppropvar.pwszVal, ppropvar.pwszVal.toString(), uneval(ppropvar.pwszVal));
		if (ppropvar.pwszVal.isNull()) {
			console.log('ppropvar.pwszVal is NULL');
			var jsstr = '';
		} else {
			var jsstr = ppropvar.pwszVal.readString();
		}
		
		var rez_PropVariantClear = _dec('PropVariantClear')(ppropvar.address());
		console.info('rez_PropVariantClear:', rez_PropVariantClear, rez_PropVariantClear.toString(), uneval(rez_PropVariantClear));

		return jsstr;
	} else {
		console.warn('remember to clear the PROPVARIANT yourself then');
		return hr_GetValue;
	}
}

var _fmtid = {};
function getFmtid(fmtidStr) {
	//this func is a lazy loader for fmtid's
	//arg fmtidStr is jsstr
	
	if (!(fmtidStr in _fmtid)) {
		var fmtid = new ostypes.GUID();
		var hr_fmtid = _dec('CLSIDFromString')(fmtidStr, fmtid.address());
		checkHRESULT(hr_fmtid);
		_fmtid[fmtidStr] = fmtid;
	}
	return _fmtid[fmtidStr];	
}

var _pkey = {};
function getPkey(fmtidStr, pidInt) {
	//this func is a lazy loader for PKEY's
	//args: fmtidStr is jsstr, pidInt is jsint
	var identifier = fmtidStr + '___' + pidInt; //this is the key i store it by in _pkey
	
	if (!(identifier in _pkey)) {
		_pkey[identifier] = ostypes.PROPERTYKEY(getFmtid(fmtidStr), pidInt);
	}
	return _pkey[identifier];
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
	
	if(propertyStore) {
		try {
			propertyStore.Release(propertyStorePtr);
		} catch(e) {
			console.error("Failure releasing propertyStore: ", e);
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
var propertyStore;
var propertyStorePtr;

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

	var IID_IPropertyStore = new ostypes.GUID();
	var hr_CLSIDFromString_IIDIPropertyStore = _dec('CLSIDFromString')('{886d8eeb-8cf2-4446-8d02-cdba1dbdcf99}', IID_IPropertyStore.address()); // IID_IPersistFile was on the MSDN page (http://msdn.microsoft.com/en-us/library/windows/desktop/ms687223%28v=vs.85%29.aspx) under Requirements however IID_IPropertyStore was not on its MSDN page (http://msdn.microsoft.com/en-us/library/windows/desktop/bb761474%28v=vs.85%29.aspx) so I got this from github
	console.info('hr_CLSIDFromString_IIDIPropertyStore:', hr_CLSIDFromString_IIDIPropertyStore, hr_CLSIDFromString_IIDIPropertyStore.toString(), uneval(hr_CLSIDFromString_IIDIPropertyStore));
	checkHRESULT(hr_CLSIDFromString_IIDIPropertyStore, 'CLSIDFromString (IID_IPropertyStore)');
	console.info('IID_IPropertyStore:', IID_IPropertyStore, IID_IPropertyStore.toString(), uneval(IID_IPropertyStore));
	
	propertyStorePtr = new ostypes.IPropertyStorePtr();
	var hr_shellLinkQI2 = shellLink.QueryInterface(shellLinkPtr, IID_IPropertyStore.address(), propertyStorePtr.address());
	console.info('hr_shellLinkQI2:', hr_shellLinkQI2, hr_shellLinkQI2.toString(), uneval(hr_shellLinkQI2));
	checkHRESULT(hr_shellLinkQI2, 'QueryInterface (IShellLink->IPropertyStore)');
	propertyStore = propertyStorePtr.contents.lpVtbl.contents;
	
	var shortcutFile = OS.Path.join(OS.Constants.Path.desktopDir, 'jsctypes.lnk'); // string path, must end in .lnk
	var targetFile = FileUtils.getFile('XREExeF', []).path; // string path
	var workingDir = null; // string path // from MSDN: The working directory is optional unless the target requires a working directory. For example, if an application creates a Shell link to a Microsoft Word document that uses a template residing in a different directory, the application would use this method to set the working directory.
	var args = '-P -no-remote'; // command line arguments // string
	var description = 'my sc via jsctypes'; // string
	var iconFile = OS.Path.join(OS.Constants.Path.desktopDir, 'ppbeta.ico'); // string path
	var iconIndex = null; // integer
	var systemAppUserModelID = 'rawr45654'; // string
	
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

			if (systemAppUserModelID) {
				var PKEY_AppUserModel_ID = getPkey('{9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3}', 5);
				var hr_systemAppUserModelID = IPropertyStore_SetValue(propertyStorePtr, propertyStore, PKEY_AppUserModel_ID.address(), systemAppUserModelID);		
			}
			
			//lets get the systemAppUserModelID to see what it is
			var PKEY_AppUserModel_ID = getPkey('{9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3}', 5);
			var jsstr_IPSGetValue = IPropertyStore_GetValue(propertyStorePtr, propertyStore, PKEY_AppUserModel_ID.address(), null);
			console.info('jsstr_IPSGetValue:', jsstr_IPSGetValue, jsstr_IPSGetValue.toString(), uneval(jsstr_IPSGetValue));
				
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