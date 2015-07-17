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
function jscEqual(obj1, obj2) {
	// ctypes numbers equal
	// compares obj1 and obj2
	// if equal returns true, else returns false
	
	// check if equal first
	var str1 = obj1;
	var str2 = obj2;
	
	var setToDeepest = function(obj) {
		while (isNaN(obj) && ('contents' in obj || 'value' in obj)) {
			if ('contents' in obj) {
				obj = obj.contents;
			} else if ('value' in obj) {
				obj = obj.value
			} else {
				throw new Error('huh, isNaN, but no contents or value in obj', 'obj:', obj);
			}
		}
		if (!isNaN(obj)) {
			obj = obj.toString();
		}
		
		return obj;
	}
	
	var str1 = setToDeepest(str1); //cuz apparently its not passing by reference
	var str2 = setToDeepest(str2); //cuz apparently its not passing by reference
	
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
	
	//// this block here works, it changes the title of the window
	// var myXData = ostypes.UNSIGNED_CHAR.array()('ppbeta');
	// console.info('myXData:', myXData, myXData.toString(), uneval(myXData));
	// var xcpArg = {
		// $display:	/*INT*/					GetXDisplay(),
		// w:			/*DISPLAY.ptr*/			xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')),
		// property:	/*WINDOW*/				GetAtom('WM_NAME'), //may need to change to _NET_WM_NAME
		// type:		/*ATOM*/				GetAtom('UTF8_STRING'),
		// format:		/*INT*/					8,
		// mode:		/*INT*/					ostypes.PROPMODEREPLACE,
		// $data:		/*UNSIGNED_CHAR.ptr*/	myXData,
		// nelements:	/*INT*/					myXData.length
	// };
	// var rez_XChangeProp = _dec('XChangeProperty')(xcpArg.$display, xcpArg.w, xcpArg.property, xcpArg.type, xcpArg.format, xcpArg.mode, xcpArg.$data, xcpArg.nelements);	
	// console.info('rez_XChangeProp:', rez_XChangeProp, rez_XChangeProp.toString(), uneval(rez_XChangeProp));
	
		
	//var myJsDataLong = ['16', '16', '16777215','50331648','117440512','117440512','117440512','117440512','117440512','117440512','117440512','117440512','117440512','117440512','117440512','117440512','50331648','16777215','117440512','-179727685','-13794122','-7501709','-2579612','-12091753','-11689787','-8663845','-8729638','-12612424','-12360329','-4941740','-670645','-342721','-106524059','117440512','520093696','-1924502','-3243974','-1669338','-9017258','-15895118','-13397058','-10042412','-10042412','-13991247','-16164456','-16298359','-10130877','-600557','-137156','520093696','587202560','-2000091','-2199019','-2199024','-8563138','-15965032','-11755851','-10108719','-10042669','-13596748','-16164712','-15902826','-16233077','-12693681','-669681','587202560','587202560','-2066396','-2133221','-2660335','-3126519','-2206455','-5019855','-10505018','-11227448','-13004873','-13005900','-10636341','-11559489','-16434316','-4224992','587202560','654311424','-2066654','-2133221','-2133221','-1666476','-1001601','-7692655','-10307379','-11557437','-10767926','-10636854','-12744270','-11428673','-14722936','-3237322','654311424','654311424','-2066655','-2133221','-2066657','-2324167','-10773841','-10572087','-10506038','-10506038','-10901050','-15904626','-15839603','-14326887','-11563857','-1390041','654311424','687865856','-2132705','-2923495','-3510485','-4092338','-11497296','-10837309','-10771004','-10771004','-10837053','-13536862','-16434563','-15975303','-14068866','-802546','687865856','704643072','-5755123','-6086910','-8760247','-11696978','-11563854','-11234117','-11168068','-11168068','-11233860','-12485462','-16502669','-16570265','-7640013','-548596','704643072','721420288','-5100540','-4246015','-3513571','-10724253','-12162676','-10721420','-7048367','-8553877','-11961433','-12751710','-16044432','-16638627','-1590456','-481270','721420288','754974720','-3127291','-2274304','-2203377','-2133221','-2133221','-2133221','-2264291','-2256322','-11182995','-16639135','-16770980','-16312757','-666027','-413935','754974720','771751936','-2068969','-2007285','-2138099','-5887736','-5492214','-4896748','-6795731','-12760969','-14600580','-16772007','-13555655','-5738717','-268799','-479193','771751936','805306368','-2132966','-2199019','-2133992','-3249890','-10996944','-16312751','-13880445','-15720598','-13880957','-12571067','-2855395','-1337332','-935936','-274084','805306368','822083584','-2066404','-2199024','-2133226','-2199021','-2133223','-5219036','-9749959','-9225160','-7386577','-2658787','-2132966','-1669883','-871912','-134302','822083584','520093696','-106147016','-2794469','-2198244','-2066144','-2066148','-1933785','-1867216','-1867215','-1933779','-2000089','-2135789','-1602038','-132835','-104553172','520093696','50331648','822083584','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','1493172224','822083584','50331648'];
	var myJsDataLong = [];
	var sizesWanted = [16,22,24,48];
	for (var h=0; h<sizesWanted.length; h++) {
		myJsDataLong.push(sizesWanted[h] + '');
		myJsDataLong.push(sizesWanted[h] + '');
		for (var i=0; i<Math.pow(sizesWanted[h], 2); i++) {
			myJsDataLong.push('-2579612');
		}
	}
	console.log('myJsDataLong.length:', myJsDataLong.length);
		
    for (var i=0; i<myJsDataLong.length; i++) {
      myJsDataLong[i] = ctypes.Int64(myJsDataLong[i]);
    }
	var myXDataLONG = ostypes.LONG.array()(myJsDataLong);
	var myXData = ctypes.cast(myXDataLONG.address(), ostypes.UNSIGNED_CHAR.array(myXDataLONG.length).ptr).contents;
	var xgpArg = {
		$display:	/*INT*/					GetXDisplay(),
		w:			/*DISPLAY.ptr*/			xidFromXULWin(Services.wm.getMostRecentWindow('navigator:browser')),
		property:	/*WINDOW*/				GetAtom('_NET_WM_ICON'),
		type:		/*ATOM*/				ostypes.XA_CARDINAL,
		format:		/*INT*/					32,
		mode:		/*INT*/					ostypes.PROPMODEREPLACE,
		$data:		/*UNSIGNED_CHAR.ptr*/	myXData,
		nelements:	/*INT*/					myXData.length
	};
	var rez_XChangeProp = _dec('XChangeProperty')(xgpArg.$display, xgpArg.w, xgpArg.property, xgpArg.type, xgpArg.format, xgpArg.mode, xgpArg.$data, xgpArg.nelements);
	console.info('rez_XChangeProp:', rez_XChangeProp, rez_XChangeProp.toString(), uneval(rez_XChangeProp));
	
	//// maybe try map win to get icon to change
	// var rez_XMapWin = _dec('XMapWindow')(GetXDisplay(), xgpArg.w);
	// console.info('rez_XMapWin:', rez_XMapWin, rez_XMapWin.toString(), uneval(rez_XMapWin));
	// var myE = new ostypes.XEVENT();
	// var rez_XNxtEv = _dec('XNextEvent')(GetXDisplay(), myE.address()); // dont do this next event stuff it freezes stuff up and i have to force quit firefox
	// console.info('rez_XNxtEv:', rez_XNxtEv, rez_XNxtEv.toString(), uneval(rez_XNxtEv));

	//// maybe try flush
	// var rez_XFlush = _dec('XFlush')(GetXDisplay());
	// console.info('rez_XFlush:', rez_XFlush, rez_XFlush.toString(), uneval(rez_XFlush));
    
    //// maybe try updating WMHints like this guy does here: https://github.com/benizi/config-bin/blob/master/set-icon.py#L66
	// i tried it, didnt work: https://gist.github.com/Noitidart/f426bae5b0d7782c98bd
}

try {
	main();
} catch(ex) {
	console.error('error:', ex);
} finally {
	shutdown();
}