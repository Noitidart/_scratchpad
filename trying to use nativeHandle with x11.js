Cu.import('resource://gre/modules/ctypes.jsm')

var nixtypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.ATOM = ctypes.unsigned_long;
	this.CHAR = ctypes.char;
	this.DATA = ctypes.voidptr_t;
	this.DISPLAY = new ctypes.StructType('Display');
	this.INT = ctypes.int;
	this.STATUS = ctypes.int;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	this.WINDOW = ctypes.unsigned_long;
	
	// ADVANCED TYPES (ones that are equal to something predefined by me)
	/* http://www.man-online.org/page/3-XTextProperty/
	 * typedef struct {
	 *   unsigned char	*value;		// property data
	 *   Atom			encoding;	// type of property
	 *   int			format;		// 8, 16, or 32
	 *   unsigned long	nitems;		// number of items in value
	 * );
	 */
	this.XTEXTPROPERTY = ctypes.StructType('XTextProperty', [
		{ value: this.UNSIGNED_CHAR.ptr },	// *value
		{ encoding: this.ATOM },			// encoding
		{ format: this.INT },				// format
		{ nitems: this.UNSIGNED_LONG }		// nitems
	]);
	
	// CONSTANTS
	this.BADGC = 13;
	this.NULL = ctypes.cast(ctypes.uint64_t(0x0), ctypes.voidptr_t);
}
var ostypes = new nixtypesInit();
console.log('ostypes.NULL:', ostypes.NULL, uneval(ostypes.NULL))
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

// declares in this worker, i set them all = to null for the scratchpad because i may declare it wrong and it wont re-declare unless if it first the var is !
var dec = {};
function _dec(declaration) { // it means ensureDeclared and return declare. if its not declared it declares it. else it returns the previously declared.
	if (!(declaration in dec)) {
		dec[declaration] = preDec[declaration](); //if declaration is not in preDec then dev messed up
	}
	return dec[declaration];
}

var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev // do it alphabateized by key so its ez to look through
	XCloseDisplay: function() {
		/* http://www.xfree86.org/4.4.0/XCloseDisplay.3.html
		 * int XCloseDisplay(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XCloseDisplay', ctypes.default_abi,
			ostypes.INT,		// return
			ostypes.DISPLAY.ptr	// *display
		);
	},
	XFree: function() {
		/* http://www.xfree86.org/4.4.0/XFree.3.html
		 * int XFree(
		 *   void	*data
		 * );
		 */
		return _lib('x11').declare('XFree', ctypes.default_abi,
			ostypes.INT,	// return
			ostypes.DATA	// *data
		);
	},
	XGetWMName: function() {
		/* http://www.xfree86.org/4.4.0/XGetWMName.3.html
		 * Status XGetWMName(
		 *   Display		*display,
		 *   Window			w,
		 *   XTextProperty	*text_prop_return 
		 * );
		 * The XGetWMName convenience function calls XGetTextProperty to obtain the WM_NAME property. It returns a nonzero status on success; otherwise, it returns a zero status.
		 */
		 return _lib('x11').declare('XGetWMName', ctypes.default_abi,
			ostypes.STATUS,				// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.WINDOW,				// w
			ostypes.XTEXTPROPERTY.ptr	// *text_prop_return
		);
	},
	XOpenDisplay: function() {
		/* http://www.xfree86.org/4.4.0/XOpenDisplay.3.html
		 * Display *XOpenDisplay(
		 *   char	*display_name
		 * );
		 */
		return _lib('x11').declare('XOpenDisplay', ctypes.default_abi,
			ostypes.DISPLAY.ptr,	// return
			ostypes.CHAR.ptr		// *display_name
		); 
	}
}

function OpenNewXDisplay() {
	var nullChar = ctypes.cast(ostypes.NULL, ostypes.CHAR.ptr);
	var rez_XOpenDisplay = _dec('XOpenDisplay')(nullChar);
	if (rez_XOpenDisplay.isNull()) {
		throw new Error('XOpenDisplay failed to open display');
	}
	return rez_XOpenDisplay;
}

var GetXDisplayConst = undefined; //ostypes.DISPLAY // runtime defined constants
function GetXDisplay() {
	if (!GetXDisplayConst) {
		GetXDisplayConst = OpenNewXDisplay();
	}
	return GetXDisplayConst;
}

function shutdown() {
	if (GetXDisplay() && GetXDisplay().isNull && !GetXDisplay().isNull()) {
		var rez_XCloseDisplay = _dec('XCloseDisplay')(GetXDisplay());
		if (rez_XCloseDisplay != 0) {
			throw new Error('XCloseDisplay failed with error code: ' + rez_XCloseDisplay);
		}
	}
	
	for (var l in lib) {
		lib[l].close();
	}
}

function main() {
	var tWin = Services.wm.getMostRecentWindow(null);
	var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem).treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIBaseWindow);
	var cHwnd = ostypes.WINDOW(tBaseWin.nativeHandle);
	console.info('debug-msg :: cHwnd : ', cHwnd, uneval(cHwnd), cHwnd.toString());
	
	var prop = new ostypes.XTEXTPROPERTY();
	var rez_XGetWMName = _dec('XGetWMName')(GetXDisplay(), cHwnd, prop.address());

	if (rez_XGetWMName == 0) { //on success it is non-0
		console.warn('debug-msg :: XGetWMName failed due to error maybe, rez_XGetWMName:', rez_XGetWMName, uneval(rez_XGetWMName));
		return false;
	}

	console.info('debug-msg :: prop:', prop, uneval(prop));
	console.info('debug-msg :: prop.value:', prop.value, uneval(prop.value));

	if (prop.value.isNull()) {
		console.log('debug-msg :: cHwnd does not have a name');
		return false;
	} else {
		console.info('debug-msg :: cHwnd has a name it is:', prop.value.readString());
		//chromium does XFree(prop.value) but in my github searches i see this is only done if they do a `Xutf8TextPropertyToTextList` then they do XFree on prop.value or if they do `XmbTextPropertyToTextList` they they use `XFreeStringList`
		//so i dont think i have to: but i just do it to see what the free ret value is on it
		var rez_XFree = _dec('XFree')(prop.value);
		console.log('debug-msg :: rez_XFree:', rez_XFree, uneval(rez_XFree));
		return true;
	}
}

try {
	main();
} catch(ex) {
	console.error(ex);
} finally {
	shutdown();
}