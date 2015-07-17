Cu.import('resource://gre/modules/ctypes.jsm');

var nixtypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.ATOM = ctypes.unsigned_long;
	this.BOOL = ctypes.int;
	this.CHAR = ctypes.char;
	this.GDKDRAWABLE = ctypes.StructType('GdkDrawable');
	this.GDKWINDOW = ctypes.StructType('GdkWindow');
	this.DATA = ctypes.voidptr_t;
	this.DISPLAY = new ctypes.StructType('Display');
	this.INT = ctypes.int;
	this.LONG = ctypes.long;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_INT = ctypes.unsigned_int;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	this.XEVENT = ctypes.voidptr_t; //this is just for debugging
	
	// ADVANCED TYPES (ones that are equal to something predefined by me, order matters here, as the basic or pre-advanced type needs to be defined before the type)
	if (/^(Alpha|hppa|ia64|ppc64|s390|x86_64)-/.test(Services.appinfo.XPCOMABI)) { // https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L45 // // http://mxr.mozilla.org/mozilla-central/source/configure.in
		this.CARD32 = this.UNSIGNED_INT;
	} else {
		this.CARD32 = this.UNSIGNED_LONG;
	}
	this.WINDOW = this.CARD32;
	this.XID = this.CARD32;
	this.PIXMAP = this.CARD32;

	// /usr/include/X11/Xutil.h:4867 ????
	// https://github.com/kamcord/kamcord-android-samples/blob/571bf5f4f2627999169ec6ed33ddedcea591d1cd/cocos2d-x-2.2.2/external/emscripten/system/include/X11/Xutil.h#L111
	// http://www.unix.com/man-page/x11r4/3/XWMHints/
	this.XWMHINTS = new ctypes.StructType('XWMHints', [
		{ flags: this.LONG },			// marks which fields in this structure are defined
		{ input: this.BOOL },			// does this application rely on the window manager to get keyboard input?
		{ initial_state: this.INT },	// see below
		{ icon_pixmap: this.PIXMAP },	// pixmap to be used as icon
		{ icon_window: this.WINDOW },	// window to be used as icon
		{ icon_x: this.INT },			// initial position of icon
		{ icon_y: this.INT },			// initial position of icon
		{ icon_mask: this.PIXMAP },		// pixmap to be used as mask for icon_pixmap
		{ window_group: this.XID }		// id of related window group
	]);
	
	// CONSTANTS
	this.ANYPROPERTYTYPE = 0; //AnyPropertyType //this.ATOM(0) // need this jsInt for comparison
	this.BADGC = 13;
	this.BADWINDOW = 3; //# /usr/include/X11/X.h:353
	this.NONE = 0; // leave it at 0 (a jsInt) as simple comparison is done in GetAtom, cuz in GetAtom i do `if (rez == ostypes.NONE)` and if is a number here it works. otherwise its weird. ostypes.ATOM(0) and new ostypes.ATOM(0) both give back CData{ value: UInt64{} } but the XInternAtom even thouh return is ostypes.ATOM it gives back UInt64 &&& doing UInt64 == jsInt seems to work. oin ostypes.ATOM(0).value == returnedUInt64 does not work if i do this then i have to to returnedUInt64.toString() == ostypes.ATOM(0).value.toStrin() so weird
	this.PROPMODEREPLACE = 0; // PropModeReplace
	this.SUCCESS = 0;
	this.XA_CARDINAL = 6; // can do parseInt(GetAtom('CARDINAL').toString())

}
var ostypes = new nixtypesInit();

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
						console.error('Integration Level 1: Could not get libX11 name; not activating', 'e:', e);
						throw new Error('Integration Level 1: Could not get libX11 name; not activating, e:' + e);
					}

					try {
						lib[path] = ctypes.open(libName);
					} catch (e) {
						console.error('Integration Level 2: Could not get libX11 name; not activating', 'e:', e);
						throw new Error('Integration Level 2: Could not get libX11 name; not activating, e:' + e);
					}
				}
				break;
			default:
				try {
					lib[path] = ctypes.open(path);
				} catch (e) {
					console.error('Integration Level 1: Could not get open path:', path, 'e:', e);
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
	gdk_x11_drawable_get_xid: function() {
		/* https://developer.gnome.org/gdk2/stable/gdk2-X-Window-System-Interaction.html#gdk-x11-drawable-get-xid
		 * XID gdk_x11_drawable_get_xid (
		 *   GdkDrawable	*drawable
		 * );
		 */
		return _lib('libgdk-x11-2.0.so.0').declare('gdk_x11_drawable_get_xid', ctypes.default_abi,
			ostypes.XID,				// return
			ostypes.GDKDRAWABLE.ptr		// *drawable
		);
	},
	XAllocWMHints: function() {
		/* http://www.xfree86.org/4.4.0/XAllocWMHints.3.html
		 * XWMHints *XAllocWMHints
		 *   void
		 * );
		 */
		return _lib('x11').declare('XChangeProperty', ctypes.default_abi,
			ostypes.XWMHINTS.ptr		// return
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
	XGetWMHints: function() {
		/* http://www.xfree86.org/4.4.0/XGetWMHints.3.html
		 * int XGetWMHints(
		 *   Display		*display,
		 *   Window			w,
		 *   XWMHints 		*wmhints
		 * );
		 */
		return _lib('x11').declare('XGetWMHints', ctypes.default_abi,
			ostypes.XWMHINTS.ptr,		// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.WINDOW				// w
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
	XSetWMHints: function() {
		/* http://www.xfree86.org/4.4.0/XSetWMHints.3.html
		 * int XSetWMHints(
		 *   Display		*display,
		 *   Window			w,
		 *   XWMHints 		*wmhints
		 * );
		 */
		return _lib('x11').declare('XSetWMHints', ctypes.default_abi,
			ostypes.INT,				// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.WINDOW,				// w
			ostypes.XWMHINTS.ptr		// *wmhints
		);
	}
}

/* start helper functions */
function jscGetDeepest(obj) {
	// used to get the deepest .contents .value and so on. expecting a number object
	//console.info('start jscGetDeepest:', obj.toString());
	while (isNaN(obj) && ('contents' in obj || 'value' in obj)) {
		if ('contents' in obj) {
			obj = obj.contents;
		} else if ('value' in obj) {
			obj = obj.value
		} else {
			throw new Error('huh, isNaN, but no contents or value in obj', 'obj:', obj);
		}
		//console.info('loop jscGetDeepest:', obj.toString());
	}
	//console.info('pre final jscGetDeepest:', obj.toString());
	if (!isNaN(obj)) {
		obj = obj.toString();
	}
	//console.info('finaled jscGetDeepest:', obj.toString());
	return obj;
}

function jscEqual(obj1, obj2) {
	// ctypes numbers equal
	// compares obj1 and obj2
	// if equal returns true, else returns false
	
	// check if equal first
	var str1 = obj1;
	var str2 = obj2;
	
	var str1 = jscGetDeepest(str1); //cuz apparently its not passing by reference
	var str2 = jscGetDeepest(str2); //cuz apparently its not passing by reference
	
	if (str1 == str2) {
		return true;
	} else {
		return false;
	}
}

function OpenNewXDisplay() {
	var rez_XOpenDisplay = _dec('XOpenDisplay')(null);
	console.log('debug-msg :: rez_XOpenDisplay:', rez_XOpenDisplay, uneval(rez_XOpenDisplay));
	// when rez_XOpenDisplay is null it is CData of `Display.ptr(ctypes.UInt64("0x0"))"`
	if (rez_XOpenDisplay.isNull()) {
		throw new Error('XOpenDisplay failed to open display');
	}
	return rez_XOpenDisplay;
}

var GetXDisplayConst = undefined; //ostypes.DISPLAY.ptr // runtime defined constants
function GetXDisplay() {
	if (!GetXDisplayConst) {
		GetXDisplayConst = OpenNewXDisplay(); // returns Display*
	}
	return GetXDisplayConst;
}

var _GetAtomCache = {};
function GetAtom(name, createIfDNE) {
	// createIfDNE is jsBool, true or false. if set to true/1 then the atom is creatd if it doesnt exist. if set to false/0, then an error is thrown when atom does not exist
	// default behavior is throw when atom doesnt exist
	
	// name is ostypes.CHAR.ptr
	// returns ostypes.ATOM
	var onlyIfExists = 1;
	if (createIfDNE) {
		onlyIfExists = 0;
	}
	if (!(name in _GetAtomCache)) {		
		var atom = _dec('XInternAtom')(GetXDisplay(), name, createIfDNE ? 0 : 1); //passing 3rd arg of false, means even if atom doesnt exist it returns a created atom, this can be used with GetProperty to see if its supported etc, this is how Chromium does it
		if (jscEqual(atom, ostypes.NONE)) { //will never equal ostypes.NONE if i pass 3rd arg of `false` to XInternAtom
			console.warn('No atom with name:', name, 'return val of atom:', atom, uneval(atom), atom.toString());
			throw new Error('No atom with name "' + name + '"), return val of atom:"' +  atom + '" toString:"' + atom.toString() + '"');
		}
		_GetAtomCache[name] = atom;
	}
	return _GetAtomCache[name];
}

function xidFromXULWin(aXULWin) {
	if (!aXULWin) {
		throw new Error('No window found, aXULWin is null');
	}
	var aBaseWin = aXULWin.QueryInterface(Ci.nsIInterfaceRequestor)
						  .getInterface(Ci.nsIWebNavigation)
						  .QueryInterface(Ci.nsIDocShellTreeItem)
						  .treeOwner
						  .QueryInterface(Ci.nsIInterfaceRequestor)
						  .getInterface(Ci.nsIBaseWindow);
	var aGDKWindowPtrString = aBaseWin.nativeHandle;
	var aGDKWindowPtr = ostypes.GDKWINDOW.ptr(ctypes.UInt64(aGDKWindowPtrString));
	var aGDKDrawablePtr = ctypes.cast(aGDKWindowPtr, ostypes.GDKDRAWABLE.ptr);
	var aXID = _dec('gdk_x11_drawable_get_xid')(aGDKDrawablePtr); //no need for error checking here as if it doesnt exist it crashes?
	if (jscEqual(aXID, 0)) {
		throw new Error('aXULWin is no longer open, as aXID is 0');
	}
	console.info('aXID:', aXID, aXID.toString(), uneval(aXID));
	return aXID;
}
/* end helper functions */

// my globals:
var libgdk = 'libgdk-x11-2.0.so.0';

function shutdown() {
	if (GetXDisplayConst && GetXDisplayConst.isNull && !GetXDisplayConst.isNull()) {
		console.log('closing disp');
		var rez_XCloseDisplay = _dec('XCloseDisplay')(GetXDisplay()); //it seems like XCloseDisp returns 0 on success, docs dont clarify that, they just say that XCloseDisplay can "generate" BadGC (they dont clarify what generate means return) // http://stackoverflow.com/questions/23083523/what-does-xclosedisplay-return
		console.log('debug-msg :: rez_XCloseDisplay:', rez_XCloseDisplay, uneval(rez_XCloseDisplay));
		if (!jscEqual(rez_XCloseDisplay, 0)) {
			throw new Error('XCloseDisplay failed with error code: "' + rez_XCloseDisplay + '"');
		}
	} else {
		console.warn('no need to close disp');
	}
	
	for (var l in lib) {
		lib[l].close();
	}
}


function main() {
		
	var arg0 = {
		$display:	/*DISPLAY.ptr*/		GetXDisplay(),
		w:			/*WINDOW*/			xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser'))
	};
	var hints = _dec('XGetWMHints')(GetXDisplay(), arg0.w);
	console.info('hints:', hints, hints.toString(), uneval(hints));
	console.info('hints.contents:', hints.contents, hints.contents.toString(), uneval(hints.contents));
	
	if (hints.isNull()) {
		console.warn('this window doesnt have any hints');
	} else if (hints.contents.toString() == ostypes.BADWINDOW.toString()) { // i havent been able to get this error, so im not sure im testing for it in right way
		console.warn('the window passed as argument to get hints does not exist');
	} else {
		// got hints
		
		/*
		// mark urgent:
		var XUrgencyHint = 256; //# /usr/include/X11/Xutil.h:4880
		
		console.log('pre or:', jscGetDeepest(hints.contents.flags));
		var newFlags = parseInt(jscGetDeepest(hints.contents.flags)) | XUrgencyHint;
		console.log('post or:', newFlags);
		
		hints.contents.flags = ostypes.LONG(newFlags);
		*/
		
		/*
		// https://github.com/benizi/config-bin/blob/master/set-icon.py#L66
		# many window managers need a hint that the icon has changed
		# bits 2, 3, and 5 of the WM_HINTS flags int are, respectively:
		# IconPixmapHint, IconWindowHint, and IconMaskHint
		wmhints_type,wmhints_fmt,wmhints_tuple=wmhints
		wmhints_flags = wmhints_tuple[0]
		for member in [2,3,5]:
			if wmhints_flags & (1 << member):
				wmhints_flags ^= 1 << member
				wmhints_tuple[member+1] = 0
		*/
		
		/*
		// http://tronche.com/gui/x/xlib/ICC/client-to-window-manager/wm-hints.html
		#define	InputHint	(1L << 0)
		#define	StateHint	(1L << 1)
		#define	IconPixmapHint	(1L << 2)
		#define	IconWindowHint	(1L << 3)
		#define	IconPositionHint	(1L << 4)
		#define	IconMaskHint	(1L << 5)
		#define	WindowGroupHint	(1L << 6)
		#define	UrgencyHint	(1L << 8)
		#define	AllHints 	(InputHint|StateHint|IconPixmapHint|IconWindowHint|IconPositionHint|IconMaskHint|WindowGroupHint)
		*/
		
		// correct but not used as im trying to match the py
		var IconPixmapHint = 1 << 2;
		var IconWindowHint = 1 << 3;
		var IconMaskHint = 1 << 5;
		
		var IconPixmapHintBits = 2;
		var IconWindowHintBits = 3;
		var IconMaskHintBits = 5;
		
		var newFlags = parseInt(jscGetDeepest(hints.contents.flags));
		var MEMBRS = { // field name in XWMHINTS structure to the bits for its corresponding hint
			icon_pixmap: IconPixmapHintBits,
			icon_window: IconWindowHintBits,
			icon_mask: IconMaskHintBits
		};
		var MEMBRS_TYPE = { // field name in XWMHINTS structure to the corresponding type
			icon_pixmap: ostypes.PIXMAP,
			icon_window: ostypes.XID,
			icon_mask: ostypes.PIXMAP
		};		
		for (var member in MEMBRS) {
			if (newFlags & (1 << MEMBRS[member])) {
				newFlags ^= (1 << MEMBRS[member]);
				console.log('hints.contents.addressOfField(member).contents:', hints.contents.addressOfField(member).contents.toString());
				hints.contents.addressOfField(member).contents = MEMBRS_TYPE[member](0);
			}
		}
		hints.contents.flags = ostypes.LONG(newFlags);
		
		var arg1 = {
			$display:	/*DISPLAY.ptr*/		GetXDisplay(),
			w:			/*WINDOW*/			xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')),
			$wmhints:	/*XWMHINTS.ptr*/	hints
			
		};
		var rez_XSet = _dec('XSetWMHints')(arg1.$display, arg1.w, arg1.$wmhints);
		console.info('rez_XSet:', rez_XSet, rez_XSet.toString(), uneval(rez_XSet));
		
		var rez_XFree = _dec('XFree')(hints);
		console.info('rez_XFree:', rez_XFree, rez_XFree.toString(), uneval(rez_XFree));
	}
	
	//var rez_XFlush = _dec('XFlush')(GetXDisplay());
	//console.info('rez_XFlush:', rez_XFlush, rez_XFlush.toString(), uneval(rez_XFlush));
	
}

try {
	main();
} catch(ex) {
	console.error('error:', ex);
} finally {
	shutdown();
}