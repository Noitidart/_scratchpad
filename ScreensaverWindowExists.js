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
	/* https://github.com/foudfou/FireTray/blob/a0c0061cd680a3a92b820969b093cc4780dfb10c/src/modules/ctypes/linux/x11.jsm#L168
	 */
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
		dec[declaration] = preDec[declaration](); //if declaration is not in preDec then dev messed up
	}
	return dec[declaration];
}

var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev // do it alphabateized by key so its ez to look through
	DefaultRootWindow: function() {
		// MACRO
		// I created a  macro helper function in body outside of preDec, see it
		/* http://www.xfree86.org/4.4.0/DefaultRootWindow.3.html
		 * Window DefaultRootWindow(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XDefaultRootWindow', ctypes.default_abi,
			ostypes.WINDOW,		// return
			ostypes.DISPLAY.ptr	// *display_name
		);
	},
	DefaultScreenOfDisplay: function() {
		// MACRO
		// I created a  macro helper function in body outside of preDec, see it
		/* http://www.xfree86.org/4.4.0/DefaultScreenOfDisplay.3.html
		 * Screen *DefaultScreenOfDisplay(
		 *   Display	*display
		 * );
		 */
		return _lib('x11').declare('XDefaultScreenOfDisplay', ctypes.default_abi,
			ostypes.SCREEN,		// return
			ostypes.DISPLAY.ptr	// *display_name
		);
	},
	HeightOfScreen: function() {
		// MACRO
		/* http://www.xfree86.org/4.4.0/HeightOfScreen.3.html
		 * int HeightOfScreen(
		 *   Screen	*screen 
		 * );
		 */
		return _lib('x11').declare('XHeightOfScreen', ctypes.default_abi,
			ostypes.INT,		// return
			ostypes.SCREEN.ptr	// *display_name
		);
	},
	WidthOfScreen: function() {
		// MACRO
		/* http://www.xfree86.org/4.4.0/WidthOfScreen.3.html
		 * int WidthOfScreen(
		 *   Screen	*screen 
		 * );
		 */
		return _lib('x11').declare('XWidthOfScreen', ctypes.default_abi,
			ostypes.INT,		// return
			ostypes.SCREEN.ptr	// *display_name
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
	XGetGeometry: function() {
		/* http://www.xfree86.org/4.4.0/XGetGeometry.3.html
		 * Status XGetGeometry(
		 *   Display 		*display,
		 *   Drawable		d,
		 *   Window			*root_return,
		 *   int			*x_return,
		 *   int			*y_return,
		 *   unsigned int	*width_return,
		 *   unsigned int	*height_return,
		 *   unsigned int	*border_width_return,
		 *   unsigned int	*depth_return
		 * );
		 */
		return _lib('x11').declare('XGetGeometry', ctypes.default_abi,
			ostypes.STATUS,				// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.DRAWABLE,			// d
			ostypes.WINDOW.ptr,			// *root_return
			ostypes.INT.ptr,			// *x_return
			ostypes.INT.ptr,			// *y_return
			ostypes.UNSIGNED_INT.ptr,	// *width_return
			ostypes.UNSIGNED_INT.ptr,	// *height_return
			ostypes.UNSIGNED_INT.ptr,	// *border_width_return
			ostypes.UNSIGNED_INT.ptr	// *depth_return
		); 
	},
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
	XGetWMName: function() {
		/* http://www.xfree86.org/4.4.0/XGetWMName.3.html
		 * Status XGetWMName(
		 *   Display		*display,
		 *   Window			w,
		 *   XTextProperty	*text_prop_return 
		 * );
		 */
		 return _lib('x11').declare('XGetWMName', ctypes.default_abi,
			ostypes.STATUS,			// return
			ostypes.DISPLAY.ptr,	// *display
			ostypes.WINDOW,			// w
			ostypes.XTextProperty	// *text_prop_return
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
	XQueryTree: function() {
		/* http://www.xfree86.org/4.4.0/XQueryTree.3.html
		 * Status XQueryTree(
		 *   Display		*display,
		 *   Window			w,
		 *   Window			*root_return,
		 *   Window			*parent_return,
		 *   Window			**children_return,
		 *   unsigned int	*nchildren_return
		 * );
		 */
		return _lib('x11').declare('XQueryTree', ctypes.default_abi,
			ostypes.STATUS,				// return
			ostypes.DISPLAY.ptr,		// *display
			ostypes.WINDOW,				// w
			ostypes.WINDOW.ptr,			// *root_return
			ostypes.WINDOW.ptr,			// *parent_return
			ostypes.WINDOW.ptr.ptr,		// **children_return
			ostypes.UNSIGNED_INT.ptr	// *nchildren_return
		); 
	},
	XTranslateCoordinates: function() {
		/* http://www.xfree86.org/4.4.0/XTranslateCoordinates.3.html
		 * Bool XTranslateCoordinates(
		 *   Display	*display,
		 *   Window		src_w,
		 *   Window		dest_w,
		 *   int		src_x,
		 *   int		src_y,
		 *   int		*dest_x_return,
		 *   int		*dest_y_return,
		 *   Window		*child_return
		 * );
		 */
		return _lib('x11').declare('XTranslateCoordinates', ctypes.default_abi,
			ostypes.BOOL,			// return
			ostypes.DISPLAY.ptr,	// *display
			ostypes.WINDOW,			// src_w
			ostypes.WINDOW,			// dest_w
			ostypes.INT,			// src_x
			ostypes.INT,			// src_y
			ostypes.INT.ptr,		// *dest_x_return
			ostypes.INT.ptr,		// *dest_y_return
			ostypes.WINDOW.ptr		// *child_return
		); 
	},
}

/* start - main display and root window get and hold constant functions */
function OpenNewXDisplay() {
	//returns ostypes.DISPLAY
	//consider: http://mxr.mozilla.org/chromium/source/src/ui/gfx/x/x11_types.cc#26
	  // std::string display_str = base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII(switches::kX11Display);
	  // return XOpenDisplay(display_str.empty() ? NULL : display_str.c_str());
	  // i asked about it here: https://ask.mozilla.org/question/1321/proper-way-to-xopendisplay/
	
	return _dec('XOpenDisplay')(null);
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/gfx/x/x11_types.cc#22
	22 XDisplay* OpenNewXDisplay() {
	23 #if defined(OS_CHROMEOS)
	24   return XOpenDisplay(NULL);
	25 #else
	26   std::string display_str = base::CommandLine::ForCurrentProcess()->
	27                             GetSwitchValueASCII(switches::kX11Display);
	28   return XOpenDisplay(display_str.empty() ? NULL : display_str.c_str());
	29 #endif
	30 }
	*/
}

var GetXDisplayConst; //ostypes.DISPLAY // runtime defined constants
function GetXDisplay() { //two functions that hold const, GetX11RootWindow and GetXDisplay because some functions need the root window (like XFindWindow and XSendEvent) and others need the root display (like XGetWindowProperty and XSendEvent)
	//http://stackoverflow.com/questions/27602246/is-this-a-global
		//i posted here asking why are they doing if (!display) when they set display to null on line before, i want to know if i should make my `GetXDisplay` function have an argument of `getFreshDisp` meaning, even if display is held in `GetXDisplayConst` i open a new x display and overwrite the one in global
			//answer was, no dont override, get it into global once and hold it forever, on future calls to this func just return that global
	if (!GetXDisplayConst) {
		GetXDisplayConst = OpenNewXDisplay();
	}
	return GetXDisplayConst;
	/* http://mxr.mozilla.org/chromium/source/src/ui/gfx/x/x11_types.cc#15
	15 XDisplay* GetXDisplay() {
	16   static XDisplay* display = NULL;
	17   if (!display)
	18     display = OpenNewXDisplay();
	19   return display;
	20 }
	*/
}

function DefaultScreenOfDisplay(display) { //macro helper to the XDefaultScreenOfDisplay defined in preDec
	//not defined in chromium, i figured out this is XDefaultScreenOfDisplay from the xfree86 docs page
		//its described as: "The DefaultScreenOfDisplay macro returns the default screen of the specified display."
	
	//because the description says "of the specified display" i am not doing this like `GetXDisplay` func where i define global `GetXDisplayConst` and on future calls to `GetXDisplay` it recalls from the global if available
		//so i guess that this macro is NOT used JUST for the root display (which is: returned by `GetXDisplay`/held in `GetXDisplayConst`)
		//also im thinking a reason for not storing defaultscreen of the GetXDisplayConst (main/root display) is because it may be changing (like user changes monitor setup) but root never changes so we can just store that to global forever, thats why in c codes the make this GetXDisplayConst static (todo: could be worth asking about this someday, but not high priority as this is probably little overhead for possible better accuracy if my thinking [what i typed here in comments] is correct)
	return _dec('DefaultScreenOfDisplay')(display);
}

var DefaultRootWindowConst; // ostypes.XID // runtime defined constants
function DefaultRootWindow(disp) {  //macro helper to the XDefaultRootWindow defined in preDec
	// returns XID
	//not defined in chromium, i figured out this is XDefaultRootWindow from the xfree86 docs page
		//its described as: "The DefaultRootWindow macro returns the root window for the default screen."
	
	// im not sure if i should do the DefaultRootWindowConst technique that i do with GetXDisplay, GetXDisplay for sure is static GetXDisplayConst
	// for same reasoning in DefaultScreenOfDisplay, im thinking user may be able change the root window, but the main display (GetXDisplay/GetXDisplayConst) are not changeable
	// but DefaultRootWindow is ALWAYS called with GetXDisplay which is static. but maybe still user can change root window around so maybe dont do DefaultRootWindowConst
	
	/* // todo: worth asking in future, the overhead is low probably so priority is low
	if (!DefaultRootWindowConst) {
		DefaultRootWindowConst = _dec('DefaultRootWindow')(disp);
	}
	return DefaultRootWindowConst;
	*/
	return _dec('DefaultRootWindow')(disp);
}


function GetX11RootWindow() { //two functions that hold const, GetX11RootWindow and GetXDisplay because some functions need the root window (like XFindWindow and XSendEvent) and others need the root display (like XGetWindowProperty and XSendEvent)
	return DefaultRootWindow(GetXDisplay());
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#504
	504 XID GetX11RootWindow() {
	505   return DefaultRootWindow(gfx::GetXDisplay());
	506 }
	*/
}
/* end - main display and root window get and hold constant functions */

var GetAtomCache = {};
function GetAtom(name) {
	// name is ostypes.CHAR.ptr
	// returns ostypes.ATOM
	if (!(name in GetAtomCache)) {		
		var atom = _dec('XInternAtom')(GetXDisplay(), name, false); //passing 3rd arg of false, means even if atom doesnt exist it returns a created atom, this can be used with GetProperty to see if its supported etc, this is how Chromium does it
		if (atom == ostypes.NONE) { //will never equal ostypes.NONE because i pass 3rd arg of `false` to XInternAtom
			console.warn('No atom with name:', name, 'return val of atom:', atom, uneval(atom), atom.toString());
			throw new Error('No atom with name "' + name + '"), return val of atom:"' +  atom + '" toString:"' + atom.toString() + '"');
		}
		GetAtomCache[name] = atom;
	}
	return GetAtomCache[name];
}

//start - GetProperty and variants
function GetProperty(win, propertyName, max_length, params) {

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
	
	if (!params) {
		params = {};
	}
	var paramsDefaults = {
		free_data: true,
		//max_length: 1024, // 1024 because two places use it, for string prop on chromium: mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#830 // and zotero // but i think its cuz both the places i looked were looking to expect single string returned so maybe make this a required arg
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
	
	var rez_XGWP = _dec('XGetWindowProperty')(GetXDisplay(), win, GetAtom(propertyName), 0 /*offset into property data to read*/, max_length, false /*deleted*/, params.property_type, actualTypeReturned.address(), actualFormatReturned.address(), NItemsReturned.address(), BytesAfterReturn.address(), DataReturned.address());
	console.info('debug-msg :: rez_XGWP:', rez_XGWP);

	if (rez_XGWP) {
		//important note: make sure to XFree DataReturned
		//note: if params.free_data is true, then i might need to cast the DataReturned before freeing, which may still be too early, so if need data returned and freed, i probably have to cast the DataReturned and then push to array as values by doing .addresOfElement(i) on the casted THEN i can free it im pretty sure - so ill have to ask for dev to supply type they wanted it casted to
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
		console.info('debug-msg :: make sure you remember to free the data then');
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
	
	var rez_GP = GetProperty(window, property_name, false, 1); //by default will XFree the data
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

function GetTypeProperty(window, property_name, type, ret_array) {
	//this function gets a certain type, it checks the format, and count, and it returns it in js readable and frees the data
	
	//returns
		//success: js int if !ret_array
		//success: array js int if ret_array
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	switch (type) {
		case 'Atom':
			var castTo = ostypes.ATOM;
			var useMaxLenForNonRetArray = 1; //im guessing on this one, chromium never does GetProp for just one atom, ostypes.ATOM is = to ctypes.unsigned_long, so maybe whatever is the size of that
			var useFormatCheck = null;
			var useTypeCheck = ostypes.XA_ATOM;
			break;
		case 'Int':
			var castTo = ostypes.LONG; //i would expect ostypes.INT here but Chromium wants it casted to long
			var useMaxLenForNonRetArray = 1;
			var useFormatCheck = 32;
			var useTypeCheck = null;
			break;
		case 'String':
			var castTo = ostypes.CHAR;
			var useMaxLenForNonRetArray = 1024;
			var useFormatCheck = 8;
			var useTypeCheck = null;
			break;
		default:
			throw new Error('type not valid');
	}
	
	var rez_GP = GetProperty(window, property_name, ret_array ? useMaxLenForNotRetArray : -0x80000000 /*(~0L)*/ /*(all of them)*/, {free_data:false}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (useFormatCheck !== null) {
		if (rez_GP.data_descriptor.format != useFormatCheck) {
			console.warn('debug-msg :: returnedFormatCheck fail');
			doXFree(rez_GP.data);
			return false;
		}
	}
	if (useTypeCheck !== null) {
		if (rez_GP.data_descriptor.type != useTypeCheck) {
			console.warn('debug-msg :: returnedTypeCheck fail');
			doXFree(rez_GP.data);
			return false;
		}
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		if (!ret_array) {
			console.warn('debug-msg :: more then 1 element returned in rez_GP.data array, count:', rez_GP.data_descriptor.count, 'i will force fail this func');
			doXFree(rez_GP.data);
			return false;
		}
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, castTo.array(rez_GP.data_descriptor.count).ptr).contents;
	if (ret_array) {
		var val = [];
		for (var i=0; i<rez_GP.data_descriptor.count; i++) {
			val.push(dataCasted.addressOfElement(i).contents);
		}
	} else {
		var val = dataCasted.addressOfElement(0).contents;
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

function GetIntProperty(window, property_name, ret_array) {
	//returns
		//success: js int if !ret_array
		//success: array js int if ret_array
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, ret_array ? 1 : -0x80000000 /*(~0L)*/ /*(all of them)*/, {free_data:false}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.format != 32) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		if (!ret_array) {
			console.warn('debug-msg :: more then 1 element returned in rez_GP.data array, count:', rez_GP.data_descriptor.count, 'i will force fail this func');
			doXFree(rez_GP.data);
			return false;
		}
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.LONG.array(rez_GP.data_descriptor.count).ptr).contents;
	if (ret_array) {
		var val = [];
		for (var i=0; i<rez_GP.data_descriptor.count; i++) {
			val.push(dataCasted.addressOfElement(i).contents);
		}
	} else {
		var val = dataCasted.addressOfElement(0).contents;
		doXFree(rez_GP.data);
	}
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

function GetStringProperty(window, property_name, ret_array) {
	//returns
		//success: js int if !ret_array
		//success: array js int if ret_array
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, ret_array ? 1024 : -0x80000000 /*(~0L)*/ /*(all of them)*/, {free_data:false}); //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.format != 8) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		if (!ret_array) {
			console.warn('debug-msg :: more then 1 element returned in rez_GP.data array, count:', rez_GP.data_descriptor.count, 'i will force fail this func');
			doXFree(rez_GP.data);
			return false;
		}
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.CHAR.array(rez_GP.data_descriptor.count).ptr).contents;
	if (ret_array) {
		var val = [];
		for (var i=0; i<rez_GP.data_descriptor.count; i++) {
			val.push(dataCasted.addressOfElement(i).contents);
		}
	} else {
		var val = dataCasted.addressOfElement(0).contents;
		doXFree(rez_GP.data);
	}
	return val;
	////////////////////////
	/* //this was the orig GetStringProperty but i modded to be a merge of GetStringArrayProperty (although chromium doesnt seem to use GetStringArrayProperty, they dont have it defined)
	//returns
		//success: js string
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, {free_data:false, max_length:1024}); //will be using defaults of 1024 max_length and free_data //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.format != 8) {
		doXFree(rez_GP.data);
		return false;
	}
	
	if (rez_GP.data_descriptor.count > 1) {
		console.warn('debug-msg :: in GetStringProperty more then 1 element returned in rez_GP.data array, count:', rez_GP.data_descriptor.count, 'will just return first one');
	} else if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: in GetStringProperty 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.CHAR.array(rez_GP.data_descriptor.count).ptr).contents;
	//var val = [];
	//for (var i=0; i<rez_GP.data_descriptor.count; i++) {
		//val.push(dataCasted.addressOfElement(i).contents);
	//}
	var val = dataCasted.addressOfElement(0).contents;
	doXFree(rez_GP.data);
	return val;
	*/
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

function GetAtomArrayProperty(window, property_name) {
	//returns
		//success: array of ostypes.ATOMS
		//fail: js false
	//window is ostypes.WINDOW
	//property_name is js string;

	var rez_GP = GetProperty(window, property_name, -0x80000000 /*(~0L)*/ /*(all of them)*/, {free_data:false}); //will be using defaults of type //chromium uses type of NONE which is just 0
	if (rez_GP === false) {
		//nothing returned so no need to free
		return false;
	}
	
	if (rez_GP.data_descriptor.type != ostypes.XA_ATOM) {
		doXFree(rez_GP.data);
		return false;
	}
	
	/*if (rez_GP.data_descriptor.count > 1) {
		console.warn('debug-msg :: in GetStringProperty more then 1 element returned in rez_GP.data array, count:', rez_GP.data_descriptor.count);
	} else */if (rez_GP.data_descriptor.count == 0) {
		console.warn('debug-msg :: in GetStringProperty 0 elements returned in rez_GP.data array so return false, try XFree');
		var rez_DXF = doXFree(rez_GP.data);
		if (rez_DXF) {
			console.warn('debug-msg :: odd: DXF was success when reutrned count was 0');
		}
		return false;
	}
	
	var dataCasted = ctypes.cast(rez_GP.data, ostypes.ATOM.array(rez_GP.data_descriptor.count).ptr).contents;
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
	// returns stack on success
	// returns js false on fail
	var rez_GP = GetProperty(window, '_NET_CLIENT_LIST_STACKING', -0x80000000 /*(~0L)*/ /*(all of them)*/, {free_data:false});
	if (rez_GP === false) {
		//GP got no DataReturned so nothing to free
		return false;
	}
	
	console.info('debug-msg :: XWindowStack is available');
	var result = false;
	if (rez_GP.data_descriptor.type == ostypes.XA_WINDOW && rez_GP.data_descriptor.format == 32 && rez_GP.data_descriptor.count > 0) {
		var result = [];
		var prestack_casted = ctypes.cast(rez_GP.data, ostypes.XID.array(rez_GP.data_descriptor.count).ptr).contents;
		for(var i=0; i<rez_GP.data_descriptor.count; i++) {
			result.push(prestack_casted.addressOfElement(i).contents);
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

	
	var windows = []; // ostypes.XID
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
	
	var root = new ostypes.WINDOW(); //ostypes.XID
	var parent = new ostypes.WINDOW();; //ostypes.XID
	var children = new ostypes.WINDOW.ptr(); //ostypes.XID.array().ptr
	var num_children = new ostypes.UNSIGNED_INT();
	
	var rez_XQT = _dec('XQueryTree')(GetXDisplay(), window, root.address(), parent.address(), children.address(), num_children.address);
	
	if (rez_XQT == 0) {
		return false;
	}
	
	var num_children_value = ctypes.cast(num_children, ostypes.UNSIGNED_INT).value;
	var children_casted = ctypes.cast(children, ostypes.WINDOW.array(num_children_casted).ptr).contents;
	//i think now that it has been casted, its safe to free, im not sure
	console.info('debug-msg :: pre free children_casted:', uneval(children_casted));
	doXFree(children);
	console.info('debug-msg :: post free children_casted:', uneval(children_casted));
	//may need to do free after pushing into windows arr block here:	
	for (var i=num_children_value-1; i>=0; i--) {
		windows.push(children_casted.addressOfElement(i).contents);
	}
	
	// XQueryTree returns the children of |window| in bottom-to-top order, so reverse-iterate the list to check the windows from top-to-bottom.
	for (var i=0; i<windows.length; i++) {
		if (IsWindowNamed(windows[i]) && shouldStopIteratingDelegate(windows[i])) {
			return true;
		}
	}
	
	// If we're at this point, we didn't find the window we're looking for at the current level, so we need to recurse to the next level.  We use a second loop because the recursion and call to XQueryTree are expensive and is only needed for a small number of cases.
	depth++
	if (depth <= max_depth) {
		for (var i=0; i<windows.length; i++) {
			if (EnumerateChildren(shouldStopIteratingDelegate, windows[i], max_depth, depth)) {
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
	//returns js bool based on delegate

	var rez_GXWS = GetXWindowStack(GetX11RootWindow())
	if (!rez_GXWS) {
		// Window Manager doesn't support _NET_CLIENT_LIST_STACKING, so fall back to old school enumeration of all X windows.  Some WMs parent 'top-level' windows in unnamed actual top-level windows (ion WM), so extend the search depth to all children of top-level windows.
		var kMaxSearchDepth = 1;
		var rez_EAW = EnumerateAllWindows(shouldStopIteratingDelegate, kMaxSearchDepth);
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
		for (var i=0; i<rez_GXWS.length; i++) {
			if (shouldStopIteratingDelegate(rez_GXWS[i])) {
				return true;
			}
		}
		//if got to this point then screensaver window not found
		return false;
	}
}

var WmSupportsHintCache = {};
function WmSupportsHint(atom_name) {
	// returns js bool
	if (!(atom_name in WmSupportsHintCache)) {
		var atom = GetAtom(atom_name);
		var rez_GAAP = GetAtomArrayProperty(GetX11RootWindow(), '_NET_SUPPORTED');
		if (rez_GAAP === false) {
			//atom_name passed to GAAP is not supported
			return false;
		} else {
			for (var i=0; i<rez_GAAP.length; i++) {
				if (rez_GAAP[i] == atom) {
					WmSupportsHintCache[atom_name] = true;
					break;
				}
			}
			//if got here then it doesnt support this atom_name
			WmSupportsHintCache[atom_name] = false;
		}
	}
	return WmSupportsHintCache[atom_name];
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#1259
	1259 bool WmSupportsHint(XAtom atom) {
	1260   std::vector<XAtom> supported_atoms;
	1261   if (!GetAtomArrayProperty(GetX11RootWindow(),
	1262                             "_NET_SUPPORTED",
	1263                             &supported_atoms)) {
	1264     return false;
	1265   }
	1266 
	1267   return std::find(supported_atoms.begin(), supported_atoms.end(), atom) !=
	1268       supported_atoms.end();
	1269 }
	*/
}

function Size() {

}

function GetWindowRect(window) {
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#574
	574 bool GetWindowRect(XID window, gfx::Rect* rect) {
	575   Window root, child;
	576   int x, y;
	577   unsigned int width, height;
	578   unsigned int border_width, depth;
	579 
	580   if (!XGetGeometry(gfx::GetXDisplay(), window, &root, &x, &y,
	581                     &width, &height, &border_width, &depth))
	582     return false;
	583 
	584   if (!XTranslateCoordinates(gfx::GetXDisplay(), window, root,
	585                              0, 0, &x, &y, &child))
	586     return false;
	587 
	588   *rect = gfx::Rect(x, y, width, height);
	589 
	590   std::vector<int> insets;
	591   if (GetIntArrayProperty(window, "_NET_FRAME_EXTENTS", &insets) &&
	592       insets.size() == 4) {
	593     rect->Inset(-insets[0], -insets[2], -insets[1], -insets[3]);
	594   }
	595   // Not all window managers support _NET_FRAME_EXTENTS so return true even if
	596   // requesting the property fails.
	597 
	598   return true;
	599 }
	*/
}

function IsX11WindowFullScreen(window) {
	//window is ostypes.XID
	// If _NET_WM_STATE_FULLSCREEN is in _NET_SUPPORTED, use the presence or absence of _NET_WM_STATE_FULLSCREEN in _NET_WM_STATE to determine whether we're fullscreen.
	var fullscreen_atom = GetAtom('_NET_WM_STATE_FULLSCREEN');
	if (WmSupportsHint('_NET_WM_STATE_FULLSCREEN')) {
		var atom_properties = GetAtomArrayProperty(window, '_NET_WM_STATE');
		if (atom_properties === false) {
			//GetAtomArrayProperty error'ed probably
			return false;
		} else {
			for (var i=0; i<atom_properties.length; i++) {
				if (atom_properties[i] == fullscreen_atom) {
					return true;
				}
			}
			//if got here then its not full screen
			return false;
		}
		///
	}
	
	var window_rect = GetWindowRect(window);
	if (window_rect === false) {
		return false;
	}
	
	var disp = GetXDisplay();
	var screen = DefaultScreenOfDisplay(disp);
	
	var width = WidthOfScreen(screen);
	var height = HeightOfScreen(screen);
	return window_rect.size() == Size(width, height);
	
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#1226
	1226 bool IsX11WindowFullScreen(XID window) {
	1227   // If _NET_WM_STATE_FULLSCREEN is in _NET_SUPPORTED, use the presence or
	1228   // absence of _NET_WM_STATE_FULLSCREEN in _NET_WM_STATE to determine
	1229   // whether we're fullscreen.
	1230   XAtom fullscreen_atom = GetAtom("_NET_WM_STATE_FULLSCREEN");
	1231   if (WmSupportsHint(fullscreen_atom)) {
	1232     std::vector<XAtom> atom_properties;
	1233     if (GetAtomArrayProperty(window,
	1234                              "_NET_WM_STATE",
	1235                              &atom_properties)) {
	1236       return std::find(atom_properties.begin(),
	1237                        atom_properties.end(),
	1238                        fullscreen_atom) !=
	1239           atom_properties.end();
	1240     }
	1241   }
	1242 
	1243   gfx::Rect window_rect;
	1244   if (!ui::GetWindowRect(window, &window_rect))
	1245     return false;
	1246 
	1247   // We can't use gfx::Screen here because we don't have an aura::Window. So
	1248   // instead just look at the size of the default display.
	1249   //
	1250   // TODO(erg): Actually doing this correctly would require pulling out xrandr,
	1251   // which we don't even do in the desktop screen yet.
	1252   ::XDisplay* display = gfx::GetXDisplay();
	1253   ::Screen* screen = DefaultScreenOfDisplay(display);
	1254   int width = WidthOfScreen(screen);
	1255   int height = HeightOfScreen(screen);
	1256   return window_rect.size() == gfx::Size(width, height);
	1257 }
	*/
}

function GetWindowDesktop(window) {
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

function GetCurrentDesktop() {
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#508
	508 bool GetCurrentDesktop(int* desktop) {
	509   return GetIntProperty(GetX11RootWindow(), "_NET_CURRENT_DESKTOP", desktop);
	510 }
	*/
	var rez_GIP = GetIntProperty(GetX11RootWindow(), '_NET_CURRENT_DESKTOP');
	if (rez_GIP !== false) {
		return rez_GIP;
	} else {
		console.warn('debug-msg :: failed to get current desktop');
		return false;
	}
}

function IsWindowVisible(window) {
	//window is ostypes.XID
	
	var win_attributes = new ostypes.XWINDOWATTRIBUTES();
	var rez_XGWA = _dec('XGetWindowAttributes')(GetXDisplay(), window, win_attributes.address());
	if (!rez_XGWA) {
		return false;
	} else {
		if (win_attributes.map_state != ostypes.ISVIEWABLE) {
			return false;
		}
	}
	
	// Minimized windows are not visible.
	var wm_states = GetAtomArrayProperty(window, '_NET_WM_STATE');
	if (wm_states === false) {
		//GetAtomArrayProperty error'ed probably
		return false;
	} else {
		var hidden_atom = GetAtom('_NET_WM_STATE_HIDDEN');
		for (var i=0; i<wm_states.length; i++) {
			if (wm_states[i] == hidden_atom) {
				return false;
			}
		}
	}
	
	// Some compositing window managers (notably kwin) do not actually unmap windows on desktop switch, so we also must check the current desktop.
	var kAlLDesktops = 0; // this is kwin constant i guess based on this comment in chromium here: http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#565
	var window_desktop = GetWindowDesktop(window);
	if (window_desktop === false) {
		return false;
	}
	var current_desktop = GetCurrentDesktop();
	if (current_desktop === false) {
		//weird user has no desktop O_O
		return false;
	}
	if (window_desktop == kAllDesktops || window_desktop == current_desktop) {
		return true;
	} else {
		return false;
	}
	/* http://mxr.mozilla.org/chromium/source/src/ui/views/widget/desktop_aura/desktop_window_tree_host_x11.cc#76
		74 // Special value of the _NET_WM_DESKTOP property which indicates that the window
		75 // should appear on all desktops.
		76 const int kAllDesktops = 0xFFFFFFFF;
	*/
	
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
	if (!IsX11WindowFullScreen(window)) {
		return false;
	}
	
	// For xscreensaver, the window should have _SCREENSAVER_VERSION property.
	if (PropertyExists(window, '_SCREENSAVER_VERSION')) {
		return true;
	}
	
	// For all others, like gnome-screensaver, the window's WM_CLASS property should contain "screensaver".
	var rez_GSP = GetStringProperty(window, 'WM_CLASS');
	if (rez_GSP === false) {
		return false;
	} else {
		/*
		for (var i=0; i<rez_GSP.length; i++) {
			if (rez_GSP[o].indexOf('screensaver') > -1) {
				return true;
			}
		}
		*/
		//return valueStr.indexOf('screensaver') > -1; //return value.find("screensaver") != std::string::npos; //this c++ returns true if value contains "screensaver"
	}
	/* http://mxr.mozilla.org/chromium/source/src/chrome/browser/screensaver_window_finder_x11.cc#29
	28 
	29 bool ScreensaverWindowFinder::IsScreensaverWindow(XID window) const {
	30   // It should occupy the full screen.
	31   if (!ui::IsX11WindowFullScreen(window))
	32     return false;
	33 
	34   // For xscreensaver, the window should have _SCREENSAVER_VERSION property.
	35   if (ui::PropertyExists(window, "_SCREENSAVER_VERSION"))
	36     return true;
	37 
	38   // For all others, like gnome-screensaver, the window's WM_CLASS property
	39   // should contain "screensaver".
	40   std::string value;
	41   if (!ui::GetStringProperty(window, "WM_CLASS", &value))
	42     return false;
	43 
	44   return value.find("screensaver") != std::string::npos;
	45 }
	46 
	*/
}

function IsWindowNamed(window) {
	//returns js bool
	//window is ostypes.XID
	
	var prop = new ostypes.XTextProperty();
	var rez_XGWN = _dec('XGetWMName')(GetXDisplay(), window, prop.address());
	
	if (rez_XGWN == 0) { //on success it is non-0
		console.warn('debug-msg :: XGetWMName failed due to error maybe, rez_XGWN:', rez_XGWN);
		return false;
	}
	
	console.info('debug-msg :: prop.value:', prop.value);
	console.info('debug-msg :: prop:', uneval(prop));
	
	if (prop.value.isNull()) {
		return false;
	} else {		
		//chromium does XFree(prop.value) but in my github searches i see this is only done if they do a `Xutf8TextPropertyToTextList` then they do XFree on prop.value or if they do `XmbTextPropertyToTextList` they they use `XFreeStringList`
		//so i dont think i have to: but i just do it to see what the free ret value is on it
		var rez_DXF = doXFree(prop.value);
		console.info('debug-msg :: XFree on prop.value result is, rez_DXF:', rez_DXF, 'im expecting it should maybe fail due to my comment two lines above');
		return true;
	}
	/* http://mxr.mozilla.org/chromium/source/src/ui/base/x/x11_util.cc#994
	994 // Returns true if |window| is a named window.
	995 bool IsWindowNamed(XID window) {
	996   XTextProperty prop;
	997   if (!XGetWMName(gfx::GetXDisplay(), window, &prop) || !prop.value)
	998     return false;
	999 
	1000   XFree(prop.value);
	1001   return true;
	1002 }
	*/
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
	//returns js bool
	var rez_ETLW = EnumerateTopLevelWindows(finderDelegate);
	console.info('debug-msg :: rez_ETLW:', rez_ETLW);
	return rez_ETLW;
}

//setTimeout(function() {
	var rez_SWE = ScreensaverWindowExists();
	console.info('debug-msg :: rez_SWE:', rez_SWE);

	for (var l in lib) {
		lib[l].close();
	}
//}, 65000);