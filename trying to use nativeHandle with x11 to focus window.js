Cu.import('resource://gre/modules/ctypes.jsm')

var nixtypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.ATOM = ctypes.unsigned_long;
	this.BOOL = ctypes.int;
	this.CHAR = ctypes.char;
	this.DATA = ctypes.voidptr_t;
	this.DISPLAY = new ctypes.StructType('Display');
	this.INT = ctypes.int;
	this.LONG = ctypes.long;
	this.STATUS = ctypes.int;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	this.WINDOW = ctypes.unsigned_long;
	
	// ADVANCED TYPES (ones that are equal to something predefined by me)
	/* http://www.man-online.org/page/3-XClientMessageEvent/
	 * typedef struct {
	 *   int			type;		// ClientMessage
     *   unsigned long	serial;		// # of last request processed by server
     *   Bool			send_event;	// true if this came from a SendEvent request
     *   Display		*display;	// Display the event was read from
     *   Window			window;
     *   Atom			message_type;
     *   int			format;
     *   union {
     *     char			b[20];
     *     short		s[10];
     *     long			l[5];
     *   } data;
	 * } XClientMessageEvent; 
	 */
	 this.XCLIENTMESSAGEEVENT = new ctypes.StructType('XClientMessageEvent', [
		{ 'type': ctypes.int },				// ClientMessage
		{ 'serial': ctypes.unsigned_long },	// # of last request processed by server
		{ 'send_event': this.BOOL },		// true if this came from a SendEvent request
		{ 'display': this.DISPLAY.ptr },	// Display the event was read from
		{ 'window': this.WINDOW },
		{ 'message_type': this.ATOM },
		{ 'format': ctypes.int },
		{ 'l0': ctypes.long },
		{ 'l1': ctypes.long },
		{ 'l2': ctypes.long },
		{ 'l3': ctypes.long },
		{ 'l4': ctypes.long }
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
	DefaultRootWindow: function() {
		// MACRO
		/* http://www.xfree86.org/4.4.0/DefaultRootWindow.3.html
		 * Window DefaultRootWindow(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XDefaultRootWindow', ctypes.default_abi,
			ostypes.WINDOW,		// return
			ostypes.DISPLAY.ptr	// *display
		);
	},
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
	XFlush: function() {
		/* http://www.xfree86.org/4.4.0/XFlush.3.html
		 * int XFlush(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XFlush', ctypes.default_abi,
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
	XInternAtom: function() {
		/* http://www.xfree86.org/4.4.0/XInternAtom.3.html
		 * Atom XInternAtom(
		 *   Display	*display,
		 *   char		*atom_name,
		 *   Bool		only_if_exists
		 * );
		 */
		 return _lib('x11').declare('XInternAtom', ctypes.default_abi,
			ostypes.ATOM,			// return
			ostypes.DISPLAY.ptr,	// *display
			ostypes.CHAR.ptr,		// *atom_name
			ostypes.BOOL			// only_if_exists
		);
	},
	XMapRaised: function() {
		/* http://www.xfree86.org/4.4.0/XMapRaised.3.html
		 * int XMapRaised(
		 *   Display *display
		 *   Window w
		 * );
		 */
		return _lib('x11').declare('XMapRaised', ctypes.default_abi,
			ostypes.DISPLAY.ptr,	// return
			ostypes.WINDOW			// *display_name
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
	},
	XSendEvent: function() {
		/* http://www.xfree86.org/4.4.0/XSendEvent.3.html
		 * Status XSendEvent(
		 *   Display *display,
		 *   Window w,
		 *   Bool propagate,
		 *   long event_mask,
		 *   XEvent *event_send
		 * ); 
		 */
		return _lib('x11').declare('XSendEvent', ctypes.default_abi,
			ostypes.STATUS,					// return
			ostypes.DISPLAY.ptr,			// *display
			ostypes.WINDOW,					// w
			ostypes.BOOL,					// propagate
			ostypes.LONG,					// event_mask
			ostypes.XCLIENTMESSAGEEVENT.ptr	// event_sent*
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
	var tWin = Services.wm.getMostRecentWindow('navigator:browser');
	if (!tWin) {
		throw new Error('getMostRecentWindow failed to find a window');
	}
	var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem).treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIBaseWindow);
	var cHwnd = ostypes.WINDOW(tBaseWin.nativeHandle);
	console.info('debug-msg :: cHwnd : ', cHwnd, uneval(cHwnd), cHwnd.toString());
	
	
	var rootWin = XDefaultRootWindow(GetXDisplay());
	var event = new ostypes.XCLIENTMESSAGEEVENT();
	event.type = 33;
	event.serial = 0;
	event.send_event = 1;
	event.message_type = _dec('XInternAtom')(GetXDisplay(), '_NET_ACTIVE_WINDOW', 0);
	event.display = GetXDisplay();
	event.window = cHwnd;
	event.format = 32;
	event.l0 = 2;
	var mask = 1 << 20 /* SubstructureRedirectMask */ | 1 << 19 /* SubstructureNotifyMask */ ;
	if (_dec('XSendEvent')(GetXDisplay(), rootWin, 0, mask, event.address())) {
		_dec('XMapRaised')(GetXDisplay(), cHwnd);
		_dec('XFlush')(GetXDisplay());
		console.log('Activated successfully');
	} else {
		console.warn('An error occurred activating the window');
	}
}

try {
	main();
} catch(ex) {
	console.error(ex);
} finally {
	shutdown();
}