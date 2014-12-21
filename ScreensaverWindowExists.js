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
	this.TIME = ctypes.unsigned_long;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_INT = ctypes.unsigned_int;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	this.WINDOW = ctypes.unsigned_long;
	this.XID = ctypes.unsigned_long;

	// ADVANCED TYPES (ones that are equal to something predefined by me)
	if (/^(Alpha|hppa|ia64|ppc64|s390|x86_64)-/.test(Services.appinfo.XPCOMABI)) { // https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L45 // // http://mxr.mozilla.org/mozilla-central/source/configure.in
		this.CARD32 = this.UNSIGNED_INT;
	} else {
		this.CARD32 = this.UNSIGNED_LONG;
	}

	// CONSTANTS
	this.ANYPROPERTYTYPE = this.ATOM(0);
	this.NONE = 0;
	this.XA_WINDOW = 33;
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
		dec[declaration] = preDec[declaration](); //if declaration is not in _preDec then dev messed up
	}
	return dec[declaration];
}

var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev
	XCloseDisplay: function() {
		/* http://www.xfree86.org/4.4.0/XCloseDisplay.3.html
		 * int XCloseDisplay(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XCloseDisplay', ctypes.default_abi,
			ostypes.INT,		// return
			ostypes.DISPLAY.ptr	// *display_name
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
			ostpyes.INT,	// return
			ostypes.DATA	// *data
		);
	},
	XGetWindowProperty: function() {
		/* http://www.xfree86.org/4.4.0/XGetWindowProperty.3.html
		 * int XGetWindowProperty(
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
		 *   unsigned char	**prop_return
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
			ostypes.ATOM,					// req_type
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

function OpenNewXDisplay() {
	//returns ostypes.DISPLAY	
	//consider: http://mxr.mozilla.org/chromium/source/src/ui/gfx/x/x11_types.cc#26
	  // std::string display_str = base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII(switches::kX11Display);
	  // return XOpenDisplay(display_str.empty() ? NULL : display_str.c_str());
	  // i asked about it here: https://ask.mozilla.org/question/1321/proper-way-to-xopendisplay/
	
	return _dec('XOpenDisplay')(null);
}

var GetXDisplayConst; // runtime defined constants
function GetXDisplay() {
	if (!GetXDisplayConst) {
		GetXDisplayConst = OpenNewXDisplay();
	}
	return GetXDisplayConst;
}

var GetAtomCache = {};
function GetAtom(name) {
	// name is ostypes.CHAR.ptr
	// returns ostypes.ATOM
	if (!(name in GetAtomCache)) {		
		var atom = _dec('XInternAtom')(GetXDisplay(), name, false);
		if(atom == ostypes.NONE) {
			console.error('No atom with name:', name, 'return val of atom:', atom, uneval(atom), atom.toString());
			throw new Error('No atom with name "' + name + '"), return val of atom:"' +  atom + '" toString:"' + atom.toString() + '"');
		}
		GetAtomCache[name] = atom;
	}
	return GetAtomCache[name];
}

function GetProperty(window, property_name, max_length, type, format, num_items, property) {
	// Note: The caller of this function, `GetProperty`, should free the resulting value data.
	// returns bool
	var property_atom = GetAtom(property_name);
	var remaining_bytes = new ostypes.UNSIGNED_LONG();
	var rez_XGWP = _dec('XGetWindowProperty')(GetXDisplay(), window, property_atom, 0 /*offset into property data to read*/, max_length, false /*deleted*/, ostypes.ANYPROPERTYTYPE, type, format, num_items, remaining_bytes.address(), property);
	
	console.info('debug-msg :: rez_XGWP:', rez_XGWP);
	
	return rez_XGWP;
	/*
	85 // Note: The caller should free the resulting value data.
	86 bool GetProperty(XID window, const std::string& property_name, long max_length,
	87                  XAtom* type, int* format, unsigned long* num_items,
	88                  unsigned char** property) {
	89   XAtom property_atom = GetAtom(property_name.c_str());
	90   unsigned long remaining_bytes = 0;
	91   return XGetWindowProperty(gfx::GetXDisplay(),
	92                             window,
	93                             property_atom,
	94                             0,          // offset into property data to read
	95                             max_length, // max length to get
	96                             False,      // deleted
	97                             AnyPropertyType,
	98                             type,
	99                             format,
	100                             num_items,
	101                             &remaining_bytes,
	102                             property);
	103 }
	*/
}

function GetProperty(win, propertyName, trueForReturnData_else_falseForReturnBool, propertyType) {
	// Fourth argument of `propertyType` is optional, if its undefined then `ostypes.ANYPROPERTYTYPE` is used
	// if `trueForReturnData_else_falseForReturnBool` is `true ` then returns array, first element is non-casted data (DataReturned), second element is number of elements (NItemsReturned)
		// also if true then IMPORANT Note: The caller of this function, `GetProperty`, should free the resulting value DataReturned (first element returned).
	// if `trueForReturnData_else_falseForReturnBool` is `false` then returns if `XGetWindowProperty` was successful or not
		// if false this will release the data

	var property_atom = GetAtom(property_name);
	var remaining_bytes = new ostypes.UNSIGNED_LONG();
	
	var actualTypeReturned = new ostypes.ATOM();
	var actualFormatReturned = new ostypes.INT();
	var NItemsReturned = new ostypes.UNSIGNED_LONG();
	var BytesAfterReturn = new ostypes.UNSIGNED_LONG();
	var DataReturned = new ostypes.UNSIGNED_CHAR.ptr();
	var max_length = trueForReturnData_else_falseForReturnBool ? 1024 : -1;
	var usePropType = !propertyType ? ostypes.ANYPROPERTYTYPE : propertyType;
	var rez_XGWP = _dec('XGetWindowProperty')(GetXDisplay(), win, GetAtom(propertyName), 0 /*offset into property data to read*/, max_length, false /*deleted*/, usePropType, actualTypeReturned.address(), actualFormatReturned.address(), NItemsReturned.address(), BytesAfterReturn.address(), DataReturned.addres());
	
	console.info('debug-msg :: rez_XGWP:', rez_XGWP);
	
	if (trueForReturnData_else_falseForReturnBool) {
		//return DataReturned, dev will have to free DataReturned
		if (rez_XGWP) {
			var NItemsReturnedValue = ctypes.cast(nItemsReturned, ostypes.UNSIGNED_INT).value;
			//important note: make sure to XFree DataReturned
			return [DataReturned, NItemsReturnedValue];
		} else {
			console.error('XGetWindowProperty failed!', 'rez_XGWP:', rez_XGWP, uneval(rez_XGWP), rez_XGWP.toString());
			throw new Error('XGetWindowProperty failed! rez_XGWP: "' + rez_XGWP + '" toString: "' rez_XGWP.toString() + '"');
		}
	} else {
		//return bool, free the DataReturned here
		var rez_XF = _dec('XFree')(DataReturned);
		console.info('debug-msg :: rez_XF:', rez_XF);
		if (!rez_XF) {
			console.warn('GetProperty failed to free memory, leak imminent!');
		}
		return rez_XGWP;
	}
}

function GetX11RootWindow() {

}

function GetXWindowStack(window) {
	var type = ostypes.ATOM;
	var format = ostypes.INT;
	var count = ostypes.UNSIGNED_LONG;
	var data = ostypes.UNSIGNED_CHAR.ptr;
	var rez_GP = GetProperty(window, '_NET_CLIENT_LIST_STACKING', ~0, )
	if (!rez_GP) {
		return false;
	}
	
	var result = false;
	if (type == ostypes.XA_WINDOW
		/*
		1078 
		1079 bool GetXWindowStack(Window window, std::vector<XID>* windows) {
		1080   windows->clear();
		1081 
		1082   Atom type;
		1083   int format;
		1084   unsigned long count;
		1085   unsigned char *data = NULL;
		1086   if (GetProperty(window,
		1087                   "_NET_CLIENT_LIST_STACKING",
		1088                   ~0L,
		1089                   &type,
		1090                   &format,
		1091                   &count,
		1092                   &data) != Success) {
		1093     return false;
		1094   }
		1095 
		1096   bool result = false;
		1097   if (type == XA_WINDOW && format == 32 && data && count > 0) {
		1098     result = true;
		1099     XID* stack = reinterpret_cast<XID*>(data);
		1100     for (long i = static_cast<long>(count) - 1; i >= 0; i--)
		1101       windows->push_back(stack[i]);
		1102   }
		1103 
		1104   if (data)
		1105     XFree(data);
		1106 
		1107   return result;
		1108 }
		*/
}

function GetXWindowStack() {

}

function ScreensaverWindowExists() {
	//returns bool

	if (!ui::GetXWindowStack(ui::GetX11RootWindow(), & stack)) {
		// Window Manager doesn't support _NET_CLIENT_LIST_STACKING, so fall back
		// to old school enumeration of all X windows.  Some WMs parent 'top-level'
		// windows in unnamed actual top-level windows (ion WM), so extend the
		// search depth to all children of top-level windows.
		const int kMaxSearchDepth = 1;
		ui::EnumerateAllWindows(delegate, kMaxSearchDepth);
		return;
	}

	////////////////
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
			ostypes.BOOL, // return
			ostypes.UINT, // uiAction
			ostypes.UINT, // uiParam
			ostypes.PVOID, // pvParam
			ostypes.UINT // fWinIni
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

//setTimeout(function() {
	var rez_SWE = ScreensaverWindowExists();
	console.info('debug-msg :: rez_SWE:', rez_SWE);

	for (var l in lib) {
		lib[l].close();
	}
//}, 65000);