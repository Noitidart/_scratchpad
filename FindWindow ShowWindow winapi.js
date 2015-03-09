Cu.import('resource://gre/modules/ctypes.jsm')

var wintypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.BOOL = ctypes.bool;
  this.LPCTSTR = ctypes.jschar.ptr;
	this.HWND = ctypes.voidptr_t;
	this.INT = ctypes.int;
  
	// CONSTANTS
	this.SW_HIDE = 0;
	this.SW_SHOW = 5;
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
  FindWindow: function() {
		/* https://msdn.microsoft.com/en-us/library/windows/desktop/ms633499%28v=vs.85%29.aspx
		 * HWND WINAPI FindWindow(
		 *   __in_opt_  LPCTSTR lpClassName,
		 *   __in_opt_  LPCTSTR lpWindowName
		 * );
		 */
    /*
    return _lib('user32.dll').declare("FindWindowW", ctypes.winapi_abi,
    	ctypes.int32_t, // ctypes.ArrayType(ctypes.jschar),
    	ctypes.int32_t, // Because NULL is used:
    	ctypes.ArrayType(ctypes.jschar)
    );
    */
		return _lib('user32.dll').declare('FindWindowW', ctypes.winapi_abi,
			ostypes.HWND,			// return
			ostypes.LPCTSTR,	// lpClassName
			ostypes.LPCTSTR		// lpWindowName
		);
  },
  ShowWindow: function() {
		/* https://msdn.microsoft.com/en-us/library/windows/desktop/ms633548%28v=vs.85%29.aspx
		 * BOOL WINAPI ShowWindow(
		 *   __in_  HWND hWnd,
		 *   __in_  int nCmdShow
		 * );
		 */
		return _lib('user32.dll').declare('ShowWindow', ctypes.winapi_abi,
			ostypes.BOOL,	// return
			ostypes.HWND,	// hWnd
			ostypes.INT		// nCmdShow
		);
	}
}
// end - predefine your declares here

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
	
	// get hwnd
	var hwnd = _dec('FindWindow')(null, 'Sound Recorder');
	// end get hwnd
	
  if (hwnd.isNull()) {
    console.warn('no window found with specified lpClassName/lpWindowName');
  } else {
    var rez_ShowWindow = _dec('ShowWindow')(hwnd, ostypes.SW_HIDE);
    console.info('rez_ShowWindow:', rez_ShowWindow, rez_ShowWindow.toString(), uneval(rez_ShowWindow));
    if (rez_ShowWindow == true) {
      console.log('window succesfully hidden');
    } else if (rez_ShowWindow == false) {
      console.warn('window failed to hide, it may already be hidden');
    } else {
      throw new Error('ShowWindow returned not false or true, this should never happen, if it did it should crash');
    }
  }
}

try {
	main();
} catch(ex) {
	throw ex;
} finally {
	shutdown();
}