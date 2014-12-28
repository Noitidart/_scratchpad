Cu.import('resource://gre/modules/ctypes.jsm')

var nixtypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.CHAR = ctypes.char;
	this.DISPLAY = new ctypes.StructType('Display');
	this.INT = ctypes.int;
	
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
	var nullChar = ctypes.cast(ostypes.NULL, ostypes.CHAR.ptr); //because XOpenDisplay 1st arg needs ostypes.CHAR.ptr --> ostypes.NULL has to be cased to char null 
	var nullDisplay = ctypes.cast(ostypes.NULL, ostypes.DISPLAY.ptr);
	console.log('nullDisplay:', uneval(nullDisplay));
	var rez_XOpenDisplay = _dec('XOpenDisplay')(nullChar);
	console.log('debug-msg :: rez_XOpenDisplay:', rez_XOpenDisplay, uneval(rez_XOpenDisplay));
	// when rez_XOpenDisplay is null it is CData of `Display.ptr(ctypes.UInt64("0x0"))"`
	/* //this block works, im just commenting it out as its learning, see comment within
	if (rez_XOpenDisplay.toString() == nullDisplay.toString()) { //the other way to .isNull to test is cast ostypes.NULL to display pt as that is the return of XOpenDisplay and then compare the toString as per docs: https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/Using_js-ctypes/Working_with_data#Determining_if_two_pointers_are_equal
		console.log('its null')
	}
	*/
	if (rez_XOpenDisplay.isNull()) {
		//throw new Error('XOpenDisplay failed to open display');
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
	//if (!(GetXDisplay().isNull && GetXDisplay().isNull())) {
	if (GetXDisplay() && GetXDisplay().isNull && !GetXDisplay().isNull()) {
		console.log('closing disp');
		var rez_XCloseDisplay = _dec('XCloseDisplay')(GetXDisplay()); //it seems like XCloseDisp returns 0 on success, docs dont clarify that, they just say that XCloseDisplay can "generate" BadGC (they dont clarify what generate means return) // http://stackoverflow.com/questions/23083523/what-does-xclosedisplay-return
		console.log('debug-msg :: rez_XCloseDisplay:', rez_XCloseDisplay, uneval(rez_XCloseDisplay));
		if (rez_XCloseDisplay == ostypes.BADGC) {
			throw new Error('XCloseDisplay failed with error code BadGC');
		}
	} else {
		console.warn('no need to close disp');
	}
	
	for (var l in lib) {
		lib[l].close();
	}
}

function main() {
	GetXDisplay();
}

try {
	main();
} catch(ex) {
	console.log(ex);
} finally {
	shutdown();
}