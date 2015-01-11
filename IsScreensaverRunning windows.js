Cu.import('resource://gre/modules/ctypes.jsm')

var wintypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.bool;
	this.DWORD = ctypes.uint32_t;
	this.PVOID = ctypes.voidptr_t;
	this.UINT = ctypes.unsigned_int;

	// CONSTANTS
	this.SPI_GETSCREENSAVERRUNNING = 0x0072;
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
}
// end - predefine your declares here

// start - helper functions
function IsScreensaverRunning() {
	var result = ostypes.DWORD();
	var rez_SystemParametersInfo = _dec('SystemParametersInfo')(ostypes.SPI_GETSCREENSAVERRUNNING, 0, result.address(), 0);
	console.info('rez_SystemParametersInfo:', rez_SystemParametersInfo, rez_SystemParametersInfo.toString(), uneval(rez_SystemParametersInfo));
	console.info('result:', result, result.toString(), uneval(result));

	if (!rez_SystemParametersInfo) {
		throw new Error('An error occured in SystemParametersInfo, ctypes.winLastError: ' + ctypes.winLastError);
	} else {
		return result.value != 0;
	}
}
// end - helper functions

function shutdown() {
	// do in here what you want to do before shutdown
	
	for (var l in lib) {
		lib[l].close();
	}
}

function main() {
	//do code here
	var rez_IsScreensaverRunning = IsScreensaverRunning();
	console.info('rez_IsScreensaverRunning:', rez_IsScreensaverRunning, rez_IsScreensaverRunning.toString(), uneval(rez_IsScreensaverRunning));
}

try {
	main();
} catch(ex) {
	throw ex;
} finally {
	shutdown();
}