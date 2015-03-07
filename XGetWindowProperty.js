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
	
	// ADVANCED TYPES (ones that are equal to something predefined by me, order matters here, as the basic or pre-advanced type needs to be defined before the type)
	if (/^(Alpha|hppa|ia64|ppc64|s390|x86_64)-/.test(Services.appinfo.XPCOMABI)) { // https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L45 // // http://mxr.mozilla.org/mozilla-central/source/configure.in
		this.CARD32 = this.UNSIGNED_INT;
	} else {
		this.CARD32 = this.UNSIGNED_LONG;
	}
	this.WINDOW = this.CARD32;
	this.XID = this.CARD32;
	
	// CONSTANTS
	this.ANYPROPERTYTYPE = 0; //AnyPropertyType //this.ATOM(0) // need this jsInt for comparison
	this.BADGC = 13;
	this.NONE = 0; // leave it at 0 (a jsInt) as simple comparison is done in GetAtom, cuz in GetAtom i do `if (rez == ostypes.NONE)` and if is a number here it works. otherwise its weird. ostypes.ATOM(0) and new ostypes.ATOM(0) both give back CData{ value: UInt64{} } but the XInternAtom even thouh return is ostypes.ATOM it gives back UInt64 &&& doing UInt64 == jsInt seems to work. oin ostypes.ATOM(0).value == returnedUInt64 does not work if i do this then i have to to returnedUInt64.toString() == ostypes.ATOM(0).value.toStrin() so weird
	this.SUCCESS = 0;
	this.XA_CARDINAL = 6; // can do parseInt(GetAtom('CARDINAL').toString()) but dont as i need this a jsInt for comparisons in post _dec('XGetWindowProperty')() logic, otherwise i have to use ctypes.UInt64.compare for equality checks

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
	gdk_window_get_toplevel: function() {
		/* https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-window-get-toplevel
		 * GdkWindow* gdk_window_get_toplevel (
		 *   GdkWindow	*window
		 * );
		 */
		return _lib('libgdk-x11-2.0.so.0').declare('gdk_window_get_toplevel', ctypes.default_abi,
			ostypes.GDKWINDOW.ptr,		// return
			ostypes.GDKWINDOW.ptr		// *window
		);		
	},
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
			ostypes.ATOM,					// req_type		// note on note: actually if ANYPROPERTYTYPE and NONE are jsInt then thse can be atoms. note to self: always put a jsInt here because in comparison checks after running `_dec('XGetWindowProperty')` I do `xgwpArg.req_type != xgwpArg.$actual_type_return` to test for mismatch, and i also test to make sure its not ostypes.ANYPROPERTYTYPE. and on return they are `UInt64{}` (even though declared to be `ostypes.ATOM.ptr` in `preDec`) but `new ostypes.ATOM(5)` is `CData{ UInt64{} }`. so doing a simple == for comparison requires one or the other be a jsInt  
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
			throw new Error('No atom with name, "' + name + '", return val of atom:"' +  atom + '" toString:"' + atom.toString() + '"');
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
	//var topGDKWindowPtr = _dec('gdk_window_get_toplevel')(aGDKWindowPtr);
	//var aGDKDrawablePtr = ctypes.cast(topGDKWindowPtr, ostypes.GDKDRAWABLE.ptr);
	var aGDKDrawablePtr = ctypes.cast(aGDKWindowPtr, ostypes.GDKDRAWABLE.ptr);
	var aXID = _dec('gdk_x11_drawable_get_xid')(aGDKDrawablePtr); //no need for error checking here as if it doesnt exist it crashes?
	if (jscEqual(aXID, 0)) {
		throw new Error('aXULWin is no longer open, as aXID is 0');
	}
	console.info('aXID:', aXID, aXID.toString(), uneval(aXID));
	return aXID;
}

function readAsCharThenAsJSChar(stringPtr, known_len, jschar) {
	// when reading as jschar it assumes max length of 500
	
	// stringPtr is either char or jschar, if you know its jschar for sure, pass 2nd arg as true
	// if known_len is passed, then assumption is not made, at the known_len position in array we will see a null char
	// i tried getting known_len from stringPtr but its not possible, it has be known, i tried this:
		//"stringPtr.contents.toString()" "95"
		//"stringPtr.toString()" "ctypes.unsigned_char.ptr(ctypes.UInt64("0x7f73d5c87650"))"
		// so as we see neither of these is 77, this is for the example of "_scratchpad/EnTeHandle.js at master · Noitidart/_scratchpad - Mozilla Firefox"
		
	// tries to do read string on stringPtr, if it fails then it falls to read as jschar
	
	var readJSCharString = function() {
		var assumption_max_len = known_len ? known_len : 500;
		var ptrAsArr = ctypes.cast(stringPtr, ctypes.unsigned_char.array(assumption_max_len).ptr).contents; // MUST cast to unsigned char (not ctypes.jschar, or ctypes.char) as otherwise i dont get foreign characters, as they are got as negative values, and i should read till i find a 0 which is null terminator which will have unsigned_char code of 0 // can test this by reading a string like this: "_scratchpad/EnTeHandle.js at master · Noitidart/_scratchpad - Mozilla Firefox" at js array position 36 (so 37 if count from 1), we see 183, and at 77 we see char code of 0 IF casted to unsigned_char, if casted to char we see -73 at pos 36 but pos 77 still 0, if casted to jschar we see chineese characters in all spots expect spaces even null terminator is a chineese character
		console.info('ptrAsArr.length:', ptrAsArr.length);
		//console.log('debug-msg :: dataCasted:', dataCasted, uneval(dataCasted), dataCasted.toString());
		var charCode = [];
		var fromCharCode = []
		for (var i=0; i<ptrAsArr.length; i++) { //if known_len is correct, then will not hit null terminator so like in example of "_scratchpad/EnTeHandle.js at master · Noitidart/_scratchpad - Mozilla Firefox" if you pass length of 77, then null term will not get hit by this loop as null term is at pos 77 and we go till `< known_len`
			var thisUnsignedCharCode = ptrAsArr.addressOfElement(i).contents;
			if (thisUnsignedCharCode == 0) {
				// reached null terminator, break
				console.log('reached null terminator, at pos: ', i);
				break;
			}
			charCode.push(thisUnsignedCharCode);
			fromCharCode.push(String.fromCharCode(thisUnsignedCharCode));
		}
		console.info('charCode:', charCode);
		console.info('fromCharCode:', fromCharCode);
		var char16_val = fromCharCode.join('');
		console.info('char16_val:', char16_val);
		return char16_val;
	}
	
	if (!jschar) {
		try {
			var char8_val = stringPtr.readString();
			console.info('stringPtr.readString():', char8_val);
			return char8_val;
		} catch (ex if ex.message.indexOf('malformed UTF-8 character sequence at offset ') == 0) {
			console.warn('ex of offset utf8 read error when trying to do readString so using alternative method, ex:', ex);
			return readJSCharString();
		}
	} else {
		return readJSCharString();
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
	var xgwpArg = {
		$display:				/*DISPLAY.ptr*/				GetXDisplay(),
		w:						/*WINDOW*/					xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')),
		property:				/*ATOM*/					GetAtom('_NET_WM_PID'),//GetAtom('_NET_WM_ICON'),
		long_offset:			/*LONG*/					ostypes.LONG(0),
		long_length:			/*LONG*/					ostypes.LONG(ostypes.UNSIGNED_LONG.size), // i expect _NET_WM_PID to be one number so just give buffer enough size for one // this is critical, dont set this to 0, otherwise even if stuff is there, you will get 0 data returned in $$prop_return and 0 for $nitems_return
		delete:					/*BOOL*/					0,
		req_type:				/*ATOM - jsInt*/			ostypes.ANYPROPERTYTYPE,
		$actual_type_return:	/*ATOM.ptr*/				ostypes.ATOM(),
		$actual_format_return:	/*INT.ptr*/					ostypes.INT(), // i can set this to whatever i want, im very sure, as it gets set to 0, if prop DNE and it gets set to right format if it exists (in both existance situations [(req_type != AnyPropertyType && req_type != actual_type_return) || (req_type == AnyPropertyType || req_type == actual_type_return]
		$nitems_return:			/*UNSIGNED_LONG.ptr*/		ostypes.UNSIGNED_LONG(),
		$bytes_after_return:	/*UNSIGNED_LONG.ptr*/		ostypes.UNSIGNED_LONG(),
		$$prop_return:			/*UNSIGNED_CHAR.ptr.ptr*/	ostypes.UNSIGNED_CHAR.ptr()
	};
	var rez_XGetWinProp = _dec('XGetWindowProperty')(xgwpArg.$display, xgwpArg.w, xgwpArg.property, xgwpArg.long_offset, xgwpArg.long_length, xgwpArg.delete, xgwpArg.req_type, xgwpArg.$actual_type_return.address(), xgwpArg.$actual_format_return.address(), xgwpArg.$nitems_return.address(), xgwpArg.$bytes_after_return.address(), xgwpArg.$$prop_return.address());
	console.info('rez_XGetWinProp:', rez_XGetWinProp, rez_XGetWinProp.toString(), uneval(rez_XGetWinProp));
	//console.info('xgwpArg:', xgwpArg, uneval(xgwpArg));
	//console.info('xgwpArg:', xgwpArg.$$prop_return, uneval(xgwpArg.$$prop_return));
	//console.info('xgwpArg:', xgwpArg.$$prop_return.contents, uneval(xgwpArg.$$prop_return.contents));
	
	if (!jscEqual(rez_XGetWinProp, ostypes.SUCCESS)) {
		console.log('XGetWindowProperty failed with reason:', rez_XGetWinProp, rez_XGetWinProp.toString(), uneval(rez_XGetWinProp));
	} else {
		if(jscEqual(xgwpArg.req_type, ostypes.NONE) && jscEqual(xgwpArg.$actual_format_return, 0) && jscEqual(xgwpArg.$bytes_after_return, 0)) {
			// nitems_return argument will be empty
			console.log('The specified property does not exist for the specified window. The delete argument was ignored. The nitems_return argument will be empty.');
			if (xgwpArg.$nitems_return.isNull() == false) {
				console.warn('nitems_return argument should be empty but its not!', 'xgwpArg[argNameIndex[\'*nitems_return\']]:', xgwpArg.$nitems_return, xgwpArg.$nitems_return.toString(), uneval(xgwpArg.$nitems_return));
			}
		} else if (!jscEqual(xgwpArg.req_type, ostypes.ANYPROPERTYTYPE) && !jscEqual(xgwpArg.req_type, xgwpArg.$actual_type_return)) {
			// nitems_return argument will be empty
			console.log('Specified property exists but its type does not match the specified type. The delete argument was ignored. The nitems_return argument will be empty.');
			var theRetunedPropertyTypeActuallyIs = jscGetDeepest(xgwpArg.$actual_type_return);
			// if the passed in *actual_format_return didn't match, it is changed to be what the format is, if it matched, then it stays the same
			var theReturnedFormat = jscGetDeepest(xgwpArg.$actual_format_return);
			var theReturnedPropLengthInBytes = jscGetDeepest(xgwpArg.$bytes_after_return); //its in bytes even if theFormat is 16 or 32 (im guessing if format is 8 then its byte)
			if (xgwpArg.$nitems_return.isNull() == false) {
				console.warn('nitems_return argument should be empty but its not!', 'xgwpArg[argNameIndex[\'*nitems_return\']]:', xgwpArg.$nitems_return, xgwpArg.$nitems_return.toString(), uneval(xgwpArg.$nitems_return));
			}
		} else if (jscEqual(xgwpArg.req_type, ostypes.ANYPROPERTYTYPE) || jscEqual(xgwpArg.req_type, xgwpArg.$actual_type_return)) {
			// i think nitems_return CAN be empty here, so a check of if nitems_return is empty or not cannot qualify for these two existance situations
			console.log('The specified property exists and either you assigned AnyPropertyType to the req_type argument or the specified type matched the actual property type of the returned data.');
			if (jscEqual(xgwpArg.req_type, ostypes.ANYPROPERTYTYPE)) {
				// `xgwpArg.$actual_type_return` was set to what the type of the returned property really is
			} else {
				// `xgwpArg.req_type` and xgwpArg.$actual_type_return match
			}
			var theRetunedPropertyTypeActuallyIs = jscGetDeepest(xgwpArg.$actual_type_return); // if AnyPropertyType was not used then this is just the same as req_type (but it will not be jsInt, like i expect myself to be setting `req_type` to
			var theReturnedFormat = jscGetDeepest(xgwpArg.$actual_format_return); // set to the format of the returned property (so there is a chnance this can change) (so this makes me think maybe the arg when being passed in can be passed as anything? unless x11 does some internal checks to see if its 8, 16, or 32			
			// bytes_after_return should be MIN between ("actual length of the stored property in bytes (even if format is 16 or 32)" - "4*xgwpArg.long_offset" || "4*xgwpArg.long_length") IF THIS VALUE TURNS OUT BE NEGATIVE, THEN ostypes.BADVALUE IS RETURNED BY `_dec('XGetWindowProperty')`
			
			var jsInt_nitems_return = jscGetDeepest(xgwpArg.$nitems_return);
			console.log('jsInt_nitems_return deepest:', jsInt_nitems_return);
			
			
			if (jscEqual(xgwpArg.$actual_format_return, 8)) {
				// then xgwpArg.$$prop_return is represented as a char array
				console.log('then xgwpArg.$$prop_return is represented as a char array');
				// if passed a xgwpArg.long_length of 8 then max characters returned will be 32, no idea why but this is what tests yielded
				// no need to cast xgwpArg.$$prop_return can just read string on it
				
				// test results one, with long_length 8 on ubuntu
				// "xgwpArg.$$prop_return.readString():" "Restore Session - Mozilla Firefo"
				// "xgwpArg.$$prop_return.contents.toString():" "82"
				
				// test results one, with long_length 40 on ubuntu
				// "stringPtr.readString():" "Restore Session - Mozilla Firefox"
				// "xgwpArg.$$prop_return.contents.toString()" "82"
				// "xgwpArg.$$prop_return.toString()" "ctypes.unsigned_char.ptr(ctypes.UInt64("0x7fc506538df0"))"
				
				readAsCharThenAsJSChar(xgwpArg.$$prop_return);
				console.info('xgwpArg.$$prop_return.contents.toString()', xgwpArg.$$prop_return.contents.toString());
				console.info('xgwpArg.$$prop_return.toString()', xgwpArg.$$prop_return.toString());
				
			} else if (jscEqual(xgwpArg.$actual_format_return, 16)) {
				// then xgwpArg.$$prop_return is represented as a short array and should be cast to `xgwpArg.$actual_type_return`'s jsctypes equivalent type to obtain the elements
				console.log('then xgwpArg.$$prop_return is represented as a short array and should be cast to `xgwpArg.$actual_type_return`\'s jsctypes equivalent type to obtain the elements');
			} else if (jscEqual(xgwpArg.$actual_format_return, 32)) {
				// then xgwpArg.$$prop_return is represented as a long array and should be cast to `xgwpArg.$actual_type_return`'s jsctypes equivalent type to obtain the elements
				console.log('then xgwpArg.$$prop_return is represented as a long array and should be cast to `xgwpArg.$actual_type_return`\'s jsctypes equivalent type to obtain the elements');
				//var prop_return_casted = ctypes.cast(xgwpArg.$$prop_return, ctypes.unsigned_
				// i have to cast even if i want a ctypes.long
			} else {
				throw new Error('extremely weird, this should NEVER happen, it should always be 8, 16, or 32');
			}
			
			// must always XFree, even if prop_return is empty because: XGetWindowProperty always allocates one extra byte in prop_return (even if the property is zero length) and sets it to zero
			//console.log(xgwpArg.$$prop_return.constructor);
			// @foudfou XFree's the casted which casts with `ctypes.cast(prop_value, ctypes.unsigned_long.array(nitems.value).ptr);`: https://github.com/foudfou/FireTray/blob/3e0ede74c707bb383b48d73f475ef29df9b09494/src/modules/linux/FiretrayWindow.jsm#L442
			// @zotero XFree's the non-casted even though he does cast with `clientList = ctypes.cast(res[0], X11Window.array(nClients).ptr).contents`: https://github.com/zotero/zotero/blob/15108eea3f099a5a39a145ed55043d1ed9889e6a/chrome/content/zotero/xpcom/integration.js#L583

			//so in conclusion: i can XFree on casted or on non-casted as: console.log('XFree\'ing on prop_return_casted, and won\'t need to XFree on xgwpArg.$$prop_return.contents as the casted is connected by reference, so XFree\'ing this will free that');
			var rez_XFree = _dec('XFree')(xgwpArg.$$prop_return);
			console.info('rez_XFree:', rez_XFree, rez_XFree.toString(), uneval(rez_XFree));
		} else {
			console.warn('some unknown combinations returned');
		}
	}
}

try {
	main();
} catch(ex) {
	console.error('error:', ex);
} finally {
	shutdown();
}