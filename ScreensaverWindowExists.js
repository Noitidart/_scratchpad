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
	this.SCREEN = ctypes.StructType('Screen');
	this.STATUS = ctypes.int;
	this.TIME = ctypes.unsigned_long;
	this.UNSIGNED_CHAR = ctypes.unsigned_char;
	this.UNSIGNED_INT = ctypes.unsigned_int;
	this.UNSIGNED_LONG = ctypes.unsigned_long;
	this.VISUAL = ctypes.StructType('Visual');
	this.WINDOW = ctypes.unsigned_long;
	this.XID = ctypes.unsigned_long;
	
	// ADVANCED TYPES (ones that are equal to something predefined by me)
	this.COLORMAP = this.XID;
	if (/^(Alpha|hppa|ia64|ppc64|s390|x86_64)-/.test(Services.appinfo.XPCOMABI)) { // https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L45 // // http://mxr.mozilla.org/mozilla-central/source/configure.in
		this.CARD32 = this.UNSIGNED_INT;
	} else {
		this.CARD32 = this.UNSIGNED_LONG;
	}
	this.XWINDOWATTRIBUTES = ctypes.StructType('XWindowAttributes', [
		{ 'x': this.INT },
		{ 'y': this.INT },							/* location of window */
		{ 'width': this.INT },
		{ 'height': this.INT },						/* width and height of window */
		{ 'border_width': this.INT },				/* border width of window */
		{ 'depth': this.INT },						/* depth of window */
		{ 'visual': this.VISUAL.ptr },				/* the associated visual structure */
		{ 'root': this.WINDOW },					/* root of screen containing window */
		{ 'class': this.INT },						/* InputOutput, InputOnly*/
		{ 'bit_gravity': this.INT },				/* one of bit gravity values */
		{ 'win_gravity': this.INT },				/* one of the window gravity values */
		{ 'backing_store': this.INT },				/* NotUseful, WhenMapped, Always */
		{ 'backing_planes': this.UNSIGNED_LONG },	/* planes to be preserved if possible */
		{ 'backing_pixel': this.UNSIGNED_LONG },	/* value to be used when restoring planes */
		{ 'save_under': this.BOOL },				/* boolean, should bits under be saved? */
		{ 'colormap': this.COLORMAP },				/* color map to be associated with window */
		{ 'map_installed': this.BOOL },				/* boolean, is color map currently installed*/
		{ 'map_state': this.INT },					/* IsUnmapped, IsUnviewable, IsViewable */
		{ 'all_event_masks': this.LONG },			/* set of events all people have interest in*/
		{ 'your_event_mask': this.LONG },			/* my event mask */
		{ 'do_not_propagate_mask': this.LONG },		/* set of events that should not propagate */
		{ 'override_redirect': this.BOOL },			/* boolean value for override-redirect */
		{ 'screen': this.SCREEN.ptr }				/* back pointer to correct screen */
	]);
	
	
	// CONSTANTS
	// this has a bunch a bunch bunch of contants with references to .h file: https://github.com/hazelnusse/sympy-old/blob/65f802573e5963731a3e7e643676131b6a2500b8/sympy/thirdparty/pyglet/pyglet/window/xlib/xlib.py#L88
	this.ANYPROPERTYTYPE = this.ATOM(0);
	this.ISUNMAPPED = 0; //# /usr/include/X11/X.h:449 //Used in GetWindowAttributes reply
	this.ISUNVIEWABLE =  1; //# /usr/include/X11/X.h:450 //Used in GetWindowAttributes reply
	this.ISVIEWABLE = 2; //# /usr/include/X11/X.h:451 //Used in GetWindowAttributes reply
	this.NONE = 0; // /usr/include/X11/X.h:120
	this.SUCCESS = 0 // # /usr/include/X11/X.h:354
	this.XA_ATOM = 4;
	this.XA_WINDOW = 33;
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
	},
	//550   if (!XGetWindowAttributes(gfx::GetXDisplay(), window, &win_attributes))
	XGetWindowAttributes: function() {
		/* http://www.xfree86.org/4.4.0/XGetWindowAttributes.3.html
		 * Status XGetWindowAttributes(
		 *   Display			*display,
		 *   Window 			w,
		 *   XWindowAttributes	*window_attributes_return
		 * );
		 */
		return _lib('x11').declare('XGetWindowAttributes', ctypes.default_abi,
			ostypes.STATUS,					// return
			ostypes.DISPLAY.ptr,			// *display
			ostypes.WINDOW,					// *display_name
			ostypes.XWINDOWATTRIBUTES.ptr	// *window_attributes_return
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

//start - GetProperty and variants
function GetProperty(win, propertyName, params) {

	// ON SUCCESS: returns obj, returns object with key of data, and data_descriptor
	// ON FAIL: returns false
	// if `trueForReturnData_else_falseForReturnBool` is `false` then returns if `XGetWindowProperty` was successful or not
		// if false this will release the data
		
	//params is object of optionals:
		//max_length, if not specified, 1024 is used // 1024 because two places use it, for string prop on chromium: mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#830 // and zotero //chromium uses -1 for just returning bool and i dont see an xfree
		//property_type, if not specified ostypes.ANYPROPERTYTYPE is used
		//free_data, if not specified, it will be freed in function
		
	//free_data is js bool
	//max_length just js number
	//property_type is ostypes.INT
	
	var paramsDefaults = {
		free_data: true,
		max_length: 1024, // 1024 because two places use it, for string prop on chromium: mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#830 // and zotero //chromium uses -1 for just returning bool and i dont see an xfree
		property_type: ostypes.ANYPROPERTYTYPE
	}
	for (var p in paramsDefaults) {
		if (!(p in params)) {
			params[p] = paramsDefaults[p];
		}
	}
	// this function is a combination of chromium's GetProperty (http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#86) and zotero's (_X11GetProperty https://github.com/zotero/zotero/blob/15108eea3f099a5a39a145ed55043d1ed9889e6a/chrome/content/zotero/xpcom/integration.js#L571) // the reason i did this, i was originally going by chromium but i couldnt see where they were XFree'ing the data, it could be that because bytes returned was -1 there was no need to XFree, but this function also returns data which i can use in future

	var property_atom = GetAtom(property_name);
	var remaining_bytes = new ostypes.UNSIGNED_LONG();
	
	var actualTypeReturned = new ostypes.ATOM();
	var actualFormatReturned = new ostypes.INT();
	var NItemsReturned = new ostypes.UNSIGNED_LONG();
	var BytesAfterReturn = new ostypes.UNSIGNED_LONG();
	var DataReturned = new ostypes.UNSIGNED_CHAR.ptr()
	
	var rez_XGWP = _dec('XGetWindowProperty')(GetXDisplay(), win, GetAtom(propertyName), 0 /*offset into property data to read*/, params.max_length, false /*deleted*/, params.property_type, actualTypeReturned.address(), actualFormatReturned.address(), NItemsReturned.address(), BytesAfterReturn.address(), DataReturned.address());
	console.info('debug-msg :: rez_XGWP:', rez_XGWP);

	if (rez_XGWP) {
		//important note: make sure to XFree DataReturned
		var ret = {
			data: DataReturned,
			data_descriptor: {
				count: ctypes.cast(NItemsReturned, ostypes.UNSIGNED_INT).value,
				type: actualTypeReturned.value,
				format: actualFormatReturned.value
			}
		};
	} else {
		console.error('XGetWindowProperty failed to get data!', 'rez_XGWP:', rez_XGWP, uneval(rez_XGWP), rez_XGWP.toString());
		var ret = false;
		//throw new Error('XGetWindowProperty failed to get data! rez_XGWP: "' + rez_XGWP + '" toString: "' rez_XGWP.toString() + '"');
	}
	
	if (params.free_data) {
		if (rez_XGWP) {
			var rez_DXF = doXFree(DataReturned);
			if (!rez_DXF) {
				console.warn('debug-msg :: GetProperty failed to free memory, leak imminent!');
			}
		}
	} else {
		console.warn('debug-msg :: make sure you remember to free the data then');
	}
		
	return ret;
		/*
		what to do with rez of this func: https://github.com/zotero/zotero/blob/15108eea3f099a5a39a145ed55043d1ed9889e6a/chrome/content/zotero/xpcom/integration.js#L627
		ctypes.cast(rez.DataReturned, ostypes.WINDOW.array(rez.NItemsReturnedValue).ptr).contents;
		XFree(rez.data);
		*/
		/*
		//how to use from https://github.com/zotero/zotero/blob/15108eea3f099a5a39a145ed55043d1ed9889e6a/chrome/content/zotero/xpcom/integration.js#L625
		var res = _X11GetProperty(w, "_NET_CLIENT_LIST", XA_WINDOW) //33 xawin
					|| _X11GetProperty(w, "_WIN_CLIENT_LIST", XA_CARDINAL); //6 is cacard
		if(!res) return false;
		
		var nClients = res[1],
		clientList = ctypes.cast(res[0], X11Window.array(nClients).ptr).contents,
		foundName = new ctypes.char.ptr();
		for(var i=0; i<nClients; i++) {
			if(XFetchName(_x11Display, clientList.addressOfElement(i).contents,foundName.address())) {
				var foundNameString = undefined;
				
				try {
					foundNameString = foundName.readString();
				} catch(e) {}
				XFree(foundName);
				if(foundNameString === searchName) return clientList.addressOfElement(i).contents;			
			}
		}
		XFree(res[0]);
		*/
		
		/* chromium :: http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#85
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

function PropertyExists(window, property_name) {
	//returns
		//success: js true
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;
	
	var rez_GP = GetProperty(window, property_name, false, {max_length:1});
	if (rez_GP === false) {
		console.info('debug-msg :: PropertyExists - FALSE');
		return false;
	} else {
		console.info('debug-msg :: PropertyExists - TRUE');
		return rez_GP.data_descriptor.count > 0;
	}
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#665
	665 bool PropertyExists(XID window, const std::string& property_name) {
	666   XAtom type = None;
	667   int format = 0;  // size in bits of each item in 'property'
	668   unsigned long num_items = 0;
	669   unsigned char* property = NULL;
	670 
	671   int result = GetProperty(window, property_name, 1,
	672                            &type, &format, &num_items, &property);
	673   if (result != Success)
	674     return false;
	675 
	676   XFree(property);
	677   return num_items > 0;
	678 }
	*/
}

function GetIntProperty(window, property_name) {
	//returns
		//success: array of js int
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, {free_data:false, max_length:1}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.format != 8) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		console.warn('debug-msg :: in GetIntProperty more then 1 element returned in rez_GP.data array, will just return first element');
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: in GetIntProperty 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.LONG.array(rez_GP.data_descriptor.count).ptr).contents;
	var val = [];
	for (var i=0; i<rez_GP.data_descriptor.count; i++) {
		val.push(dataCasted.addressOfElement(i).contents);
	}
	doXFree(rez_GP.data);
	return val;
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#734
	734 bool GetIntProperty(XID window, const std::string& property_name, int* value) {
	735   XAtom type = None;
	736   int format = 0;  // size in bits of each item in 'property'
	737   unsigned long num_items = 0;
	738   unsigned char* property = NULL;
	739 
	740   int result = GetProperty(window, property_name, 1,
	741                            &type, &format, &num_items, &property);
	742   if (result != Success)
	743     return false;
	744 
	745   if (format != 32 || num_items != 1) {
	746     XFree(property);
	747     return false;
	748   }
	749 
	750   *value = static_cast<int>(*(reinterpret_cast<long*>(property)));
	751   XFree(property);
	752   return true;
	753 }
	*/
}

function GetStringProperty(window, property_name) {
	//returns
		//success: array of js strings
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, {free_data:false}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.format != 8) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		console.warn('debug-msg :: in GetStringProperty more then 1 element returned in rez_GP.data array, will just return first element');
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: in GetStringProperty 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.CHAR.array(rez_GP.data_descriptor.count).ptr).contents;
	var val = [];
	for (var i=0; i<rez_GP.data_descriptor.count; i++) {
		val.push(dataCasted.addressOfElement(i).contents);
	}
	doXFree(rez_GP.data);
	return val;
		
/*
830 bool GetStringProperty(
831     XID window, const std::string& property_name, std::string* value) {
832   XAtom type = None;
833   int format = 0;  // size in bits of each item in 'property'
834   unsigned long num_items = 0;
835   unsigned char* property = NULL;
836 
837   int result = GetProperty(window, property_name, 1024,
838                            &type, &format, &num_items, &property);
839   if (result != Success)
840     return false;
841 
842   if (format != 8) {
843     XFree(property);
844     return false;
845   }
846 
847   value->assign(reinterpret_cast<char*>(property), num_items);
848   XFree(property);
849   return true;
850 }
*/
}

function GetAtomArrayProperty(window, property_name, ) {
	//returns
		//success: array of ostypes.ATOMS
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, {free_data:false, max_length:~0}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.type != ostypes.XA_ATOM) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		console.warn('debug-msg :: in GetStringProperty more then 1 element returned in rez_GP.data array, will just return first element');
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: in GetStringProperty 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.CHAR.array(rez_GP.data_descriptor.count).ptr).contents;
	var val = [];
	for (var i=0; i<rez_GP.data_descriptor.count; i++) {
		val.push(dataCasted.addressOfElement(i).contents);
	}
	doXFree(rez_GP.data);
	return val;
/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#804
//example usage by chromium: GetAtomArrayProperty(window, "_NET_WM_STATE", &wm_states)
804 bool GetAtomArrayProperty(XID window,
805                           const std::string& property_name,
806                           std::vector<XAtom>* value) {
807   XAtom type = None;
808   int format = 0;  // size in bits of each item in 'property'
809   unsigned long num_items = 0;
810   unsigned char* properties = NULL;
811 
812   int result = GetProperty(window, property_name,
813                            (~0L), // (all of them)
814                            &type, &format, &num_items, &properties);
815   if (result != Success)
816     return false;
817 
818   if (type != XA_ATOM) {
819     XFree(properties);
820     return false;
821   }
822 
823   XAtom* atom_properties = reinterpret_cast<XAtom*>(properties);
824   value->clear();
825   value->insert(value->begin(), atom_properties, atom_properties + num_items);
826   XFree(properties);
827   return true;
828 }
*/

}
//end - GetProperty and variants

function doXFree(data) {
	var rez_XF = _dec('XFree')(data);
	console.info('debug-msg :: rez_XF:', rez_XF);
	if (!rez_XF) {
		console.warn('debug-msg :: doXFree failed to free memory, leak imminent!');
	}
	return rez_XF;
}

function GetXWindowStack(window) {
	var rez_GP = GetProperty(window, '_NET_CLIENT_LIST_STACKING', {max_length:~0, free_data:false})
	if (!rez_GP) {
		return false;
	}
	
	console.info('debug-msg :: XWindowStack is available');
	var result = false;
	if (rez_GP.data_descriptor.type == ostypes.XA_WINDOW && rez_GP.data_descriptor.format == 32 && rez_GP.data_descriptor.count > 0) {
		result = true;
		var prestack_casted = ctypes.cast(rez_GP.data, ostypes.XID.array(rez_GP.data_descriptor.count).ptr).contents;
		for(var i=0; i<rez_GP.data_descriptor.count; i++) {
			stack.push(prestack_casted.addressOfElement(i).contents);
		}
		/*
		XID* stack = reinterpret_cast<XID*>(data);
		for (long i = static_cast<long>(count) - 1; i >= 0; i--)
		windows->push_back(stack[i]);
		*/
	}
	
	doXFree(rez_GP.data);
	
	return result;
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
		//this block is not needed: http://stackoverflow.com/questions/27587122/menu-enumeration-functions-in-x11#comment43604147_27587122
			// menu windows are just windows with _NET_WM_WINDOW_TYPE of _NET_WM_WINDOW_TYPE_MENU
			// OK if you look here you can see that a menu, for Mozilla, is just a window that has _NET_WM_WINDOW_TYPE property set to _NET_WM_WINDOW_TYPE_MENU. It's a menu "torn off" the main application and pinned to the desktop. You don't need any special library to detect this, just use normal property manipulation functions. I don't quite understand why a screensaver would need that though. –  n.m.
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
	
	doXFree(children);
	
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
	var stack = []; //js array of ostypes.XID // not: ostypes.XID.array(); //std::vector<XID> stack; // for the new school method
	var rez_GXWS = GetXWindowStack(GetX11RootWindow(), stack)
	if (!rez_GXWS) {
		// Window Manager doesn't support _NET_CLIENT_LIST_STACKING, so fall back to old school enumeration of all X windows.  Some WMs parent 'top-level' windows in unnamed actual top-level windows (ion WM), so extend the search depth to all children of top-level windows.
		var kMaxSearchDepth = 1;
		var rez_EAW = EnumerateAllWindows(delegate, kMaxSearchDepth);
		console.info('debug-msg :: rez_EAW:', rez_EAW);
	} else {
		// Window Manager supports _NET_CLIENT_LIST_STACK so lets go with new school method
		// this block below inserts the menu window items into the stack, we dont need this, i have no idea why chromium checks it
		/*
		XMenuList::GetInstance()->InsertMenuWindowXIDs(&stack);
		std::vector<XID>::iterator iter;
		for (iter = stack.begin(); iter != stack.end(); iter++) {
			if (delegate->ShouldStopIterating(*iter)) {
				return;
			}
		}
		*/
		for (var i=0; i<stack.length; i++) {
			if (shouldStopIteratingDelegate(stack[i])) {
				//screensaver window found!
				return true;
			}
		}
		//if it got here it didnt find the screensaver window
		return false;
	}
}

function IsWindowFullScreen(window) {
	//window is ostypes.XID
}

function GetWindowDesktop(window, desktop) {
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#984
	984 bool GetWindowDesktop(XID window, int* desktop) {
	985   return GetIntProperty(window, "_NET_WM_DESKTOP", desktop);
	986 }
	*/
	var rez_GIP = GetIntProperty(window, '_NET_WM_DESKTOP');
	if (rez_GIP !== false) {
		return rez_GIP;
	} else {
		console.warn('debug-msg :: failed to get window desktop');
		return false;
	}
}

function GetCurrentDesktop(desktop) {
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#508
	508 bool GetCurrentDesktop(int* desktop) {
	509   return GetIntProperty(GetX11RootWindow(), "_NET_CURRENT_DESKTOP", desktop);
	510 }
	*/
	var rez_GIP = GetIntProperty(window, '_NET_CURRENT_DESKTOP');
	if (rez_GIP !== false) {
		return rez_GIP;
	} else {
		console.warn('debug-msg :: failed to get current desktop');
		return false;
	}
}

function IsWindowVisible(window) {
	//window is ostypes.XID
	
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#546
546 bool IsWindowVisible(XID window) {
547   TRACE_EVENT0("ui", "IsWindowVisible");
548 
549   XWindowAttributes win_attributes;
550   if (!XGetWindowAttributes(gfx::GetXDisplay(), window, &win_attributes))
551     return false;
552   if (win_attributes.map_state != IsViewable)
553     return false;
554 
555   // Minimized windows are not visible.
556   std::vector<XAtom> wm_states; // array of atoms
557   if (GetAtomArrayProperty(window, "_NET_WM_STATE", &wm_states)) {
558     XAtom hidden_atom = GetAtom("_NET_WM_STATE_HIDDEN");
559     if (std::find(wm_states.begin(), wm_states.end(), hidden_atom) !=
560             wm_states.end()) {
561       return false;
562     }
563   }
564 
565   // Some compositing window managers (notably kwin) do not actually unmap
566   // windows on desktop switch, so we also must check the current desktop.
567   int window_desktop, current_desktop;
568   return (!GetWindowDesktop(window, &window_desktop) ||
569           !GetCurrentDesktop(&current_desktop) ||
570           window_desktop == kAllDesktops ||
571           window_desktop == current_desktop);
572 }
	*/
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
	var value = new ostypes.CHAR(); //std::string ???
	if (!GetStringProperty(window, 'WM_CLASS', value.address)) {
		return false;
	}
	
	var valueStr = value.readString();
	return valueStr.indexOf('screensaver') > -1; //return value.find("screensaver") != std::string::npos; //this c++ returns true if value contains "screensaver"
	
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