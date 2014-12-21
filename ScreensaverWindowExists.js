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

/* start - main display and root window get and hold constant functions */
function OpenNewXDisplay() {
	//returns ostypes.DISPLAY	
	//consider: http://mxr.mozilla.org/chromium/source/src/ui/gfx/x/x11_types.cc#26
	  // std::string display_str = base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII(switches::kX11Display);
	  // return XOpenDisplay(display_str.empty() ? NULL : display_str.c_str());
	  // i asked about it here: https://ask.mozilla.org/question/1321/proper-way-to-xopendisplay/
	
	return _dec('XOpenDisplay')(null);
}

var GetXDisplayConst; //ostypes.DISPLAY // runtime defined constants
function GetXDisplay() { //two functions that hold const, GetX11RootWindow and GetXDisplay because some functions need the root window (like XFindWindow and XSendEvent) and others need the root display (like XGetWindowProperty and XSendEvent)
	if (!GetXDisplayConst) {
		GetXDisplayConst = OpenNewXDisplay();
	}
	return GetXDisplayConst;
}

var DefaultRootWindowConst; // ostypes.XID // runtime defined constants
function DefaultRootWindow(disp) {
	// returns XID
	//i cant find this function in chromium codebase so im just going to guess
	if (!DefaultRootWindow) {
		DefaultRootWindowConst = _dec('XDefaultRootWindow')(disp);
	}
	return DefaultRootWindowConst;
}

function GetX11RootWindow() { //two functions that hold const, GetX11RootWindow and GetXDisplay because some functions need the root window (like XFindWindow and XSendEvent) and others need the root display (like XGetWindowProperty and XSendEvent)
	return DefaultRootWindow(GetXDisplay());
}
/* end - main display and root window get and hold constant functions */

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
	// this function is a combination of chromium's GetProperty (http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#86) and zotero's (_X11GetProperty https://github.com/zotero/zotero/blob/15108eea3f099a5a39a145ed55043d1ed9889e6a/chrome/content/zotero/xpcom/integration.js#L571) // the reason i did this, i was originally going by chromium but i couldnt see where they were XFree'ing the data, it could be that because bytes returned was -1 there was no need to XFree, but this function also returns data which i can use in future
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

function GetXWindowStack(window, windowsStack) {
	var type = ostypes.ATOM;
	var format = ostypes.INT;
	var count = ostypes.UNSIGNED_LONG;
	var data = ostypes.UNSIGNED_CHAR.ptr;
	var rez_GP = GetProperty(window, '_NET_CLIENT_LIST_STACKING', ~0, )
	if (!rez_GP) {
		return false;
	}
	
	console.info('debug-msg :: XWindowStack is available');
	//var result = false;
	//if (type == ostypes.XA_WINDOW
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

function EnumerateChildren(shouldStopIteratingDelegate, window, max_depth, depth) {
	//shouldStopIteratingDelegate is pointer to EnumerateWindowsDelegate*
	//window is ostypes.XID
	//max_depth is ostypes.INT
	//depth is ostypes.INT
	if (depth > max_depth) {
		return false;
	}

	var windows; // ostypes.XID
	if (depth == 0) {
		//i dont understand this menu crap, i cant find it in the freecode docs: 
		/*
		1012     XMenuList::GetInstance()->InsertMenuWindowXIDs(&windows);
		1013     // Enumerate the menus first.
		1014     for (iter = windows.begin(); iter != windows.end(); iter++) {
		1015       if (delegate->ShouldStopIterating(*iter))
		1016         return true;
		1017     }
		1018     windows.clear();
		*/
	}
	
	var root; //ostypes.XID
	var parent; //ostypes.XID
	var children; //ostypes.XID.array().ptr
	
	var num_children; //ostypes.INT
	var rez_XQT = _dec('XQueryTree')(GetXDisplay(), window, root.address(), parent.address(), children.address(), num_children.address);
	
	if (!rez_XQT) {
		return false;
	}
	
	for (var i=num_children-1; i>=0; i--) {
		windows.push(children[i]);
	}
	
	var rez_XF = _dec('XFree')(children);
	if (!rez_XF) {
		console.warn('Faild to XFree children, mem leak imminent');
	}
	
	// XQueryTree returns the children of |window| in bottom-to-top order, so reverse-iterate the list to check the windows from top-to-bottom.
	for (var i=0; i<windows.length; i++) {
		if (IsWindowNamed(window[i]) && shouldStopIteratingDelegate(window[i])) {
			return true;
		}
	}
	
	// If we're at this point, we didn't find the window we're looking for at the current level, so we need to recurse to the next level.  We use a second loop because the recursion and call to XQueryTree are expensive and is only needed for a small number of cases.
	if (depth++ <= max_depth) {
		for (var i=0; i<windows.length; i++) {
			if (EnumerateChildren(delegate, windows[i], max_depth, depth))
				return true;
			}
		}
	}

	return false;
/*
1004 bool EnumerateChildren(EnumerateWindowsDelegate* delegate, XID window,
1005                        const int max_depth, int depth) {
1006   if (depth > max_depth)
1007     return false;
1008 
1009   std::vector<XID> windows;
1010   std::vector<XID>::iterator iter;
1011   if (depth == 0) {
1012     XMenuList::GetInstance()->InsertMenuWindowXIDs(&windows);
1013     // Enumerate the menus first.
1014     for (iter = windows.begin(); iter != windows.end(); iter++) {
1015       if (delegate->ShouldStopIterating(*iter))
1016         return true;
1017     }
1018     windows.clear();
1019   }
1020 
1021   XID root, parent, *children;
1022   unsigned int num_children;
1023   int status = XQueryTree(gfx::GetXDisplay(), window, &root, &parent, &children,
1024                           &num_children);
1025   if (status == 0)
1026     return false;
1027 
1028   for (int i = static_cast<int>(num_children) - 1; i >= 0; i--)
1029     windows.push_back(children[i]);
1030 
1031   XFree(children);
1032 
1033   // XQueryTree returns the children of |window| in bottom-to-top order, so
1034   // reverse-iterate the list to check the windows from top-to-bottom.
1035   for (iter = windows.begin(); iter != windows.end(); iter++) {
1036     if (IsWindowNamed(*iter) && delegate->ShouldStopIterating(*iter))
1037       return true;
1038   }
1039 
1040   // If we're at this point, we didn't find the window we're looking for at the
1041   // current level, so we need to recurse to the next level.  We use a second
1042   // loop because the recursion and call to XQueryTree are expensive and is only
1043   // needed for a small number of cases.
1044   if (++depth <= max_depth) {
1045     for (iter = windows.begin(); iter != windows.end(); iter++) {
1046       if (EnumerateChildren(delegate, *iter, max_depth, depth))
1047         return true;
1048     }
1049   }
1050 
1051   return false;
1052 }
*/
}

function EnumerateAllWindows(shouldStopIteratingDelegate, max_depth) {
	//delegate is pointer to EnumerateWindowsDelegate*
	//max_depth is ostypes.INT

	var root = GetX11RootWindow();
	return EnumerateChildren(shouldStopIteratingDelegate, root, max_depth, 0);
/*
bool EnumerateAllWindows(EnumerateWindowsDelegate* delegate, int max_depth) {
1055   XID root = GetX11RootWindow();
1056   return EnumerateChildren(delegate, root, max_depth, 0);
1057 }
*/
}

function EnumerateTopLevelWindows(shouldStopIteratingDelegate) {
	//var stack = ostypes.XID(); //std::vector<XID> stack; // for the new school method
	if (/**/true || /**/ /*i cant figure out what they are doing in the else part of this so im just going with old school method*/ !GetXWindowStack(GetX11RootWindow(), stack.address())) {
		// Window Manager doesn't support _NET_CLIENT_LIST_STACKING, so fall back to old school enumeration of all X windows.  Some WMs parent 'top-level' windows in unnamed actual top-level windows (ion WM), so extend the search depth to all children of top-level windows.
		var kMaxSearchDepth = 1;
		var rez_EAW = EnumerateAllWindows(delegate, kMaxSearchDepth);
		console.info('debug-msg :: rez_EAW:', rez_EAW);
	} else {
		// Window Manager supports _NET_CLIENT_LIST_STACK so lets go with new school method
		//i dont udnerstand this i cant find XMenu functions anywhere in x11
		/*
		XMenuList::GetInstance()->InsertMenuWindowXIDs(&stack);
		std::vector<XID>::iterator iter;
		for (iter = stack.begin(); iter != stack.end(); iter++) {
			if (delegate->ShouldStopIterating(*iter)) {
				return;
			}
		}
		*/
	}
}

function GetStringProperty(window, property_name, value) {
	
}

function PropertyExists(window, property_name) {
	
}

function IsWindowFullScreen(window) {
	//window is ostypes.XID
}

function IsWindowVisible(window) {
	//window is ostypes.XID
}

function IsScreensaverWindow(window) {
	//window is ostypes.XID
	
	// It should occupy the full screen.
	if (!IsWindowFullScreen(window)) {
		return false;
	}
	
	// For xscreensaver, the window should have _SCREENSAVER_VERSION property.
	if (PropertyExists(window, '_SCREENSAVER_VERSION')) {
		return true;
	}
	
	// For all others, like gnome-screensaver, the window's WM_CLASS property should contain "screensaver".
	var value; //std::string ???
	if (!GetStringProperty(window, 'WM_CLASS', value.address)) {
		return false;
	}
	
	//return value.find("screensaver") != std::string::npos;
	
}

function IsWindowNamed(window) {
	//window is ostypes.XID
}

var finderDelegate = function(window) { //no special reason to make this a var func, other then personal preference as it makes it look like its not a main func but something utilized in sub, which it is utilized in subscope
	//delegate telling when to stop
	if (!IsWindowVisible(window) || !IsScreensaverWindow(window)) {
		return false;
	} else {
		return true;
	}
};

function ScreensaverWindowExists() {
	//returns bool

	if (!ui::GetXWindowStack(ui::GetX11RootWindow(), & stack)) {
		// Window Manager doesn't support _NET_CLIENT_LIST_STACKING, so fall back
		// to old school enumeration of all X windows.  Some WMs parent 'top-level'
		// windows in unnamed actual top-level windows (ion WM), so extend the
		// search depth to all children of top-level windows.
		const int kMaxSearchDepth = 1;
		
		var rez_ETLW = EnumerateTopLevelWindows(finderDelegate.address()); //EnumerateAllWindows(shouldStopIteratingDelegate, kMaxSearchDepth);
		console.info('debug-msg :: rez_ETLW:', rez_ETLW);
		return;
	}

	////////////////
	EnumerateTopLevelWindows(); //stop when have iterated through all windows at depth of 1 or have found screenscaever

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