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

var lib = {};

function _lib(path) {
	//ensures path is in lib, if its in lib then its open, if its not then it adds it to lib and opens it. returns lib
	//path is path to open library
	//returns lib so can use straight away

	if (!(path in lib)) {
		lib[path] = ctypes.open(path);
	}
	return lib[path];
}

// declares in this worker, i set them all = to null for the scratchpad because i may declare it wrong and it wont re-declare unless if it first the var is !
var SystemParametersInfo = null;

function IsScreensaverRunning() {
	if (!SystemParametersInfo) {
		/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms724947%28v=vs.85%29.aspx
		 * BOOL WINAPI SystemParametersInfo(
		 *   __in_     UINT uiAction,
		 *   __in_     UINT uiParam,
		 *   __inout_  PVOID pvParam,
		 *   __in_     UINT fWinIni
		 * );
		 */
		SystemParametersInfo = _lib('user32.dll').declare('SystemParametersInfoW', ctypes.winapi_abi,
			ostypes.BOOL,		// return
			ostypes.UINT,		// uiAction
			ostypes.UINT,		// uiParam
			ostypes.PVOID,	// pvParam
			ostypes.UINT		// fWinIni
		);
	}

  var result = ostypes.DWORD();
  var rez_SPI = SystemParametersInfo(ostypes.SPI_GETSCREENSAVERRUNNING, 0, result.address(), 0);
  console.info('debug-msg :: rez_SPI:', rez_SPI, uneval(rez_SPI));
  console.info('debug-msg :: result:', result, uneval(result));
  
  if (!rez_SPI) {
  	throw new Error('An error occured in SystemParametersInfo, ctypes.winLastError: ' + ctypes.winLastError);
	} else {
    return result.value != 0;
  }
}

/*
var rez_ISR = IsScreensaverRunning();
console.info('debug-msg :: rez_ISR:', rez_ISR);

for (var l in lib) {
	lib[l].close();
}
*/

setTimeout(function() {
	var rez_ISR = IsScreensaverRunning();
	console.info('debug-msg :: rez_ISR:', rez_ISR);

	for (var l in lib) {
		lib[l].close();
	}
}, 65000);