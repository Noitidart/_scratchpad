Cu.import('resource://gre/modules/ctypes.jsm')

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
	XChangeProperty: function() {
		/* http://www.xfree86.org/4.4.0/XChangeProperty.3.html
		 * int XChangeProperty(
		 *   Display		*display,
		 *   Window			w,
		 *   Atom			property,
		 *   Atom			type,
		 *   int			format,
		 *   int			mode,
		 *   unsigned char	*data,
		 *   int			nelements
		 * );
		 */
		return _lib('x11').declare('XChangeProperty', ctypes.default_abi,
			ostypes.INT,				// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.WINDOW,				// w
			ostypes.ATOM,				// property
			ostypes.ATOM,				// type
			ostypes.INT,				// format
			ostypes.INT,				// mode
			ostypes.UNSIGNED_CHAR.ptr,	// *data
			ostypes.INT					// nelements
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
	XGetWindowProperty: function() {
		/* http://www.xfree86.org/4.4.0/XChangeProperty.3.html
		 * int XChangeProperty(
		 *   Display		*display,
		 *   Window			w,
		 *   Atom			property,
		 *   long			long_offset,
		 *   long			long_length,
		 *   Bool			delete,
		 *   Atom			req_type,
		 *   Atom			*actual_type_return,
		 *   int			*actual_format_return,
		 *   unsigned long	*nitems_return,
		 *   unsigned long	*bytes_after_return,
		 *   unsigned char	**prop_return,
		 * );
		 */
		return _lib('x11').declare('XGetWindowProperty', ctypes.default_abi,
			ostypes.INT,					// return
			ostypes.DISPLAY.ptr,			// *display
			ostypes.WINDOW,					// w
			ostypes.ATOM,					// property
			ostypes.LONG,					// long_offset
			ostypes.LONG,					// long_length
			ostypes.BOOL,					// delete
			ostypes.ATOM,					// req_type		// note to self: always put a jsInt here because in comparison checks after running `_dec('XGetWindowProperty')` I do `xgwpArg[argNameIndex['req_type']] != xgwpArg[argNameIndex['*actual_type_return']]` to test for mismatch, and i also test to make sure its not ostypes.ANYPROPERTYTYPE. and on return they are `UInt64{}` (even though declared to be `ostypes.ATOM.ptr` in `preDec`) but `new ostypes.ATOM(5)` is `CData{ UInt64{} }`. so doing a simple == for comparison requires one or the other be a jsInt  
			ostypes.ATOM.ptr,				// *actual_type_return
			ostypes.INT.ptr,				// *actual_format_return
			ostypes.UNSIGNED_LONG.ptr,		// *nitems_return
			ostypes.UNSIGNED_LONG.ptr,		// *bytes_after_return
			ostypes.UNSIGNED_CHAR.ptr.ptr	// **prop_return
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
	XMapWindow: function() {
		/* http://www.xfree86.org/4.4.0/XMapWindow.3.html
		 * int XMapWindow(
		 *   Display	*display,
		 *   Window		w
		 * );
		 */
		return _lib('x11').declare('XMapWindow', ctypes.default_abi,
			ostypes.INT,			// return
			ostypes.DISPLAY.ptr,	// *display
			ostypes.WINDOW			// w
		);
	},
	XNextEvent: function() {
		/* http://www.xfree86.org/4.4.0/XNextEvent.3.html
		 * int XNextEvent(
		 *   Display	*display, 
		 *   XEvent		*event_return 
		 * );
		 */
		return _lib('x11').declare('XNextEvent', ctypes.default_abi,
			ostypes.INT,			// return
			ostypes.DISPLAY.ptr,	// *display
			ostypes.XEVENT.ptr		// *event_return
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

/* start helper functions */

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
		if (atom == ostypes.NONE) { //will never equal ostypes.NONE if i pass 3rd arg of `false` to XInternAtom
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
	if (aXID == 0) {
		throw new Error('aXULWin is no longer open, as aXID is 0');
	}
	console.info('aXID:', aXID, aXID.toString(), uneval(aXID));
	return aXID;
}

function processArgsArr(refArr) {
	var argNameIndex = {}
	for (var ia=0; ia<refArr.length; ia++) {
		argNameIndex[refArr[ia][0]] = i;
		refArr[ia] = refArr[ia][1];
	}
}

/* end helper functions */

// my globals:
var libgdk = 'libgdk-x11-2.0.so.0';

function shutdown() {
	if (GetXDisplayConst && GetXDisplayConst.isNull && !GetXDisplayConst.isNull()) {
		console.log('closing disp');
		var rez_XCloseDisplay = _dec('XCloseDisplay')(GetXDisplay()); //it seems like XCloseDisp returns 0 on success, docs dont clarify that, they just say that XCloseDisplay can "generate" BadGC (they dont clarify what generate means return) // http://stackoverflow.com/questions/23083523/what-does-xclosedisplay-return
		console.log('debug-msg :: rez_XCloseDisplay:', rez_XCloseDisplay, uneval(rez_XCloseDisplay));
		if (rez_XCloseDisplay != 0) {
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
	/*
	// this block here works, it changes the title of the window
	// but have to change line 116 back to `ostypes.UNSIGNED_CHAR.ptr`
	var myXData = ostypes.UNSIGNED_CHAR.array()('ppbeta');
	console.info('myXData:', myXData, myXData.toString(), uneval(myXData));
	var rez_XChangeProp = _dec('XChangeProperty')(GetXDisplay(), xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')), GetAtom('WM_NAME'), GetAtom('UTF8_STRING'), 8, ostypes.PROPMODEREPLACE, myXData, myXData.length);
	console.info('rez_XChangeProp:', rez_XChangeProp, rez_XChangeProp.toString(), uneval(rez_XChangeProp));
	*/
	
	var doc = gBrowser.contentDocument;
	
	var img = new Image();
	img.onload = function() {
		var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		doc.body.appendChild(canvas);
		
		var ctx = canvas.getContext('2d');
		
		var size = this.width;
		canvas.width = size;
		canvas.height = size;
		
		ctx.clearRect(0, 0, size, size);
		
		ctx.drawImage(this, 0, 0);

		// Getting pixels as a byte (uint8) array
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pixels8BitsRGBA = imageData.data;

		// Reverting bytes from RGBA to ARGB
		var pixels8BitsARGB = new Uint8Array(pixels8BitsRGBA.length + 8); // +8 bytes for the two leading 32 bytes integers
		for(var i = 0 ; i < pixels8BitsRGBA.length ; i += 4) {
			pixels8BitsARGB[i+8 ] = pixels8BitsRGBA[i+3];
			pixels8BitsARGB[i+9 ] = pixels8BitsRGBA[i  ];
			pixels8BitsARGB[i+10] = pixels8BitsRGBA[i+1];
			pixels8BitsARGB[i+11] = pixels8BitsRGBA[i+2];
		}

		// Converting array buffer to a uint32 one, and adding leading width and height
		var pixelsAs32Bits = new Uint32Array(pixels8BitsARGB.buffer);
		pixelsAs32Bits[0] = canvas.width;
		pixelsAs32Bits[1] = canvas.height;

		console.log(pixelsAs32Bits);
		var jsarr = Array.prototype.slice.call(pixelsAs32Bits);
		console.log('jsarr:', jsarr);
			
		var myXDataLONG = ostypes.LONG.array()(jsarr);
		var myXData = ctypes.cast(myXDataLONG.address(), ostypes.UNSIGNED_CHAR.array(myXDataLONG.length).ptr).contents;
		//myXData = ctypes.cast(myXDataLONG, ostypes.UNSIGNED_CHAR.ptr);
		console.info('myXData:', myXData);
		
		var XChangeProp_argsArr = [
			['*display',		GetXDisplay()],
			['w',				xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser'))],
			['property',		GetAtom('_NET_WM_ICON')],
			['type',			GetAtom('CARDINAL')/*ostypes.XA_CARDINAL*/],
			['format',			32],
			['mode',			ostypes.PROPMODEREPLACE],
			['*data',			myXData],
			['nelements',		myXData.length]
		];
		var argNameIndex = processArgsArr(XChangeProp_argsArr);
		var rez_XChangeProp = _dec('XChangeProperty').apply(null, XChangeProp_argsArr);
		console.info('rez_XChangeProp:', rez_XChangeProp, rez_XChangeProp.toString(), uneval(rez_XChangeProp));
		/*
		var rez_XMapWin = _dec('XMapWindow')(GetXDisplay(), XChangeProp_argsArr[1]);
		console.info('rez_XMapWin:', rez_XMapWin, rez_XMapWin.toString(), uneval(rez_XMapWin));
		
		var myE = new ostypes.XEVENT();
		var rez_XNxtEv = _dec('XNextEvent')(GetXDisplay(), myE.address());
		console.info('rez_XNxtEv:', rez_XNxtEv, rez_XNxtEv.toString(), uneval(rez_XNxtEv));
		*/
		
		
		//https://github.com/benizi/config-bin/blob/4f606bde322af570429bbb17b3bd7023093cee27/set-icon.py#L69
		// many window managers need a hint that the icon has changed
		// bits 2, 3, and 5 of the WM_HINTS flags int are, respectively:
		// IconPixmapHint, IconWindowHint, and IconMaskHint
		var xgwpArg = [
			['*display',				GetXDisplay()],
			['w',						xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser'))],
			['property',				GetAtom('WM_HINTS')],
			['long_offset',				ostypes.LONG(0)],
			['long_length',				ostypes.LONG(0)],
			['delete',					0],
			['req_type',				null],
			['*actual_type_return',		null],
			['*actual_format_return',	new ostypes.INT(123)], // i can set this to whatever i want, im very sure, as it gets set to 0, if prop DNE and it gets set to right format if it exists (in both existance situations [(req_type != AnyPropertyType && req_type != actual_type_return) || (req_type == AnyPropertyType || req_type == actual_type_return)]
			['*nitems_return',			null],
			['*bytes_after_return',		null],
			['**prop_return',			null]
		];
		var argNameIndex = processArgsArr(xgwpArg);
		var rez_XGetWinProp = _dec('XGetWindowProperty').apply(null, xgwpArg);
		console.info('rez_XGetWinProp:', rez_XGetWinProp, rez_XGetWinProp.toString(), uneval(rez_XGetWinProp));
		
		if(xgwpArg[argNameIndex['req_type']] == ostypes.NONE /* must be jsInt */ && xgwpArg[argNameIndex['*actual_format_return']].contents == 0 && xgwpArg[argNameIndex['*bytes_after_return']].contents.value.toString() == 0) {
			// nitems_return argument will be empty
			console.log('The specified property does not exist for the specified window. The delete argument was ignored. The nitems_return argument will be empty.');
			if (xgwpArg[argNameIndex['*nitems_return']].isNull() == false) {
				console.warn('nitems_return argument should be empty but its not!', 'xgwpArg[argNameIndex[\'*nitems_return\']]:', xgwpArg[argNameIndex['*nitems_return']], xgwpArg[argNameIndex['*nitems_return']].toString(), uneval(xgwpArg[argNameIndex['*nitems_return']]));
			}
		} else if (xgwpArg[argNameIndex['req_type']] != ostypes.ANYPROPERTYTYPE /*ANYPROPERTYTYPE should be jsInt*/ && xgwpArg[argNameIndex['req_type']] /*req_type should be jsInt*/ != xgwpArg[argNameIndex['*actual_type_return']]) {
			// nitems_return argument will be empty
			console.log('Specified property exists but its type does not match the specified type. The delete argument was ignored. The nitems_return argument will be empty.');
			var theRetunedPropertyTypeActuallyIs = xgwpArg[argNameIndex['*actual_type_return']].contents.value.toString();
			// if the passed in *actual_format_return didn't match, it is changed to be what the format is, if it matched, then it stays the same
			var theReturnedFormat = xgwpArg[argNameIndex['*actual_format_return']].contents;
			var theReturnedPropLengthInBytes = xgwpArg[argNameIndex['*bytes_after_return']]; //its in bytes even if theFormat is 16 or 32 (im guessing if format is 8 then its byte)
			if (xgwpArg[argNameIndex['*nitems_return']].isNull() == false) {
				console.warn('nitems_return argument should be empty but its not!', 'xgwpArg[argNameIndex[\'*nitems_return\']]:', xgwpArg[argNameIndex['*nitems_return']], xgwpArg[argNameIndex['*nitems_return']].toString(), uneval(xgwpArg[argNameIndex['*nitems_return']]));
			}
		} else if (xgwpArg[argNameIndex['req_type']] == ostypes.ANYPROPERTYTYPE /*ANYPROPERTYTYPE should be jsInt*/ || xgwpArg[argNameIndex['req_type']] /*req_type should be jsInt*/ == xgwpArg[argNameIndex['*actual_type_return']]) {
			// i think nitems_return CAN be empty here, so a check of if nitems_return is empty or not cannot qualify for these two existance situations
			if (xgwpArg[argNameIndex['req_type']] == ostypes.ANYPROPERTYTYPE) {
				// `xgwpArg[argNameIndex['*actual_type_return']]` was set to what the type of the returned property really is
			}
			var theRetunedPropertyTypeActuallyIs = xgwpArg[argNameIndex['*actual_type_return']].contents.value.toString(); // if AnyPropertyType was not used then this is just the same as req_type (but it will not be jsInt, like i expect myself to be setting `req_type` to
			var theReturnedFormat = xgwpArg[argNameIndex['*actual_format_return']].contents; // set to the format of the returned property (so there is a chnance this can change) (so this makes me think maybe the arg when being passed in can be passed as anything? unless x11 does some internal checks to see if its 8, 16, or 32
			// bytes_after_return should be MIN between ("actual length of the stored property in bytes (even if format is 16 or 32)" - "4*xgwpArg[argNameIndex['long_offset']]" || "4*xgwpArg[argNameIndex['long_length']]") IF THIS VALUE TURNS OUT BE NEGATIVE, THEN ostypes.BADVALUE IS RETURNED BY `_dec('XGetWindowProperty')`
			if (xgwpArg[argNameIndex['*actual_format_return']].contents == 8) {
				// then xgwpArg[argNameIndex['**prop_return']] is represented as a char array
			} else if (xgwpArg[argNameIndex['*actual_format_return']].contents == 16) {
				// then xgwpArg[argNameIndex['**prop_return']] is represented as a short array and should be cast to `xgwpArg[argNameIndex['*actual_type_return']]`'s jsctypes equivalent type to obtain the elements
			} else if (xgwpArg[argNameIndex['*actual_format_return']].contents == 32) {
				// then xgwpArg[argNameIndex['**prop_return']] is represented as a long array and should be cast to `xgwpArg[argNameIndex['*actual_type_return']]`'s jsctypes equivalent type to obtain the elements
			} else {
				throw new Error('extremely weird, this should NEVER happen, it should always be 8, 16, or 32');
			}
			
			// must always XFree, even if prop_return is empty because: XGetWindowProperty always allocates one extra byte in prop_return (even if the property is zero length) and sets it to zero
			var rez_XFree = _dec('XFree')(xgwpArg[argNameIndex['**prop_return']]/*.contents*/); //probably should XFree the ** rather then the *. so meaning should probably XFree the .ptr.ptr instead of the .ptr
			console.info('rez_XFree:', rez_XFree, rez_XFree.toString(), uneval(rez_XFree));
		} else {
			console.warn('some unknown combinations returned');
		}
		
	};
	img.src = OS.Path.toFileURI(OS.Path.join(OS.Constants.Path.desktopDir, 'profilist-ff-channel-logos', 'release64.png'));
}

try {
	main();
} catch(ex) {
	console.error('error:', ex);
} finally {
	shutdown();
}