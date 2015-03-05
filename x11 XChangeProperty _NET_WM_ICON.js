Cu.import('resource://gre/modules/ctypes.jsm')

var nixtypesInit = function() {
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.ATOM = ctypes.unsigned_long;
	this.BOOL = ctypes.int;
	this.CHAR = ctypes.char;
	this.GDKDRAWABLE = ctypes.StructType('GdkDrawable');
	this.GDKWINDOW = ctypes.StructType('GdkWindow');
	this.DISPLAY = new ctypes.StructType('Display');
	this.INT = ctypes.int;
	this.LONG = ctypes.long;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_INT = ctypes.unsigned_int;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	
	// ADVANCED TYPES (ones that are equal to something predefined by me, order matters here, as the basic or pre-advanced type needs to be defined before the type)
	if (/^(Alpha|hppa|ia64|ppc64|s390|x86_64)-/.test(Services.appinfo.XPCOMABI)) { // https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L45 // // http://mxr.mozilla.org/mozilla-central/source/configure.in
		this.CARD32 = this.UNSIGNED_INT;
	} else {
		this.CARD32 = this.UNSIGNED_LONG;
	}
	this.WINDOW = this.CARD32;
	this.XID = this.CARD32;
	
	// CONSTANTS
	this.BADGC = 13;
	this.PROPMODEREPLACE = 0; // PropModeReplace
  this.XA_CARDINAL = 6;

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
		 *   GdkDrawable *drawable
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
		 *   Display *display,
		 *   Window w,
		 *   Atom property,
		 *   Atom type,
		 *   int format,
		 *   int mode,
		 *   unsigned char *data,
		 *   int nelements
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

var GetAtomCache = {};
function GetAtom(name, createIfDNE) {
	// createIfDNE is jsBool, true or false. if set to true/1 then the atom is creatd if it doesnt exist. if set to false/0, then an error is thrown when atom does not exist
	// default behavior is throw when atom doesnt exist
	
	// name is ostypes.CHAR.ptr
	// returns ostypes.ATOM
	var onlyIfExists = 1;
	if (createIfDNE) {
		onlyIfExists = 0;
	}
	if (!(name in GetAtomCache)) {		
		var atom = _dec('XInternAtom')(GetXDisplay(), name, createIfDNE ? 0 : 1); //passing 3rd arg of false, means even if atom doesnt exist it returns a created atom, this can be used with GetProperty to see if its supported etc, this is how Chromium does it
		if (atom == ostypes.NONE) { //will never equal ostypes.NONE because i pass 3rd arg of `false` to XInternAtom
			console.warn('No atom with name:', name, 'return val of atom:', atom, uneval(atom), atom.toString());
			throw new Error('No atom with name "' + name + '"), return val of atom:"' +  atom + '" toString:"' + atom.toString() + '"');
		}
		GetAtomCache[name] = atom;
	}
	return GetAtomCache[name];
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
		var rez_XChangeProp = _dec('XChangeProperty')(GetXDisplay(), xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')), GetAtom('_NET_WM_ICON'), ostypes.XA_CARDINAL, 32, ostypes.PROPMODEREPLACE, myXData, myXData.length);
		console.info('rez_XChangeProp:', rez_XChangeProp, rez_XChangeProp.toString(), uneval(rez_XChangeProp));
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